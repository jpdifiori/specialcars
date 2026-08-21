'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export interface GlobalSearchResult {
    vehicles: {
        id: string;
        stock_code: string;
        title: string;
        plate?: string | null;
        vin?: string | null;
        status: string;
        sale_price: number;
    }[];
    clients: {
        id: string;
        name: string;
        dni?: string | null;
        cuit_cuil?: string | null;
        phone?: string | null;
        email?: string | null;
    }[];
    operations: {
        id: string;
        operation_code: string;
        type: string;
        status: string;
        client_name: string;
        agreed_price: number;
        operation_date: string;
    }[];
}

/**
 * Búsqueda global en toda la base de datos (vehículos, clientes, operaciones).
 */
export async function performGlobalSearch(query: string): Promise<GlobalSearchResult> {
    const cleanQ = query?.trim();
    if (!cleanQ || cleanQ.length < 2) {
        return { vehicles: [], clients: [], operations: [] };
    }

    const adminClient = createAdminClient();

    // 1. Intentar con RPC si existe
    const { data: rpcRes, error: rpcErr } = await adminClient.rpc('global_search', { p_query: cleanQ });
    if (!rpcErr && rpcRes) {
        return rpcRes as GlobalSearchResult;
    }

    // Fallback con consultas paralelas
    const [vehiclesRes, clientsRes, operationsRes] = await Promise.all([
        adminClient
            .from('vehicles')
            .select('id, stock_code, brand, model, version, year, plate, vin, status, sale_price')
            .or(`stock_code.ilike.%${cleanQ}%,plate.ilike.%${cleanQ}%,vin.ilike.%${cleanQ}%,brand.ilike.%${cleanQ}%,model.ilike.%${cleanQ}%`)
            .eq('is_deleted', false)
            .limit(8),
        adminClient
            .from('clients')
            .select('id, first_name, last_name, dni, cuit_cuil, phone, email')
            .or(`first_name.ilike.%${cleanQ}%,last_name.ilike.%${cleanQ}%,dni.ilike.%${cleanQ}%,cuit_cuil.ilike.%${cleanQ}%,phone.ilike.%${cleanQ}%,email.ilike.%${cleanQ}%`)
            .eq('is_deleted', false)
            .limit(8),
        adminClient
            .from('operations')
            .select(`
                id, operation_code, type, status, agreed_price, operation_date,
                client:clients(first_name, last_name)
            `)
            .ilike('operation_code', `%${cleanQ}%`)
            .eq('is_deleted', false)
            .limit(8)
    ]);

    const vehicles = (vehiclesRes.data || []).map((v: any) => ({
        id: v.id,
        stock_code: v.stock_code,
        title: `${v.brand} ${v.model} ${v.version || ''} (${v.year})`.trim(),
        plate: v.plate,
        vin: v.vin,
        status: v.status,
        sale_price: Number(v.sale_price) || 0
    }));

    const clients = (clientsRes.data || []).map((c: any) => ({
        id: c.id,
        name: `${c.first_name} ${c.last_name}`.trim(),
        dni: c.dni,
        cuit_cuil: c.cuit_cuil,
        phone: c.phone,
        email: c.email
    }));

    const operations = (operationsRes.data || []).map((o: any) => ({
        id: o.id,
        operation_code: o.operation_code,
        type: o.type,
        status: o.status,
        client_name: o.client ? `${o.client.first_name} ${o.client.last_name}` : 'Cliente',
        agreed_price: Number(o.agreed_price) || 0,
        operation_date: o.operation_date
    }));

    return { vehicles, clients, operations };
}
