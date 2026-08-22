'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { WantedVehicle, Vehicle, MatchResult, StockDemandItem, WantedVehicleStatus, WantedVehicleCancellationReason } from '@/lib/types';
import { calculateMatchScore } from '@/lib/utils/matching';
import { revalidatePath } from 'next/cache';

/**
 * Obtiene el listado de búsquedas de vehículos con filtros y paginación.
 */
export async function getWantedVehicles(params: {
    search?: string;
    status?: string;
    priority?: string;
    brand?: string;
    page?: number;
    limit?: number;
} = {}) {
    const supabase = await createServerSupabaseClient();
    const { search, status, priority, brand, page = 1, limit = 25 } = params;

    let query = supabase
        .from('wanted_vehicles')
        .select(`
            *,
            client:clients(id, first_name, last_name, phone, whatsapp, email, city)
        `, { count: 'exact' })
        .eq('is_deleted', false);

    if (status && status !== 'ALL') {
        query = query.eq('status', status);
    }

    if (priority && priority !== 'ALL') {
        query = query.eq('priority', priority);
    }

    if (brand && brand.trim() !== '') {
        query = query.ilike('brand', `%${brand.trim()}%`);
    }

    if (search && search.trim() !== '') {
        const q = search.trim();
        query = query.or(`brand.ilike.%${q}%,model.ilike.%${q}%,code.ilike.%${q}%,notes.ilike.%${q}%,trade_in_details.ilike.%${q}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
        console.error('Error fetching wanted_vehicles:', error);
        return { data: [], total: 0, totalPages: 0 };
    }

    return {
        data: (data || []) as WantedVehicle[],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
    };
}

/**
 * Obtiene una búsqueda específica por ID con datos del cliente y stock coincidente.
 */
export async function getWantedVehicleById(id: string) {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('wanted_vehicles')
        .select(`
            *,
            client:clients(*)
        `)
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

    if (error || !data) {
        console.error('Error fetching wanted vehicle by id:', error);
        return null;
    }

    return data as WantedVehicle;
}

/**
 * Crea una nueva búsqueda de vehículo deseado por un cliente.
 */
export async function createWantedVehicle(formData: {
    client_id: string;
    brand: string;
    model: string;
    version?: string | null;
    year_min?: number | null;
    year_max?: number | null;
    max_mileage?: number | null;
    fuel_type?: any;
    transmission?: any;
    body_type?: any;
    preferred_color?: string | null;
    max_budget?: number;
    accepts_similar_model?: boolean;
    accepts_different_version?: boolean;
    accepts_nearby_year?: boolean;
    has_trade_in?: boolean;
    trade_in_details?: string | null;
    priority?: any;
    notes?: string | null;
}) {
    const adminClient = createAdminClient();

    const payload = {
        client_id: formData.client_id,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        version: formData.version?.trim() || null,
        year_min: formData.year_min ? Number(formData.year_min) : null,
        year_max: formData.year_max ? Number(formData.year_max) : null,
        max_mileage: formData.max_mileage ? Number(formData.max_mileage) : null,
        fuel_type: formData.fuel_type || null,
        transmission: formData.transmission || null,
        body_type: formData.body_type || null,
        preferred_color: formData.preferred_color?.trim() || null,
        max_budget: formData.max_budget ? Number(formData.max_budget) : 0,
        accepts_similar_model: formData.accepts_similar_model ?? true,
        accepts_different_version: formData.accepts_different_version ?? true,
        accepts_nearby_year: formData.accepts_nearby_year ?? true,
        has_trade_in: formData.has_trade_in ?? false,
        trade_in_details: formData.trade_in_details?.trim() || null,
        priority: formData.priority || 'MEDIUM',
        status: 'SEARCHING',
        notes: formData.notes?.trim() || null,
        last_contact_date: new Date().toISOString()
    };

    const { data, error } = await adminClient
        .from('wanted_vehicles')
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error('Error creating wanted vehicle:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/vehiculos-buscados');
    revalidatePath(`/admin/clientes/${formData.client_id}`);
    revalidatePath('/admin');

    return { success: true, data: data as WantedVehicle };
}

/**
 * Actualiza los datos de una búsqueda existente.
 */
export async function updateWantedVehicle(id: string, formData: Partial<WantedVehicle>) {
    const adminClient = createAdminClient();

    const updatePayload: any = {
        ...formData,
        updated_at: new Date().toISOString()
    };

    delete updatePayload.id;
    delete updatePayload.code;
    delete updatePayload.created_at;
    delete updatePayload.client;

    const { data, error } = await adminClient
        .from('wanted_vehicles')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating wanted vehicle:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/vehiculos-buscados');
    revalidatePath(`/admin/vehiculos-buscados/${id}`);

    return { success: true, data: data as WantedVehicle };
}

/**
 * Cambia el estado de una búsqueda (Buscando, Contactado, Encontrado, Cerrado, Cancelado).
 */
export async function updateWantedVehicleStatus(
    id: string,
    status: WantedVehicleStatus,
    options?: {
        cancellation_reason?: WantedVehicleCancellationReason | null;
        notes?: string | null;
        touchLastContact?: boolean;
    }
) {
    const adminClient = createAdminClient();

    const updatePayload: any = {
        status,
        updated_at: new Date().toISOString()
    };

    if (options?.cancellation_reason !== undefined) {
        updatePayload.cancellation_reason = options.cancellation_reason;
    }

    if (options?.notes) {
        updatePayload.notes = options.notes;
    }

    if (options?.touchLastContact) {
        updatePayload.last_contact_date = new Date().toISOString();
    }

    const { data, error } = await adminClient
        .from('wanted_vehicles')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating wanted vehicle status:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/vehiculos-buscados');
    revalidatePath(`/admin/vehiculos-buscados/${id}`);

    return { success: true, data: data as WantedVehicle };
}

/**
 * Elimina lógicamente una búsqueda.
 */
export async function deleteWantedVehicle(id: string) {
    const adminClient = createAdminClient();

    const { error } = await adminClient
        .from('wanted_vehicles')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error('Error deleting wanted vehicle:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/vehiculos-buscados');
    return { success: true };
}

/**
 * Ejecuta el motor de coincidencias para un vehículo en stock contra todas las búsquedas activas.
 * Retorna la lista de clientes potencialmente interesados ordenada por mayor score.
 */
export async function getMatchingBuyersForVehicle(vehicleId: string, minScore: number = 60) {
    const supabase = await createServerSupabaseClient();

    // 1. Obtener datos del vehículo
    const { data: vehicle, error: vErr } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .eq('is_deleted', false)
        .single();

    if (vErr || !vehicle) return [];

    // 2. Obtener búsquedas activas (SEARCHING o CONTACTED)
    const { data: wantedList, error: wErr } = await supabase
        .from('wanted_vehicles')
        .select(`
            *,
            client:clients(id, first_name, last_name, phone, whatsapp, email, city)
        `)
        .in('status', ['SEARCHING', 'CONTACTED'])
        .eq('is_deleted', false);

    if (wErr || !wantedList || wantedList.length === 0) return [];

    // 3. Ejecutar algoritmo de matching
    const results: MatchResult[] = [];

    for (const wanted of wantedList as WantedVehicle[]) {
        const match = calculateMatchScore(vehicle as Vehicle, wanted);
        if (match.score >= minScore) {
            results.push(match);
        }
    }

    // Ordenar por score descendente
    return results.sort((a, b) => b.score - a.score);
}

/**
 * Ejecuta el motor de coincidencias para un pedido de búsqueda contra todo el stock actual disponible.
 */
export async function getMatchingStockForWanted(wantedId: string, minScore: number = 50) {
    const supabase = await createServerSupabaseClient();

    // 1. Obtener la búsqueda
    const { data: wanted, error: wErr } = await supabase
        .from('wanted_vehicles')
        .select(`
            *,
            client:clients(*)
        `)
        .eq('id', wantedId)
        .eq('is_deleted', false)
        .single();

    if (wErr || !wanted) return [];

    // 2. Obtener stock disponible o en preparación
    const { data: vehicles, error: vErr } = await supabase
        .from('vehicles')
        .select(`
            *,
            images:vehicle_images(id, url, is_primary, sort_order)
        `)
        .in('status', ['AVAILABLE', 'IN_PREPARATION', 'INCOMING'])
        .eq('is_deleted', false);

    if (vErr || !vehicles || vehicles.length === 0) return [];

    const results: MatchResult[] = [];

    for (const vehicle of vehicles as Vehicle[]) {
        const match = calculateMatchScore(vehicle, wanted as WantedVehicle);
        if (match.score >= minScore) {
            results.push(match);
        }
    }

    return results.sort((a, b) => b.score - a.score);
}

/**
 * Obtiene el resumen de Demanda de Stock & Oportunidades Comerciales.
 * Agrupa los vehículos en stock disponibles y los ordena por cantidad de clientes en espera.
 */
export async function getStockDemandSummary(): Promise<StockDemandItem[]> {
    const supabase = await createServerSupabaseClient();

    // 1. Obtener stock disponible
    const { data: vehicles } = await supabase
        .from('vehicles')
        .select(`
            *,
            images:vehicle_images(id, url, is_primary, sort_order)
        `)
        .in('status', ['AVAILABLE', 'IN_PREPARATION', 'INCOMING'])
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

    if (!vehicles || vehicles.length === 0) return [];

    // 2. Obtener búsquedas activas
    const { data: wantedList } = await supabase
        .from('wanted_vehicles')
        .select(`
            *,
            client:clients(id, first_name, last_name, phone, whatsapp, email, city)
        `)
        .in('status', ['SEARCHING', 'CONTACTED'])
        .eq('is_deleted', false);

    if (!wantedList || wantedList.length === 0) {
        return vehicles.map(v => ({
            vehicle: v as Vehicle,
            interestedCount: 0,
            highMatchCount: 0,
            topMatches: []
        }));
    }

    const items: StockDemandItem[] = [];

    for (const vehicle of vehicles as Vehicle[]) {
        const matches: MatchResult[] = [];
        for (const wanted of wantedList as WantedVehicle[]) {
            const match = calculateMatchScore(vehicle, wanted);
            if (match.score >= 60) {
                matches.push(match);
            }
        }

        matches.sort((a, b) => b.score - a.score);

        const highCount = matches.filter(m => m.score >= 80).length;

        items.push({
            vehicle,
            interestedCount: matches.length,
            highMatchCount: highCount,
            topMatches: matches.slice(0, 5)
        });
    }

    // Ordenar de mayor a menor interés de clientes
    return items.sort((a, b) => {
        if (b.highMatchCount !== a.highMatchCount) {
            return b.highMatchCount - a.highMatchCount;
        }
        return b.interestedCount - a.interestedCount;
    });
}

/**
 * Consulta rápida de demanda estimada para el formulario de alta de vehículo.
 */
export async function checkQuickDemand(brand: string, model: string, bodyType?: string) {
    if (!brand || !model) return { level: 'LOW', count: 0, highMatchCount: 0 };

    const supabase = await createServerSupabaseClient();

    const { data: wantedList } = await supabase
        .from('wanted_vehicles')
        .select('id, brand, model, body_type, accepts_similar_model')
        .in('status', ['SEARCHING', 'CONTACTED'])
        .eq('is_deleted', false);

    if (!wantedList || wantedList.length === 0) {
        return { level: 'LOW', count: 0, highMatchCount: 0 };
    }

    const dummyVehicle: any = {
        brand,
        model,
        body_type: bodyType || 'AUTO',
        year: new Date().getFullYear(),
        sale_price: 30000000,
        mileage: 40000,
        transmission: 'AUTOMATIC'
    };

    let total = 0;
    let high = 0;

    for (const w of wantedList) {
        const score = calculateMatchScore(dummyVehicle, w as any);
        if (score.score >= 60) {
            total++;
            if (score.score >= 80) high++;
        }
    }

    let level: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (high >= 3 || total >= 5) {
        level = 'HIGH';
    } else if (total >= 2) {
        level = 'MEDIUM';
    }

    return {
        level,
        count: total,
        highMatchCount: high
    };
}
