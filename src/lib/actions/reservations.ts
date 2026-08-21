'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Reservation, ReservationStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Obtiene lista de reservas con cliente y vehículo asociado.
 */
export async function getReservations(params: { status?: string; page?: number; limit?: number } = {}) {
    const supabase = await createServerSupabaseClient();
    const { status, page = 1, limit = 20 } = params;

    let query = supabase
        .from('reservations')
        .select(`
            *,
            client:clients(id, first_name, last_name, phone, email),
            vehicle:vehicles(id, stock_code, brand, model, version, year, plate, sale_price, status)
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
        console.error('Error fetching reservations:', error);
        return { data: [], total: 0, totalPages: 0 };
    }

    return {
        data: (data || []) as Reservation[],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
    };
}

/**
 * Crea una reserva para un vehículo y actualiza su estado a RESERVED.
 */
export async function createReservation(payload: {
    client_id: string;
    vehicle_id: string;
    amount: number;
    expiry_date?: string;
    receipt_path?: string;
    show_reserved_badge?: boolean;
    notes?: string;
}) {
    const adminClient = createAdminClient();

    // 1. Validar disponibilidad
    const { data: veh, error: vehErr } = await adminClient
        .from('vehicles')
        .select('id, status, is_deleted')
        .eq('id', payload.vehicle_id)
        .single();

    if (vehErr || !veh || veh.is_deleted || veh.status !== 'AVAILABLE') {
        return { success: false, error: 'El vehículo seleccionado no se encuentra disponible para reservar.' };
    }

    // 2. Generar código
    const { count } = await adminClient.from('reservations').select('id', { count: 'exact', head: true });
    const reservationCode = `RES-${String((count || 0) + 1).padStart(6, '0')}`;

    // 3. Crear reserva
    const { data, error } = await adminClient
        .from('reservations')
        .insert({
            reservation_code: reservationCode,
            client_id: payload.client_id,
            vehicle_id: payload.vehicle_id,
            amount: payload.amount,
            expiry_date: payload.expiry_date || null,
            receipt_path: payload.receipt_path || null,
            show_reserved_badge: payload.show_reserved_badge !== false,
            notes: payload.notes || null,
            status: 'ACTIVE'
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    // 4. Actualizar estado del vehículo a RESERVED
    await adminClient.from('vehicles').update({
        status: 'RESERVED',
        updated_at: new Date().toISOString()
    }).eq('id', payload.vehicle_id);

    revalidatePath('/admin/reservas');
    revalidatePath('/admin/vehiculos');
    revalidatePath('/vehiculos');
    revalidatePath('/');

    return { success: true, reservation: data };
}

/**
 * Cancela una reserva y restaura el estado del vehículo a AVAILABLE.
 */
export async function cancelReservation(id: string) {
    const adminClient = createAdminClient();

    const { data: res, error: resErr } = await adminClient
        .from('reservations')
        .select('*')
        .eq('id', id)
        .single();

    if (resErr || !res) {
        return { success: false, error: 'Reserva no encontrada.' };
    }

    // Actualizar reserva
    await adminClient.from('reservations').update({
        status: 'CANCELLED',
        updated_at: new Date().toISOString()
    }).eq('id', id);

    // Restaurar vehículo a AVAILABLE si sigue en estado RESERVED
    await adminClient.from('vehicles').update({
        status: 'AVAILABLE',
        updated_at: new Date().toISOString()
    }).eq('id', res.vehicle_id).eq('status', 'RESERVED');

    revalidatePath('/admin/reservas');
    revalidatePath('/admin/vehiculos');
    revalidatePath('/vehiculos');
    revalidatePath('/');

    return { success: true };
}
