'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Client, TimelineEvent } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Obtiene lista de clientes con búsqueda y paginación.
 */
export async function getClients(params: { search?: string; page?: number; limit?: number } = {}) {
    const supabase = await createServerSupabaseClient();
    const { search, page = 1, limit = 20 } = params;

    let query = supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false);

    if (search && search.trim() !== '') {
        const q = search.trim();
        query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,dni.ilike.%${q}%,cuit_cuil.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
        console.error('Error fetching clients:', error);
        return { data: [], total: 0, totalPages: 0 };
    }

    return {
        data: (data || []) as Client[],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
    };
}

/**
 * Control de duplicados: verifica si ya existe un cliente con el mismo DNI, CUIT, teléfono o email.
 */
export async function checkDuplicateClient(data: { dni?: string; cuit_cuil?: string; phone?: string; email?: string; excludeId?: string }) {
    const adminClient = createAdminClient();
    const matches: { field: string; client: any }[] = [];

    if (data.dni && data.dni.trim() !== '') {
        let q = adminClient.from('clients').select('id, first_name, last_name, dni, phone, email').eq('dni', data.dni.trim()).eq('is_deleted', false);
        if (data.excludeId) q = q.neq('id', data.excludeId);
        const { data: res } = await q.maybeSingle();
        if (res) matches.push({ field: 'DNI', client: res });
    }

    if (data.cuit_cuil && data.cuit_cuil.trim() !== '') {
        let q = adminClient.from('clients').select('id, first_name, last_name, cuit_cuil, phone, email').eq('cuit_cuil', data.cuit_cuil.trim()).eq('is_deleted', false);
        if (data.excludeId) q = q.neq('id', data.excludeId);
        const { data: res } = await q.maybeSingle();
        if (res && !matches.some(m => m.client.id === res.id)) matches.push({ field: 'CUIT/CUIL', client: res });
    }

    if (data.phone && data.phone.trim() !== '') {
        let q = adminClient.from('clients').select('id, first_name, last_name, phone, email').eq('phone', data.phone.trim()).eq('is_deleted', false);
        if (data.excludeId) q = q.neq('id', data.excludeId);
        const { data: res } = await q.maybeSingle();
        if (res && !matches.some(m => m.client.id === res.id)) matches.push({ field: 'Teléfono', client: res });
    }

    if (data.email && data.email.trim() !== '') {
        let q = adminClient.from('clients').select('id, first_name, last_name, email, phone').ilike('email', data.email.trim()).eq('is_deleted', false);
        if (data.excludeId) q = q.neq('id', data.excludeId);
        const { data: res } = await q.maybeSingle();
        if (res && !matches.some(m => m.client.id === res.id)) matches.push({ field: 'Email', client: res });
    }

    return {
        hasDuplicate: matches.length > 0,
        matches
    };
}

/**
 * Crea un cliente.
 */
export async function createClientRecord(formData: Partial<Client>) {
    const adminClient = createAdminClient();

    const payload = {
        first_name: formData.first_name?.trim() || '',
        last_name: formData.last_name?.trim() || '',
        dni: formData.dni?.trim() || null,
        cuit_cuil: formData.cuit_cuil?.trim() || null,
        phone: formData.phone?.trim() || null,
        whatsapp: formData.whatsapp?.trim() || formData.phone?.trim() || null,
        email: formData.email?.trim() || null,
        address: formData.address?.trim() || null,
        city: formData.city?.trim() || null,
        province: formData.province?.trim() || null,
        postal_code: formData.postal_code?.trim() || null,
        notes: formData.notes?.trim() || null
    };

    const { data, error } = await adminClient
        .from('clients')
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error('Error creating client:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/clientes');
    return { success: true, client: data };
}

/**
 * Actualiza un cliente.
 */
export async function updateClientRecord(id: string, formData: Partial<Client>) {
    const adminClient = createAdminClient();

    const payload = {
        first_name: formData.first_name?.trim() || '',
        last_name: formData.last_name?.trim() || '',
        dni: formData.dni?.trim() || null,
        cuit_cuil: formData.cuit_cuil?.trim() || null,
        phone: formData.phone?.trim() || null,
        whatsapp: formData.whatsapp?.trim() || formData.phone?.trim() || null,
        email: formData.email?.trim() || null,
        address: formData.address?.trim() || null,
        city: formData.city?.trim() || null,
        province: formData.province?.trim() || null,
        postal_code: formData.postal_code?.trim() || null,
        notes: formData.notes?.trim() || null,
        updated_at: new Date().toISOString()
    };

    const { data, error } = await adminClient
        .from('clients')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/admin/clientes/${id}`);
    revalidatePath('/admin/clientes');
    return { success: true, client: data };
}

/**
 * Ficha 360° del cliente con timeline cronológico unificado.
 */
export async function getClient360(id: string): Promise<Client | null> {
    const adminClient = createAdminClient();

    // 1. Datos del cliente
    const { data: client, error: clientErr } = await adminClient
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

    if (clientErr || !client) return null;

    // 2. Operaciones
    const { data: operations } = await adminClient
        .from('operations')
        .select(`
            *,
            vehicles:operation_vehicles(
                role,
                vehicle:vehicles(id, stock_code, brand, model, version, year, plate, sale_price)
            )
        `)
        .eq('client_id', id)
        .eq('is_deleted', false)
        .order('operation_date', { ascending: false });

    // 3. Consignaciones
    const { data: consignments } = await adminClient
        .from('consignments')
        .select(`*, vehicle:vehicles(id, stock_code, brand, model, version, year, plate)`)
        .eq('client_id', id)
        .eq('is_deleted', false);

    // 4. Reservas
    const { data: reservations } = await adminClient
        .from('reservations')
        .select(`*, vehicle:vehicles(id, stock_code, brand, model, version, year, plate)`)
        .eq('client_id', id)
        .eq('is_deleted', false);

    // 5. Búsquedas Activas de Vehículos
    const { data: wantedVehicles } = await adminClient
        .from('wanted_vehicles')
        .select('*')
        .eq('client_id', id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

    // Armar Timeline
    const timeline: TimelineEvent[] = [];

    (operations || []).forEach((op: any) => {
        const soldVeh = op.vehicles?.find((v: any) => v.role === 'SOLD')?.vehicle;
        const tradeInVeh = op.vehicles?.find((v: any) => v.role === 'RECEIVED_TRADE_IN')?.vehicle;

        if (op.type === 'SALE') {
            timeline.push({
                id: `op-${op.id}`,
                date: op.operation_date,
                title: `Compró ${soldVeh ? `${soldVeh.brand} ${soldVeh.model}` : 'Vehículo'}`,
                description: `Operación ${op.operation_code} por $ ${op.agreed_price?.toLocaleString('es-AR')}`,
                type: 'sale',
                link: `/admin/operaciones/${op.id}`,
                badge: 'Venta Directa'
            });
        } else if (op.type === 'SALE_WITH_TRADE_IN') {
            timeline.push({
                id: `op-${op.id}`,
                date: op.operation_date,
                title: `Compró ${soldVeh ? `${soldVeh.brand} ${soldVeh.model}` : 'Vehículo'} con Permuta`,
                description: `Entregó ${tradeInVeh ? `${tradeInVeh.brand} ${tradeInVeh.model}` : 'Vehículo'} por valor de $ ${op.trade_in_value?.toLocaleString('es-AR')}. Saldo pagado: $ ${(op.agreed_price - op.trade_in_value)?.toLocaleString('es-AR')}`,
                type: 'trade_in',
                link: `/admin/operaciones/${op.id}`,
                badge: 'Permuta'
            });
        }
    });

    (consignments || []).forEach((c: any) => {
        timeline.push({
            id: `con-${c.id}`,
            date: c.start_date,
            title: `Dejó en Consignación ${c.vehicle ? `${c.vehicle.brand} ${c.vehicle.model}` : 'Vehículo'}`,
            description: `Código ${c.consignment_code} — Precio solicitado: $ ${c.requested_price?.toLocaleString('es-AR')}`,
            type: 'consignment',
            link: `/admin/consignaciones/${c.id}`,
            badge: c.status
        });
    });

    (reservations || []).forEach((r: any) => {
        timeline.push({
            id: `res-${r.id}`,
            date: r.reservation_date,
            title: `Reservó ${r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : 'Vehículo'}`,
            description: `Seña de $ ${r.amount?.toLocaleString('es-AR')} — Estado: ${r.status}`,
            type: 'reservation',
            link: `/admin/reservas/${r.id}`,
            badge: r.status
        });
    });

    (wantedVehicles || []).forEach((w: any) => {
        timeline.push({
            id: `wanted-${w.id}`,
            date: w.created_at,
            title: `Búsqueda: ${w.brand} ${w.model}`,
            description: `Código ${w.code} — Presupuesto: ${w.max_budget > 0 ? `$ ${w.max_budget.toLocaleString('es-AR')}` : 'Sin tope'} (${w.status})`,
            type: 'note',
            link: `/admin/vehiculos-buscados/${w.id}`,
            badge: w.status === 'SEARCHING' ? 'Buscando' : w.status
        });
    });

    // Ordenar timeline por fecha descendente
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
        ...client,
        operations_count: (operations || []).length,
        consignments: consignments || [],
        reservations: reservations || [],
        wanted_vehicles: wantedVehicles || [],
        timeline
    };
}
