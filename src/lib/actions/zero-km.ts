'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ZeroKmOperation, ZeroKmStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Obtiene lista de operaciones 0 KM.
 */
export async function getZeroKmOperations(params: { status?: string; page?: number; limit?: number } = {}) {
    const supabase = await createServerSupabaseClient();
    const { status, page = 1, limit = 20 } = params;

    let query = supabase
        .from('zero_km_operations')
        .select(`
            *,
            client:clients(id, first_name, last_name, phone, email)
        `, { count: 'exact' })
        .eq('is_deleted', false);

    if (status && status !== 'ALL') {
        query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
        console.error('Error fetching zero km operations:', error);
        return { data: [], total: 0, totalPages: 0 };
    }

    return {
        data: (data || []) as ZeroKmOperation[],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
    };
}

/**
 * Crea una nueva operación de vehículo 0 KM.
 */
export async function createZeroKmOperation(payload: Partial<ZeroKmOperation>) {
    const adminClient = createAdminClient();

    const { count } = await adminClient.from('zero_km_operations').select('id', { count: 'exact', head: true });
    const code = `0KM-${String((count || 0) + 1).padStart(6, '0')}`;

    const cost = Number(payload.cost) || 0;
    const clientPrice = Number(payload.client_price) || 0;
    const commission = payload.commission !== undefined ? Number(payload.commission) : (clientPrice - cost);

    const { data, error } = await adminClient
        .from('zero_km_operations')
        .insert({
            operation_code: code,
            client_id: payload.client_id,
            brand: payload.brand?.trim() || '',
            model: payload.model?.trim() || '',
            version: payload.version?.trim() || null,
            year: Number(payload.year) || new Date().getFullYear(),
            color: payload.color?.trim() || null,
            provider: payload.provider?.trim() || null,
            cost,
            client_price: clientPrice,
            commission,
            estimated_date: payload.estimated_date || null,
            delivery_date: payload.delivery_date || null,
            status: payload.status || 'ORDERED',
            notes: payload.notes?.trim() || null
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/0km');
    return { success: true, operation: data };
}

/**
 * Actualiza el estado de una operación 0 KM.
 */
export async function updateZeroKmStatus(id: string, status: ZeroKmStatus, delivery_date?: string) {
    const adminClient = createAdminClient();

    const updates: any = { status, updated_at: new Date().toISOString() };
    if (delivery_date) updates.delivery_date = delivery_date;
    if (status === 'DELIVERED' && !delivery_date) {
        updates.delivery_date = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await adminClient
        .from('zero_km_operations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/0km');
    return { success: true, operation: data };
}
