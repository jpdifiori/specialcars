'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Vehicle, PublicVehicleItem } from '@/lib/types';
import { generateVehicleSlug } from '@/lib/utils/slug';
import { isOfferActive, calculateOfferSavings } from '@/lib/utils/offer';
import { revalidatePath } from 'next/cache';

function parseHidePrice(v: any): boolean {
    if (v.hide_price !== undefined && v.hide_price !== null) {
        return Boolean(v.hide_price);
    }
    if (v.features) {
        try {
            const parsed = JSON.parse(v.features);
            if (typeof parsed.hide_price === 'boolean') {
                return parsed.hide_price;
            }
        } catch {
            // not json
        }
    }
    return true; // default true (Consultar precio!)
}

function parseOfferData(v: any) {
    let isOffer = Boolean(v.is_offer);
    let offerPrice = v.offer_price !== undefined && v.offer_price !== null ? Number(v.offer_price) : null;
    let offerStartDate = v.offer_start_date || null;
    let offerEndDate = v.offer_end_date || null;
    let offerLabel = v.offer_label || 'OFERTA';

    if (v.features) {
        try {
            const parsed = JSON.parse(v.features);
            if (parsed.is_offer !== undefined && (v.is_offer === undefined || v.is_offer === null)) {
                isOffer = Boolean(parsed.is_offer);
            }
            if (parsed.offer_price !== undefined && (v.offer_price === undefined || v.offer_price === null)) {
                offerPrice = Number(parsed.offer_price);
            }
            if (parsed.offer_start_date !== undefined && !v.offer_start_date) {
                offerStartDate = parsed.offer_start_date;
            }
            if (parsed.offer_end_date !== undefined && !v.offer_end_date) {
                offerEndDate = parsed.offer_end_date;
            }
            if (parsed.offer_label !== undefined && !v.offer_label) {
                offerLabel = parsed.offer_label;
            }
        } catch {
            // not json
        }
    }

    return {
        is_offer: isOffer,
        offer_price: offerPrice,
        offer_start_date: offerStartDate,
        offer_end_date: offerEndDate,
        offer_label: offerLabel
    };
}

function shouldSkipPlateValidation(plate: string | null | undefined, mileage?: number): boolean {
    if (mileage === 0) return true;
    if (!plate || plate.trim() === '') return true;
    const clean = plate.trim().toUpperCase();
    const commonPlaceholders = [
        'N/A',
        'NA',
        'S/P',
        'SP',
        'SIN PATENTE',
        'SIN DOMINIO',
        '0KM',
        '0 KM',
        '0-KM',
        '-',
        '--',
        '---',
        'S/D',
        'SD',
        'NINGUNA',
        'PENDIENTE',
        'NO TIENE'
    ];
    return commonPlaceholders.includes(clean);
}

export interface VehicleFilterParams {
    search?: string;
    status?: string;
    origin_type?: string;
    published?: boolean | string;
    offer_status?: 'ALL' | 'WITH_OFFER' | 'WITHOUT_OFFER';
    only_offers?: boolean;
    brand?: string;
    body_type?: string;
    fuel_type?: string;
    transmission?: string;
    min_price?: number;
    max_price?: number;
    min_year?: number;
    max_year?: number;
    sort_by?: 'newest' | 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc';
    page?: number;
    limit?: number;
}

/**
 * Obtiene lista de vehículos para el Admin con filtros y paginación.
 */
export async function getAdminVehicles(params: VehicleFilterParams = {}) {
    const supabase = await createServerSupabaseClient();
    const {
        search,
        status,
        origin_type,
        published,
        brand,
        sort_by = 'newest',
        page = 1,
        limit = 20
    } = params;

    let query = supabase
        .from('vehicles')
        .select(`
            *,
            images:vehicle_images(*),
            expenses:vehicle_expenses(*),
            previous_client:clients(id, first_name, last_name, phone)
        `, { count: 'exact' })
        .eq('is_deleted', false);

    if (search && search.trim() !== '') {
        const q = search.trim();
        query = query.or(`stock_code.ilike.%${q}%,plate.ilike.%${q}%,brand.ilike.%${q}%,model.ilike.%${q}%,vin.ilike.%${q}%`);
    }

    if (status && status !== 'ALL') {
        query = query.eq('status', status);
    }

    if (origin_type && origin_type !== 'ALL') {
        query = query.eq('origin_type', origin_type);
    }

    if (published !== undefined && published !== 'ALL') {
        query = query.eq('published', published === true || published === 'true');
    }

    if (brand && brand !== 'ALL') {
        query = query.ilike('brand', brand);
    }

    // Ordenamiento
    switch (sort_by) {
        case 'price_asc':
            query = query.order('sale_price', { ascending: true });
            break;
        case 'price_desc':
            query = query.order('sale_price', { ascending: false });
            break;
        case 'year_desc':
            query = query.order('year', { ascending: false });
            break;
        case 'mileage_asc':
            query = query.order('mileage', { ascending: true });
            break;
        case 'newest':
        default:
            query = query.order('created_at', { ascending: false });
            break;
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
        console.error('Error fetching admin vehicles:', error);
        return { data: [], total: 0, totalPages: 0 };
    }

    // Calcular costos reales, márgenes y ofertas
    let enhancedData: Vehicle[] = (data || []).map((v: any) => {
        const totalExpenses = (v.expenses || []).reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
        const purchasePrice = Number(v.purchase_price) || 0;
        const salePrice = Number(v.sale_price) || 0;
        const realCost = purchasePrice + totalExpenses;
        const potentialProfit = salePrice - realCost;
        const profitabilityPct = realCost > 0 ? (potentialProfit / realCost) * 100 : 0;
        const offerData = parseOfferData(v);

        // Días en stock
        const start = new Date(v.purchase_date || v.created_at);
        const end = v.sale_date ? new Date(v.sale_date) : new Date();
        const daysInStock = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

        return {
            ...v,
            ...offerData,
            hide_price: parseHidePrice(v),
            total_expenses: totalExpenses,
            real_cost: realCost,
            potential_profit: potentialProfit,
            profitability_pct: profitabilityPct,
            days_in_stock: daysInStock
        };
    });

    if (params.offer_status === 'WITH_OFFER') {
        enhancedData = enhancedData.filter(v => isOfferActive(v));
    } else if (params.offer_status === 'WITHOUT_OFFER') {
        enhancedData = enhancedData.filter(v => !isOfferActive(v));
    }

    return {
        data: enhancedData,
        total: params.offer_status && params.offer_status !== 'ALL' ? enhancedData.length : (count || 0),
        totalPages: Math.ceil((params.offer_status && params.offer_status !== 'ALL' ? enhancedData.length : (count || 0)) / limit)
    };
}

/**
 * Obtiene la ficha 360 completa de un vehículo para el Admin.
 */
export async function getVehicleById(id: string): Promise<Vehicle | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('vehicles')
        .select(`
            *,
            images:vehicle_images(*),
            expenses:vehicle_expenses(*),
            previous_client:clients(*),
            origin_operation:operations(
                id, operation_code, type, agreed_price, operation_date, client:clients(id, first_name, last_name, phone)
            )
        `)
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

    if (error || !data) {
        console.error('Error fetching vehicle by id:', error);
        return null;
    }

    const totalExpenses = (data.expenses || []).reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
    const purchasePrice = Number(data.purchase_price) || 0;
    const salePrice = Number(data.sale_price) || 0;
    const realCost = purchasePrice + totalExpenses;
    const potentialProfit = salePrice - realCost;
    const profitabilityPct = realCost > 0 ? (potentialProfit / realCost) * 100 : 0;

    const start = new Date(data.purchase_date || data.created_at);
    const end = data.sale_date ? new Date(data.sale_date) : new Date();
    const daysInStock = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // Ordenar imágenes por sort_order
    if (data.images) {
        data.images.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    }

    const offerData = parseOfferData(data);

    return {
        ...data,
        ...offerData,
        hide_price: parseHidePrice(data),
        total_expenses: totalExpenses,
        real_cost: realCost,
        potential_profit: potentialProfit,
        profitability_pct: profitabilityPct,
        days_in_stock: daysInStock
    };
}

/**
 * Crea un nuevo vehículo con control de duplicados de patente y VIN.
 */
export async function createVehicle(formData: Partial<Vehicle>) {
    const adminClient = createAdminClient();

    // 1. Control de duplicados por Patente (excepto para 0KM o patentes provisorias/N/A) y VIN
    if (!shouldSkipPlateValidation(formData.plate, Number(formData.mileage))) {
        const { data: existingPlate } = await adminClient
            .from('vehicles')
            .select('id, stock_code, brand, model')
            .eq('plate', formData.plate!.trim().toUpperCase())
            .eq('is_deleted', false)
            .maybeSingle();

        if (existingPlate) {
            return {
                success: false,
                error: `Ya existe un vehículo registrado con la patente ${formData.plate} (${existingPlate.stock_code}: ${existingPlate.brand} ${existingPlate.model})`
            };
        }
    }

    if (formData.vin && formData.vin.trim() !== '') {
        const { data: existingVin } = await adminClient
            .from('vehicles')
            .select('id, stock_code, brand, model')
            .eq('vin', formData.vin.trim().toUpperCase())
            .eq('is_deleted', false)
            .maybeSingle();

        if (existingVin) {
            return {
                success: false,
                error: `Ya existe un vehículo registrado con el VIN ${formData.vin} (${existingVin.stock_code})`
            };
        }
    }

    // 2. Generar Slug
    let baseSlug = generateVehicleSlug(
        formData.brand || 'auto',
        formData.model || 'modelo',
        formData.version,
        formData.year
    );

    const { count } = await adminClient
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .ilike('slug', `${baseSlug}%`);

    const finalSlug = count && count > 0 ? `${baseSlug}-${count + 1}` : baseSlug;

    // 3. Validación de Oferta si está activa
    if (formData.is_offer) {
        const salePrice = Number(formData.sale_price) || 0;
        const offerPrice = Number(formData.offer_price) || 0;
        if (offerPrice <= 0) {
            return {
                success: false,
                error: 'El precio de oferta debe ser mayor a $ 0.'
            };
        }
        if (offerPrice >= salePrice) {
            return {
                success: false,
                error: `El precio de oferta ($ ${offerPrice.toLocaleString('es-AR')}) debe ser estrictamente menor al precio de venta normal ($ ${salePrice.toLocaleString('es-AR')}).`
            };
        }
    }

    // 4. Generar Título Comercial por defecto si no viene
    const commercialTitle = formData.commercial_title?.trim() || 
        `${formData.brand?.toUpperCase()} ${formData.model?.toUpperCase()} ${formData.version ? formData.version.toUpperCase() : ''} ${formData.year}`.trim();

    // 5. Inserción con features JSON
    const hidePriceValue = formData.hide_price !== undefined ? Boolean(formData.hide_price) : true;
    let featuresData = formData.features?.trim() || null;
    try {
        const obj = featuresData ? JSON.parse(featuresData) : {};
        obj.hide_price = hidePriceValue;
        obj.is_offer = Boolean(formData.is_offer);
        obj.offer_price = formData.offer_price ? Number(formData.offer_price) : null;
        obj.offer_start_date = formData.offer_start_date || null;
        obj.offer_end_date = formData.offer_end_date || null;
        obj.offer_label = formData.offer_label?.trim() || 'OFERTA';
        featuresData = JSON.stringify(obj);
    } catch {
        featuresData = JSON.stringify({ 
            raw: featuresData, 
            hide_price: hidePriceValue,
            is_offer: Boolean(formData.is_offer),
            offer_price: formData.offer_price ? Number(formData.offer_price) : null,
            offer_start_date: formData.offer_start_date || null,
            offer_end_date: formData.offer_end_date || null,
            offer_label: formData.offer_label?.trim() || 'OFERTA'
        });
    }

    const payload: any = {
        brand: formData.brand?.trim() || '',
        model: formData.model?.trim() || '',
        version: formData.version?.trim() || null,
        year: Number(formData.year) || new Date().getFullYear(),
        mileage: Number(formData.mileage) || 0,
        fuel_type: formData.fuel_type || 'NAFTA',
        transmission: formData.transmission || 'MANUAL',
        body_type: formData.body_type || 'AUTO',
        doors: Number(formData.doors) || 4,
        exterior_color: formData.exterior_color?.trim() || null,
        interior_color: formData.interior_color?.trim() || null,
        plate: formData.plate ? formData.plate.trim().toUpperCase() : null,
        vin: formData.vin ? formData.vin.trim().toUpperCase() : null,
        engine_number: formData.engine_number ? formData.engine_number.trim() : null,
        purchase_price: Number(formData.purchase_price) || 0,
        sale_price: Number(formData.sale_price) || 0,
        minimum_price: Number(formData.minimum_price) || 0,
        origin_type: formData.origin_type || 'DIRECT_PURCHASE',
        status: formData.status || 'DRAFT',
        previous_client_id: formData.previous_client_id || null,
        published: Boolean(formData.published),
        featured: Boolean(formData.featured),
        commercial_title: commercialTitle,
        description: formData.description?.trim() || null,
        equipment: formData.equipment?.trim() || null,
        features: featuresData,
        is_offer: Boolean(formData.is_offer),
        offer_price: formData.offer_price ? Number(formData.offer_price) : null,
        offer_start_date: formData.offer_start_date || null,
        offer_end_date: formData.offer_end_date || null,
        offer_label: formData.offer_label?.trim() || 'OFERTA',
        slug: finalSlug,
        meta_title: formData.meta_title?.trim() || `${commercialTitle} | Special Cars`,
        meta_description: formData.meta_description?.trim() || `Comprá tu ${commercialTitle} en Special Cars. Excelente estado y garantía.`,
        purchase_date: formData.purchase_date || new Date().toISOString().split('T')[0]
    };

    let insertRes = await adminClient
        .from('vehicles')
        .insert(payload)
        .select()
        .single();

    if (insertRes.error && insertRes.error.message.includes('column') && insertRes.error.message.includes('offer')) {
        const fallbackPayload = { ...payload };
        delete fallbackPayload.is_offer;
        delete fallbackPayload.offer_price;
        delete fallbackPayload.offer_start_date;
        delete fallbackPayload.offer_end_date;
        delete fallbackPayload.offer_label;
        insertRes = await adminClient
            .from('vehicles')
            .insert(fallbackPayload)
            .select()
            .single();
    }

    if (insertRes.error) {
        console.error('Error creating vehicle:', insertRes.error);
        return { success: false, error: insertRes.error.message };
    }

    revalidatePath('/admin/vehiculos');
    revalidatePath('/vehiculos');
    revalidatePath('/ofertas');
    revalidatePath('/');

    return { success: true, vehicle: insertRes.data };
}

/**
 * Actualiza los datos de un vehículo.
 */
export async function updateVehicle(id: string, formData: Partial<Vehicle>) {
    const adminClient = createAdminClient();

    // Validar patente única si cambió (excepto para 0KM o patentes provisorias/N/A)
    if (!shouldSkipPlateValidation(formData.plate, Number(formData.mileage))) {
        const { data: existingPlate } = await adminClient
            .from('vehicles')
            .select('id, stock_code')
            .eq('plate', formData.plate!.trim().toUpperCase())
            .neq('id', id)
            .eq('is_deleted', false)
            .maybeSingle();

        if (existingPlate) {
            return {
                success: false,
                error: `Ya existe otro vehículo con la patente ${formData.plate} (${existingPlate.stock_code})`
            };
        }
    }

    // Validar oferta si se activa
    if (formData.is_offer) {
        const salePrice = Number(formData.sale_price) || 0;
        const offerPrice = Number(formData.offer_price) || 0;
        if (offerPrice <= 0) {
            return {
                success: false,
                error: 'El precio de oferta debe ser mayor a $ 0.'
            };
        }
        if (offerPrice >= salePrice) {
            return {
                success: false,
                error: `El precio de oferta ($ ${offerPrice.toLocaleString('es-AR')}) debe ser estrictamente menor al precio de venta normal ($ ${salePrice.toLocaleString('es-AR')}).`
            };
        }
    }

    const payload: any = { ...formData, updated_at: new Date().toISOString() };
    delete payload.id;
    delete payload.created_at;
    delete payload.images;
    delete payload.expenses;
    delete payload.previous_client;
    delete payload.origin_operation;
    delete payload.total_expenses;
    delete payload.real_cost;
    delete payload.potential_profit;
    delete payload.profitability_pct;
    delete payload.days_in_stock;

    // Actualizar features JSON
    let featuresData = payload.features || null;
    try {
        const obj = featuresData ? JSON.parse(featuresData) : {};
        if (formData.hide_price !== undefined) {
            obj.hide_price = Boolean(formData.hide_price);
        }
        if (formData.is_offer !== undefined) {
            obj.is_offer = Boolean(formData.is_offer);
        }
        if (formData.offer_price !== undefined) {
            obj.offer_price = formData.offer_price ? Number(formData.offer_price) : null;
        }
        if (formData.offer_start_date !== undefined) {
            obj.offer_start_date = formData.offer_start_date || null;
        }
        if (formData.offer_end_date !== undefined) {
            obj.offer_end_date = formData.offer_end_date || null;
        }
        if (formData.offer_label !== undefined) {
            obj.offer_label = formData.offer_label?.trim() || 'OFERTA';
        }
        payload.features = JSON.stringify(obj);
    } catch {
        payload.features = JSON.stringify({
            raw: featuresData,
            hide_price: Boolean(formData.hide_price),
            is_offer: Boolean(formData.is_offer),
            offer_price: formData.offer_price ? Number(formData.offer_price) : null,
            offer_start_date: formData.offer_start_date || null,
            offer_end_date: formData.offer_end_date || null,
            offer_label: formData.offer_label?.trim() || 'OFERTA'
        });
    }

    if (payload.plate) payload.plate = payload.plate.trim().toUpperCase();
    if (payload.vin) payload.vin = payload.vin.trim().toUpperCase();

    let updateRes = await adminClient
        .from('vehicles')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (updateRes.error && updateRes.error.message.includes('column') && updateRes.error.message.includes('offer')) {
        const fallbackPayload = { ...payload };
        delete fallbackPayload.is_offer;
        delete fallbackPayload.offer_price;
        delete fallbackPayload.offer_start_date;
        delete fallbackPayload.offer_end_date;
        delete fallbackPayload.offer_label;
        updateRes = await adminClient
            .from('vehicles')
            .update(fallbackPayload)
            .eq('id', id)
            .select()
            .single();
    }

    if (updateRes.error) {
        console.error('Error updating vehicle:', updateRes.error);
        return { success: false, error: updateRes.error.message };
    }

    revalidatePath(`/admin/vehiculos/${id}`);
    revalidatePath('/admin/vehiculos');
    revalidatePath('/vehiculos');
    revalidatePath('/ofertas');
    revalidatePath('/');

    return { success: true, vehicle: updateRes.data };
}

/**
 * Toggle de publicación en web.
 */
export async function toggleVehiclePublish(id: string, published: boolean) {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
        .from('vehicles')
        .update({ published, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/admin/vehiculos/${id}`);
    revalidatePath('/admin/vehiculos');
    revalidatePath('/vehiculos');
    revalidatePath('/');

    return { success: true, vehicle: data };
}

/**
 * Cambia el estado del vehículo (AVAILABLE, IN_PREPARATION, RESERVED, etc.).
 */
export async function updateVehicleStatus(id: string, status: string) {
    const adminClient = createAdminClient();

    const updates: any = { status, updated_at: new Date().toISOString() };
    
    // Si pasa a VENDIDO o RETIRADO, se despublica automáticamente
    if (status === 'SOLD' || status === 'WITHDRAWN' || status === 'UNAVAILABLE') {
        updates.published = false;
        if (status === 'SOLD') updates.sale_date = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await adminClient
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/admin/vehiculos/${id}`);
    revalidatePath('/admin/vehiculos');
    revalidatePath('/vehiculos');
    revalidatePath('/');

    return { success: true, vehicle: data };
}

/**
 * Soft delete de un vehículo (nunca borra si está vendido o en operaciones).
 */
export async function deleteVehicle(id: string) {
    const adminClient = createAdminClient();

    const { data: veh } = await adminClient
        .from('vehicles')
        .select('status')
        .eq('id', id)
        .single();

    if (veh?.status === 'SOLD') {
        return { success: false, error: 'No se puede eliminar un vehículo que ha sido vendido (debe conservarse en historial).' };
    }

    const { error } = await adminClient
        .from('vehicles')
        .update({ is_deleted: true, published: false, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/vehiculos');
    revalidatePath('/vehiculos');
    revalidatePath('/');

    return { success: true };
}

/**
 * Catálogo público seguro: lee de la vista `public_vehicle_catalog` o tabla segura.
 * Nunca expone datos financieros privados (costos, compra, gastos, margen).
 */
export async function getPublicVehicles(params: VehicleFilterParams = {}) {
    const supabase = createAdminClient();
    const {
        brand,
        body_type,
        fuel_type,
        transmission,
        min_price,
        max_price,
        min_year,
        max_year,
        sort_by = 'newest',
        page = 1,
        limit = 12
    } = params;

    let query = supabase
        .from('vehicles')
        .select(`
            id, stock_code, slug, commercial_title, brand, model, version, year,
            mileage, fuel_type, transmission, body_type, doors, exterior_color,
            price:sale_price, description, equipment, features, featured, status,
            meta_title, meta_description, created_at,
            images:vehicle_images(id, url, is_primary, sort_order)
        `, { count: 'exact' })
        .eq('published', true)
        .eq('is_deleted', false)
        .in('status', ['AVAILABLE', 'RESERVED']);

    if (brand && brand !== 'ALL') {
        query = query.ilike('brand', brand);
    }
    if (body_type && body_type !== 'ALL') {
        query = query.eq('body_type', body_type);
    }
    if (fuel_type && fuel_type !== 'ALL') {
        query = query.eq('fuel_type', fuel_type);
    }
    if (transmission && transmission !== 'ALL') {
        query = query.eq('transmission', transmission);
    }
    if (min_price && min_price > 0) {
        query = query.gte('sale_price', min_price);
    }
    if (max_price && max_price > 0) {
        query = query.lte('sale_price', max_price);
    }
    if (min_year && min_year > 0) {
        query = query.gte('year', min_year);
    }
    if (max_year && max_year > 0) {
        query = query.lte('year', max_year);
    }

    switch (sort_by) {
        case 'price_asc':
            query = query.order('sale_price', { ascending: true });
            break;
        case 'price_desc':
            query = query.order('sale_price', { ascending: false });
            break;
        case 'year_desc':
            query = query.order('year', { ascending: false });
            break;
        case 'mileage_asc':
            query = query.order('mileage', { ascending: true });
            break;
        case 'newest':
        default:
            query = query.order('created_at', { ascending: false });
            break;
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
        console.error('Error fetching public vehicles:', error);
        return { data: [], total: 0, totalPages: 0 };
    }

    let formatted: PublicVehicleItem[] = (data || []).map((item: any) => {
        const sortedImages = (item.images || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
        const primaryImg = sortedImages.find((img: any) => img.is_primary) || sortedImages[0];
        const offerData = parseOfferData(item);
        const itemWithOffer = { ...item, ...offerData };
        const activeOffer = isOfferActive(itemWithOffer);
        const savingsCalc = activeOffer && offerData.offer_price ? calculateOfferSavings(item.price || item.sale_price, offerData.offer_price) : null;

        return {
            ...item,
            ...offerData,
            is_offer_active: activeOffer,
            savings: savingsCalc?.savings || 0,
            discount_percentage: savingsCalc?.discountPercentage || 0,
            hide_price: parseHidePrice(item),
            primary_image_url: primaryImg?.url || null,
            images: sortedImages
        };
    });

    if (params.only_offers) {
        formatted = formatted.filter(v => v.is_offer_active);
    }

    return {
        data: formatted,
        total: params.only_offers ? formatted.length : (count || 0),
        totalPages: Math.ceil((params.only_offers ? formatted.length : (count || 0)) / limit)
    };
}

/**
 * Obtiene la ficha pública de un vehículo por su slug o ID.
 */
export async function getPublicVehicleBySlug(slugOrId: string): Promise<PublicVehicleItem | null> {
    const supabase = createAdminClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

    let query = supabase
        .from('vehicles')
        .select(`
            id, stock_code, slug, commercial_title, brand, model, version, year,
            mileage, fuel_type, transmission, body_type, doors, exterior_color,
            price:sale_price, description, equipment, features, featured, status,
            meta_title, meta_description, created_at,
            images:vehicle_images(id, url, is_primary, sort_order)
        `)
        .eq('published', true)
        .eq('is_deleted', false);

    if (isUuid) {
        query = query.or(`slug.eq.${slugOrId},id.eq.${slugOrId}`);
    } else {
        query = query.eq('slug', slugOrId);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
        return null;
    }

    const sortedImages = (data.images || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    const primaryImg = sortedImages.find((img: any) => img.is_primary) || sortedImages[0];
    const offerData = parseOfferData(data);
    const itemWithOffer = { ...data, ...offerData };
    const activeOffer = isOfferActive(itemWithOffer);
    const savingsCalc = activeOffer && offerData.offer_price ? calculateOfferSavings(data.price, offerData.offer_price) : null;

    return {
        ...data,
        ...offerData,
        is_offer_active: activeOffer,
        savings: savingsCalc?.savings || 0,
        discount_percentage: savingsCalc?.discountPercentage || 0,
        hide_price: parseHidePrice(data),
        primary_image_url: primaryImg?.url || null,
        images: sortedImages
    };
}
