import { Vehicle, WantedVehicle, MatchResult } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';

/**
 * Normaliza un string quitando acentos, espacios extra y convirtiendo a minúsculas.
 */
export function normalizeText(str: string | null | undefined): string {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

/**
 * Normalización de marcas para tolerar alias comunes (ej: VW <-> Volkswagen).
 */
const BRAND_ALIASES: Record<string, string> = {
    'vw': 'volkswagen',
    'volks': 'volkswagen',
    'mercedes': 'mercedes-benz',
    'mb': 'mercedes-benz',
    'chev': 'chevrolet',
    'chevy': 'chevrolet',
    'toy': 'toyota',
    'citroen': 'citroën'
};

function getCanonicalBrand(brand: string): string {
    const norm = normalizeText(brand);
    return BRAND_ALIASES[norm] || norm;
}

/**
 * Motor de Cálculo de Coincidencias entre un Vehículo en Stock y un Pedido de Búsqueda de Cliente.
 * Retorna un Score de 0 a 100 con desglose detallado y puntos destacados.
 */
export function calculateMatchScore(
    vehicle: Vehicle,
    wanted: WantedVehicle
): MatchResult {
    const highlights: string[] = [];
    let brandScore = 0;
    let modelScore = 0;
    let yearScore = 0;
    let priceScore = 0;
    let transmissionScore = 0;
    let mileageScore = 0;

    const vBrand = getCanonicalBrand(vehicle.brand);
    const wBrand = getCanonicalBrand(wanted.brand);

    const vModel = normalizeText(vehicle.model);
    const wModel = normalizeText(wanted.model);

    const vVersion = normalizeText(vehicle.version || '');
    const wVersion = normalizeText(wanted.version || '');

    // 1. MARCA (Max 30 pts)
    const isBrandExact = vBrand === wBrand;
    if (isBrandExact) {
        brandScore = 30;
        highlights.push(`Marca exacta (${vehicle.brand})`);
    } else if (wanted.accepts_similar_model) {
        // Misma carrocería (ej: Pickup Amarok vs Ranger)
        if (wanted.body_type && vehicle.body_type === wanted.body_type) {
            brandScore = 15;
            highlights.push(`Categoría similar (${vehicle.body_type})`);
        } else {
            brandScore = 8;
        }
    } else {
        // Filtro estricto sin tolerancia
        brandScore = 0;
    }

    // 2. MODELO (Max 30 pts)
    const isModelExact = vModel === wModel;
    const isModelContained = vModel.includes(wModel) || wModel.includes(vModel);

    if (isModelExact) {
        modelScore = 30;
        highlights.push(`Modelo exacto (${vehicle.model})`);
    } else if (isModelContained) {
        modelScore = 25;
        highlights.push(`Modelo coincidente (${vehicle.model})`);
    } else if (wanted.accepts_similar_model) {
        if (wanted.body_type && vehicle.body_type === wanted.body_type) {
            modelScore = 15;
            highlights.push(`Segmento alternativo compatible`);
        } else {
            modelScore = 5;
        }
    } else {
        modelScore = 0;
    }

    // Si NO acepta similar y la marca/modelo difieren totalmente, el score global es 0
    if (!wanted.accepts_similar_model && (!isBrandExact || !isModelContained)) {
        return {
            score: 0,
            level: 'LOW',
            breakdown: { brandScore: 0, modelScore: 0, yearScore: 0, priceScore: 0, transmissionScore: 0, mileageScore: 0 },
            highlights: ['No coincide modelo estricto solicitado'],
            vehicle,
            wantedVehicle: wanted
        };
    }

    // Evaluación de Versión
    if (wVersion && vVersion) {
        if (vVersion.includes(wVersion) || wVersion.includes(vVersion)) {
            highlights.push(`Versión coincidente (${vehicle.version})`);
        } else if (!wanted.accepts_different_version) {
            // Penalización si no acepta otra versión
            modelScore = Math.max(0, modelScore - 10);
        }
    }

    // 3. AÑO (Max 15 pts)
    const vYear = vehicle.year;
    const yMin = wanted.year_min || 1990;
    const yMax = wanted.year_max || 2050;

    if (vYear >= yMin && vYear <= yMax) {
        yearScore = 15;
        highlights.push(`Año ${vYear} dentro del rango buscado (${wanted.year_min || '—'} - ${wanted.year_max || '—'})`);
    } else if (wanted.accepts_nearby_year) {
        const diff = Math.min(Math.abs(vYear - yMin), Math.abs(vYear - yMax));
        if (diff === 1) {
            yearScore = 10;
            highlights.push(`Año ${vYear} muy cercano al rango deseado (tolerancia +/- 1 año)`);
        } else if (diff === 2) {
            yearScore = 5;
            highlights.push(`Año ${vYear} cercano (+/- 2 años)`);
        }
    }

    // 4. PRESUPUESTO / PRECIO (Max 15 pts)
    const vPrice = vehicle.sale_price || 0;
    const wBudget = wanted.max_budget || 0;

    if (wBudget <= 0) {
        priceScore = 15; // Si no especificó tope de presupuesto, otorga puntaje completo
    } else if (vPrice <= wBudget) {
        priceScore = 15;
        highlights.push(`Precio ${formatARS(vPrice)} dentro del presupuesto (${formatARS(wBudget)})`);
    } else if (vPrice <= wBudget * 1.08) {
        priceScore = 10;
        highlights.push(`Precio ${formatARS(vPrice)} apenas superior al presupuesto (+8%)`);
    } else if (vPrice <= wBudget * 1.15) {
        priceScore = 5;
        highlights.push(`Precio con 15% de margen sobre presupuesto`);
    } else {
        priceScore = 0;
    }

    // 5. TRANSMISIÓN (Max 5 pts)
    if (!wanted.transmission || wanted.transmission === ('' as any)) {
        transmissionScore = 5;
    } else if (wanted.transmission === vehicle.transmission) {
        transmissionScore = 5;
        highlights.push(`Transmisión ${vehicle.transmission}`);
    } else {
        transmissionScore = 0;
    }

    // 6. KILOMETRAJE (Max 5 pts)
    if (!wanted.max_mileage || wanted.max_mileage <= 0) {
        mileageScore = 5;
    } else if (vehicle.mileage <= wanted.max_mileage) {
        mileageScore = 5;
        highlights.push(`Kilometraje (${vehicle.mileage.toLocaleString('es-AR')} km) bajo el límite`);
    } else if (vehicle.mileage <= wanted.max_mileage * 1.1) {
        mileageScore = 3;
    } else {
        mileageScore = 0;
    }

    // Permuta agregada como highlight
    if (wanted.has_trade_in && wanted.trade_in_details) {
        highlights.push(`Entrega permuta: ${wanted.trade_in_details}`);
    }

    const totalScore = Math.min(100, Math.round(brandScore + modelScore + yearScore + priceScore + transmissionScore + mileageScore));

    let level: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (totalScore >= 80) {
        level = 'HIGH';
    } else if (totalScore >= 60) {
        level = 'MEDIUM';
    }

    return {
        score: totalScore,
        level,
        breakdown: {
            brandScore,
            modelScore,
            yearScore,
            priceScore,
            transmissionScore,
            mileageScore
        },
        highlights,
        vehicle,
        wantedVehicle: wanted
    };
}

/**
 * Genera el texto del mensaje sugerido de WhatsApp firmado por Hernán.
 */
export function buildWhatsAppMatchMessage(params: {
    clientFirstName: string;
    advisorName?: string;
    wantedBrand: string;
    wantedModel: string;
    vehicle: Vehicle;
}): string {
    const { clientFirstName, advisorName = 'Hernán', wantedBrand, wantedModel, vehicle } = params;
    
    const kmFormatted = vehicle.mileage === 0 
        ? '0 KM (sin rodar)' 
        : `${vehicle.mileage.toLocaleString('es-AR')} km`;
    
    const priceFormatted = formatARS(vehicle.sale_price);
    const vehicleFullTitle = [vehicle.brand, vehicle.model, vehicle.version].filter(Boolean).join(' ');

    return `Hola ${clientFirstName}, ¿cómo estás? Soy ${advisorName} de Special Cars 👋

Te escribo porque hace un tiempo nos comentaste que estabas buscando ${wantedBrand} ${wantedModel}.

Acaba de ingresar una unidad ${vehicleFullTitle} (${vehicle.year}) con ${kmFormatted} que creo que puede interesarte mucho.

Está publicada en ${priceFormatted}.

Si querés, te paso fotos y más información. ¿Cómo lo ves?`;
}
