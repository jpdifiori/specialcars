import { formatARS } from './currency';
import { formatDate } from './dates';

export interface VehicleOfferProps {
    is_offer?: boolean;
    offer_price?: number | null;
    sale_price?: number;
    price?: number;
    offer_start_date?: string | null;
    offer_end_date?: string | null;
    offer_label?: string | null;
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD local.
 */
function getTodayString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Evalúa si una oferta está activa y vigente según sus fechas y valores de precio.
 */
export function isOfferActive(vehicle: VehicleOfferProps | null | undefined): boolean {
    if (!vehicle) return false;
    if (!vehicle.is_offer) return false;

    const offerPrice = Number(vehicle.offer_price) || 0;
    const regularPrice = Number(vehicle.sale_price !== undefined ? vehicle.sale_price : vehicle.price) || 0;

    // El precio de oferta debe ser mayor a 0 y estrictamente menor al precio regular
    if (offerPrice <= 0 || regularPrice <= 0 || offerPrice >= regularPrice) {
        return false;
    }

    const todayStr = getTodayString();

    // Fecha de inicio (si existe, hoy debe ser >= start_date)
    if (vehicle.offer_start_date) {
        const start = vehicle.offer_start_date.split('T')[0];
        if (todayStr < start) {
            return false;
        }
    }

    // Fecha de finalización / vencimiento (si existe, hoy debe ser <= end_date)
    if (vehicle.offer_end_date) {
        const end = vehicle.offer_end_date.split('T')[0];
        if (todayStr > end) {
            return false;
        }
    }

    return true;
}

/**
 * Calcula el ahorro en pesos y el porcentaje de descuento de una oferta.
 */
export function calculateOfferSavings(regularPrice: number, offerPrice: number) {
    const reg = Math.max(0, Number(regularPrice) || 0);
    const off = Math.max(0, Number(offerPrice) || 0);

    const savings = Math.max(0, reg - off);
    const discountPercentage = reg > 0 && off < reg ? Math.round((savings / reg) * 100) : 0;

    return {
        savings,
        discountPercentage,
        formattedSavings: formatARS(savings),
        formattedDiscount: `-${discountPercentage}%`
    };
}

/**
 * Devuelve la etiqueta a mostrar en los badges de oferta.
 */
export function getOfferBadgeLabel(label?: string | null): string {
    if (!label || label.trim() === '') {
        return 'OFERTA';
    }
    return label.trim().toUpperCase();
}

/**
 * Genera el mensaje de WhatsApp prearmado considerando si el vehículo está en oferta o con precio normal.
 */
export function getVehicleWhatsAppMessage(vehicle: {
    brand: string;
    model: string;
    version?: string | null;
    year: number;
    is_offer?: boolean;
    offer_price?: number | null;
    sale_price?: number;
    price?: number;
    offer_start_date?: string | null;
    offer_end_date?: string | null;
}): string {
    const vehicleName = `${vehicle.brand} ${vehicle.model} ${vehicle.version || ''} ${vehicle.year}`.replace(/\s+/g, ' ').trim();
    
    if (isOfferActive(vehicle)) {
        const promoPrice = formatARS(vehicle.offer_price);
        return `Hola, estoy interesado en la oferta de la ${vehicleName} publicada en ${promoPrice}. ¿Sigue disponible?`;
    }

    return `Hola, necesito mas información sobre el vehículo ${vehicleName}`;
}
