'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Consignment, ConsignmentStatus, PaymentType } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Obtiene lista de consignaciones con cliente y vehículo asociado.
 */
export async function getConsignments(params: { status?: string; page?: number; limit?: number } = {}) {
    const supabase = await createServerSupabaseClient();
    const { status, page = 1, limit = 20 } = params;

    let query = supabase
        .from('consignments')
        .select(`
            *,
            client:clients(id, first_name, last_name, phone, email),
            vehicle:vehicles(id, stock_code, brand, model, version, year, plate, sale_price, status, published),
            buyer_client:clients!consignments_buyer_client_id_fkey(id, first_name, last_name, phone)
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
        console.error('Error fetching consignments:', error);
        return { data: [], total: 0, totalPages: 0 };
    }

    return {
        data: (data || []) as Consignment[],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
    };
}

/**
 * Crea una nueva consignación y vincula o crea el vehículo como origen CONSIGNMENT.
 */
export async function createConsignment(payload: {
    client_id: string;
    vehicle_id: string;
    requested_price: number;
    listing_price: number;
    minimum_price?: number;
    commission_amount?: number;
    expiry_date?: string;
    notes?: string;
}) {
    const adminClient = createAdminClient();

    const { count } = await adminClient.from('consignments').select('id', { count: 'exact', head: true });
    const consignmentCode = `CON-${String((count || 0) + 1).padStart(6, '0')}`;

    // 1. Crear registro de consignación
    const { data, error } = await adminClient
        .from('consignments')
        .insert({
            consignment_code: consignmentCode,
            client_id: payload.client_id,
            vehicle_id: payload.vehicle_id,
            requested_price: payload.requested_price,
            listing_price: payload.listing_price,
            minimum_price: payload.minimum_price || payload.requested_price,
            commission_amount: payload.commission_amount || (payload.listing_price - payload.requested_price),
            owner_amount: payload.requested_price,
            expiry_date: payload.expiry_date || null,
            notes: payload.notes || null,
            status: 'ACTIVE'
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    // 2. Actualizar el vehículo para reflejar consignación y precio de venta
    await adminClient.from('vehicles').update({
        origin_type: 'CONSIGNMENT',
        previous_client_id: payload.client_id,
        sale_price: payload.listing_price,
        minimum_price: payload.minimum_price || payload.requested_price,
        status: 'AVAILABLE',
        updated_at: new Date().toISOString()
    }).eq('id', payload.vehicle_id);

    revalidatePath('/admin/consignaciones');
    revalidatePath('/admin/vehiculos');
    return { success: true, consignment: data };
}

/**
 * Cierra y vende una consignación, calculando comisión de la agencia.
 */
export async function processConsignmentSaleAction(payload: {
    consignment_id: string;
    buyer_client_id: string;
    final_sale_price: number;
    payments: { payment_type: PaymentType; amount: number; reference?: string; notes?: string }[];
    notes?: string;
}) {
    const adminClient = createAdminClient();

    const { data: cons, error: consErr } = await adminClient
        .from('consignments')
        .select('*, vehicle:vehicles(*)')
        .eq('id', payload.consignment_id)
        .single();

    if (consErr || !cons || cons.status !== 'ACTIVE') {
        return { success: false, error: 'La consignación no se encuentra activa.' };
    }

    const commissionAmount = payload.final_sale_price - Number(cons.requested_price);
    const ownerAmount = Number(cons.requested_price);

    // 1. Crear Operación
    const { count: opCodeCount } = await adminClient.from('operations').select('id', { count: 'exact', head: true });
    const opCode = `OP-${String((opCodeCount || 0) + 1).padStart(6, '0')}`;

    const { data: newOp, error: opErr } = await adminClient
        .from('operations')
        .insert({
            operation_code: opCode,
            type: 'CONSIGNMENT',
            status: 'CLOSED',
            client_id: payload.buyer_client_id,
            agreed_price: payload.final_sale_price,
            balance: 0,
            notes: payload.notes || `Venta de consignación ${cons.consignment_code}. Comisión: $ ${commissionAmount.toLocaleString('es-AR')}`,
            operation_date: new Date().toISOString().split('T')[0],
            closed_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

    if (opErr || !newOp) {
        return { success: false, error: opErr?.message || 'Error creando operación' };
    }

    // 2. Vincular vehículo a la operación
    await adminClient.from('operation_vehicles').insert({
        operation_id: newOp.id,
        vehicle_id: cons.vehicle_id,
        role: 'CONSIGNED'
    });

    // 3. Registrar pagos
    if (payload.payments && payload.payments.length > 0) {
        const paymentRows = payload.payments.map(p => ({
            operation_id: newOp.id,
            payment_type: p.payment_type,
            amount: p.amount,
            reference: p.reference || null,
            notes: p.notes || null,
            payment_date: new Date().toISOString().split('T')[0]
        }));
        await adminClient.from('operation_payments').insert(paymentRows);
    }

    // 4. Actualizar Consignación a SOLD
    await adminClient.from('consignments').update({
        status: 'SOLD',
        buyer_client_id: payload.buyer_client_id,
        final_sale_price: payload.final_sale_price,
        owner_amount: ownerAmount,
        commission_amount: commissionAmount,
        sold_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
    }).eq('id', payload.consignment_id);

    // 5. Actualizar vehículo a SOLD y published=false
    await adminClient.from('vehicles').update({
        status: 'SOLD',
        published: false,
        sale_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
    }).eq('id', cons.vehicle_id);

    revalidatePath('/admin/consignaciones');
    revalidatePath('/admin/operaciones');
    revalidatePath('/admin/vehiculos');
    revalidatePath('/vehiculos');
    revalidatePath('/');

    return {
        success: true,
        operation_id: newOp.id,
        commission_amount: commissionAmount,
        owner_amount: ownerAmount
    };
}
