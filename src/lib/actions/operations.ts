'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Operation, PaymentType } from '@/lib/types';
import { generateVehicleSlug } from '@/lib/utils/slug';
import { revalidatePath } from 'next/cache';

/**
 * Obtiene lista de operaciones con filtros y cliente asociado.
 */
export async function getOperations(params: { type?: string; status?: string; search?: string; page?: number; limit?: number } = {}) {
    const supabase = await createServerSupabaseClient();
    const { type, status, search, page = 1, limit = 20 } = params;

    let query = supabase
        .from('operations')
        .select(`
            *,
            client:clients(id, first_name, last_name, phone, email),
            vehicles:operation_vehicles(
                role,
                vehicle:vehicles(id, stock_code, brand, model, version, year, plate)
            ),
            payments:operation_payments(*)
        `, { count: 'exact' })
        .eq('is_deleted', false);

    if (type && type !== 'ALL') {
        query = query.eq('type', type);
    }

    if (status && status !== 'ALL') {
        query = query.eq('status', status);
    }

    if (search && search.trim() !== '') {
        const q = search.trim();
        query = query.or(`operation_code.ilike.%${q}%,notes.ilike.%${q}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order('operation_date', { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
        console.error('Error fetching operations:', error);
        return { data: [], total: 0, totalPages: 0 };
    }

    return {
        data: (data || []) as Operation[],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
    };
}

/**
 * Obtiene el detalle de una operación por ID.
 */
export async function getOperationById(id: string): Promise<Operation | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('operations')
        .select(`
            *,
            client:clients(*),
            vehicles:operation_vehicles(
                role,
                vehicle:vehicles(*)
            ),
            payments:operation_payments(*)
        `)
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

    if (error || !data) return null;
    return data as Operation;
}

/**
 * VENTA SIMPLE:
 * 1. Crea operación
 * 2. Asigna vehículo con rol SOLD
 * 3. Registra pagos
 * 4. Actualiza vehículo a status=SOLD y published=false
 */
export async function processSimpleSaleAction(payload: {
    client_id: string;
    vehicle_id: string;
    agreed_price: number;
    payments: { payment_type: PaymentType; amount: number; reference?: string; notes?: string }[];
    notes?: string;
}) {
    const adminClient = createAdminClient();

    // 1. Validar que el vehículo esté disponible
    const { data: vehicle, error: vehErr } = await adminClient
        .from('vehicles')
        .select('id, stock_code, status, is_deleted')
        .eq('id', payload.vehicle_id)
        .single();

    if (vehErr || !vehicle || vehicle.is_deleted || (vehicle.status !== 'AVAILABLE' && vehicle.status !== 'RESERVED')) {
        return { success: false, error: 'El vehículo seleccionado no se encuentra disponible para la venta.' };
    }

    // 2. Intentar llamar a la función RPC si existe, o ejecutar transaccionalmente
    const { data: rpcRes, error: rpcErr } = await adminClient.rpc('process_simple_sale', {
        p_client_id: payload.client_id,
        p_vehicle_id: payload.vehicle_id,
        p_agreed_price: payload.agreed_price,
        p_payments: payload.payments,
        p_notes: payload.notes || null
    });

    if (!rpcErr && rpcRes) {
        revalidatePath('/admin/operaciones');
        revalidatePath('/admin/vehiculos');
        revalidatePath('/vehiculos');
        revalidatePath('/');
        return { success: true, operation_id: rpcRes.operation_id, operation_code: rpcRes.operation_code };
    }

    // Fallback directo con service role client:
    const { count: opCodeCount } = await adminClient.from('operations').select('id', { count: 'exact', head: true });
    const opCode = `OP-${String((opCodeCount || 0) + 1).padStart(6, '0')}`;

    const { data: newOp, error: opErr } = await adminClient
        .from('operations')
        .insert({
            operation_code: opCode,
            type: 'SALE',
            status: 'CLOSED',
            client_id: payload.client_id,
            agreed_price: payload.agreed_price,
            balance: 0,
            notes: payload.notes || null,
            operation_date: new Date().toISOString().split('T')[0],
            closed_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

    if (opErr || !newOp) {
        return { success: false, error: opErr?.message || 'Error creando operación de venta' };
    }

    // Vincular vehículo
    await adminClient.from('operation_vehicles').insert({
        operation_id: newOp.id,
        vehicle_id: payload.vehicle_id,
        role: 'SOLD'
    });

    // Registrar pagos
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

    // Actualizar vehículo a SOLD y published=false
    await adminClient.from('vehicles').update({
        status: 'SOLD',
        published: false,
        sale_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
    }).eq('id', payload.vehicle_id);

    revalidatePath('/admin/operaciones');
    revalidatePath('/admin/vehiculos');
    revalidatePath('/vehiculos');
    revalidatePath('/');

    return { success: true, operation_id: newOp.id, operation_code: newOp.operation_code };
}

/**
 * VENTA CON PERMUTA:
 * 1. Vende vehículo saliente (status=SOLD, published=false)
 * 2. Crea vehículo recibido en inventario (origin=TRADE_IN, status=IN_PREPARATION, valor_compra = valor_toma)
 * 3. Crea operación de tipo SALE_WITH_TRADE_IN
 * 4. Relaciona ambos vehículos en operation_vehicles (SOLD y RECEIVED_TRADE_IN)
 * 5. Registra pago de permuta + pagos adicionales
 */
export async function processTradeInSaleAction(payload: {
    client_id: string;
    sold_vehicle_id: string;
    agreed_price: number;
    trade_in_vehicle: {
        brand: string;
        model: string;
        version?: string;
        year: number;
        mileage?: number;
        fuel_type?: any;
        transmission?: any;
        body_type?: any;
        doors?: number;
        exterior_color?: string;
        interior_color?: string;
        plate?: string;
        vin?: string;
        engine_number?: string;
        sale_price?: number;
        minimum_price?: number;
    };
    trade_in_value: number;
    payments: { payment_type: PaymentType; amount: number; reference?: string; notes?: string }[];
    notes?: string;
}) {
    const adminClient = createAdminClient();

    // 1. Validar vehículo que sale
    const { data: soldVeh, error: soldErr } = await adminClient
        .from('vehicles')
        .select('id, stock_code, status, is_deleted')
        .eq('id', payload.sold_vehicle_id)
        .single();

    if (soldErr || !soldVeh || soldVeh.is_deleted || (soldVeh.status !== 'AVAILABLE' && soldVeh.status !== 'RESERVED')) {
        return { success: false, error: 'El vehículo a vender no se encuentra disponible.' };
    }

    // 2. Intentar llamar a RPC si está disponible
    const { data: rpcRes, error: rpcErr } = await adminClient.rpc('process_trade_in_sale', {
        p_client_id: payload.client_id,
        p_sold_vehicle_id: payload.sold_vehicle_id,
        p_agreed_price: payload.agreed_price,
        p_trade_in_data: payload.trade_in_vehicle,
        p_trade_in_value: payload.trade_in_value,
        p_payments: payload.payments,
        p_notes: payload.notes || null
    });

    if (!rpcErr && rpcRes) {
        revalidatePath('/admin/operaciones');
        revalidatePath('/admin/vehiculos');
        revalidatePath('/vehiculos');
        revalidatePath('/');
        return { success: true, operation_id: rpcRes.operation_id, operation_code: rpcRes.operation_code, trade_in_vehicle_id: rpcRes.trade_in_vehicle_id };
    }

    // Fallback en TypeScript con Service Role:
    const { count: opCodeCount } = await adminClient.from('operations').select('id', { count: 'exact', head: true });
    const opCode = `OP-${String((opCodeCount || 0) + 1).padStart(6, '0')}`;

    // A. Crear Operación
    const { data: newOp, error: opErr } = await adminClient
        .from('operations')
        .insert({
            operation_code: opCode,
            type: 'SALE_WITH_TRADE_IN',
            status: 'CLOSED',
            client_id: payload.client_id,
            agreed_price: payload.agreed_price,
            trade_in_value: payload.trade_in_value,
            balance: 0,
            notes: payload.notes || null,
            operation_date: new Date().toISOString().split('T')[0],
            closed_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

    if (opErr || !newOp) {
        return { success: false, error: opErr?.message || 'Error creando operación de permuta' };
    }

    // B. Crear Vehículo Recibido en Inventario
    const { count: vehCodeCount } = await adminClient.from('vehicles').select('id', { count: 'exact', head: true });
    const vehCode = `VEH-${String((vehCodeCount || 0) + 1).padStart(6, '0')}`;

    const baseSlug = generateVehicleSlug(
        payload.trade_in_vehicle.brand,
        payload.trade_in_vehicle.model,
        payload.trade_in_vehicle.version,
        payload.trade_in_vehicle.year
    );

    const commercialTitle = `${payload.trade_in_vehicle.brand.toUpperCase()} ${payload.trade_in_vehicle.model.toUpperCase()} ${payload.trade_in_vehicle.version ? payload.trade_in_vehicle.version.toUpperCase() : ''} ${payload.trade_in_vehicle.year}`.trim();

    const { data: tradeInVeh, error: tradeInErr } = await adminClient
        .from('vehicles')
        .insert({
            stock_code: vehCode,
            brand: payload.trade_in_vehicle.brand.trim(),
            model: payload.trade_in_vehicle.model.trim(),
            version: payload.trade_in_vehicle.version?.trim() || null,
            year: payload.trade_in_vehicle.year,
            mileage: payload.trade_in_vehicle.mileage || 0,
            fuel_type: payload.trade_in_vehicle.fuel_type || 'NAFTA',
            transmission: payload.trade_in_vehicle.transmission || 'MANUAL',
            body_type: payload.trade_in_vehicle.body_type || 'AUTO',
            doors: payload.trade_in_vehicle.doors || 4,
            exterior_color: payload.trade_in_vehicle.exterior_color?.trim() || null,
            interior_color: payload.trade_in_vehicle.interior_color?.trim() || null,
            plate: payload.trade_in_vehicle.plate ? payload.trade_in_vehicle.plate.trim().toUpperCase() : null,
            vin: payload.trade_in_vehicle.vin ? payload.trade_in_vehicle.vin.trim().toUpperCase() : null,
            engine_number: payload.trade_in_vehicle.engine_number?.trim() || null,
            purchase_price: payload.trade_in_value, // Costo de compra = Valor de toma acordado
            sale_price: payload.trade_in_vehicle.sale_price || 0,
            minimum_price: payload.trade_in_vehicle.minimum_price || 0,
            origin_type: 'TRADE_IN',
            status: 'IN_PREPARATION', // Comienza en preparación
            previous_client_id: payload.client_id,
            origin_operation_id: newOp.id,
            published: false,
            featured: false,
            slug: `${baseSlug}-${Date.now().toString().slice(-4)}`,
            commercial_title: commercialTitle,
            purchase_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

    if (tradeInErr || !tradeInVeh) {
        return { success: false, error: tradeInErr?.message || 'Error creando vehículo recibido en permuta' };
    }

    // C. Relacionar ambos vehículos en operation_vehicles
    await adminClient.from('operation_vehicles').insert([
        { operation_id: newOp.id, vehicle_id: payload.sold_vehicle_id, role: 'SOLD' },
        { operation_id: newOp.id, vehicle_id: tradeInVeh.id, role: 'RECEIVED_TRADE_IN' }
    ]);

    // D. Registrar pagos (Permuta + Adicionales)
    const paymentRows: any[] = [
        {
            operation_id: newOp.id,
            payment_type: 'TRADE_IN',
            amount: payload.trade_in_value,
            reference: `Vehículo recibido: ${tradeInVeh.brand} ${tradeInVeh.model} (${tradeInVeh.stock_code})`,
            notes: 'Valor de toma en permuta',
            payment_date: new Date().toISOString().split('T')[0]
        }
    ];

    if (payload.payments && payload.payments.length > 0) {
        payload.payments.forEach(p => {
            paymentRows.push({
                operation_id: newOp.id,
                payment_type: p.payment_type,
                amount: p.amount,
                reference: p.reference || null,
                notes: p.notes || null,
                payment_date: new Date().toISOString().split('T')[0]
            });
        });
    }

    await adminClient.from('operation_payments').insert(paymentRows);

    // E. Actualizar vehículo vendido a status=SOLD y published=false
    await adminClient.from('vehicles').update({
        status: 'SOLD',
        published: false,
        sale_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
    }).eq('id', payload.sold_vehicle_id);

    revalidatePath('/admin/operaciones');
    revalidatePath('/admin/vehiculos');
    revalidatePath('/vehiculos');
    revalidatePath('/');

    return {
        success: true,
        operation_id: newOp.id,
        operation_code: newOp.operation_code,
        trade_in_vehicle_id: tradeInVeh.id
    };
}
