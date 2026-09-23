'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Vehicle, Client, WantedVehicle, Reservation, VehicleImage } from '@/lib/types';
import { createReservation } from '@/lib/actions/reservations';
import { createClientRecord } from '@/lib/actions/clients';
import { createWantedVehicle } from '@/lib/actions/wanted-vehicles';
import { revalidatePath } from 'next/cache';

/**
 * Tipo específico para la vista de vendedores: omite deliberadamente purchase_price y gastos internos.
 */
export type SellerVehicle = Omit<Vehicle, 'purchase_price'> & {
    images?: VehicleImage[];
};

/**
 * Obtiene el catálogo de stock en vivo para vendedores del salón.
 * Filtra solo unidades AVAILABLE o RESERVED y oculta purchase_price.
 */
export async function getSellerStock(params: {
    search?: string;
    body_type?: string;
    transmission?: string;
    fuel_type?: string;
    status?: string;
} = {}): Promise<SellerVehicle[]> {
    const supabase = await createServerSupabaseClient();
    const { search, body_type, transmission, fuel_type, status } = params;

    let query = supabase
        .from('vehicles')
        .select(`
            id,
            stock_code,
            brand,
            model,
            version,
            year,
            plate,
            mileage,
            exterior_color,
            interior_color,
            transmission,
            fuel_type,
            doors,
            body_type,
            sale_price,
            minimum_price,
            is_offer,
            offer_price,
            offer_label,
            status,
            published,
            featured,
            description,
            features,
            equipment,
            slug,
            created_at,
            updated_at,
            images:vehicle_images(id, vehicle_id, storage_path, url, is_primary, sort_order, created_at)
        `)
        .eq('is_deleted', false);

    if (status && status !== 'ALL') {
        query = query.eq('status', status);
    } else {
        query = query.in('status', ['AVAILABLE', 'RESERVED']);
    }

    if (body_type && body_type !== 'ALL') {
        query = query.eq('body_type', body_type);
    }

    if (transmission && transmission !== 'ALL') {
        query = query.eq('transmission', transmission);
    }

    if (fuel_type && fuel_type !== 'ALL') {
        query = query.eq('fuel_type', fuel_type);
    }

    if (search && search.trim() !== '') {
        const q = search.trim();
        query = query.or(`brand.ilike.%${q}%,model.ilike.%${q}%,version.ilike.%${q}%,plate.ilike.%${q}%,stock_code.ilike.%${q}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching seller stock:', error);
        return [];
    }

    const vehicles = (data || []).map((v: any) => ({
        ...v,
        images: (v.images || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
    }));

    return vehicles as SellerVehicle[];
}

/**
 * Obtiene el detalle comercial de un auto para el vendedor (sin costo de compra).
 */
export async function getSellerVehicleDetail(id: string): Promise<SellerVehicle | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('vehicles')
        .select(`
            id,
            stock_code,
            brand,
            model,
            version,
            year,
            plate,
            mileage,
            exterior_color,
            interior_color,
            transmission,
            fuel_type,
            doors,
            body_type,
            sale_price,
            minimum_price,
            is_offer,
            offer_price,
            offer_label,
            status,
            published,
            featured,
            description,
            features,
            equipment,
            slug,
            created_at,
            updated_at,
            images:vehicle_images(id, vehicle_id, storage_path, url, is_primary, sort_order, created_at)
        `)
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

    if (error || !data) {
        console.error('Error fetching seller vehicle detail:', error);
        return null;
    }

    const images = (data.images || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));

    return {
        ...data,
        images
    } as SellerVehicle;
}

/**
 * Búsqueda rápida de clientes para el vendedor de salón.
 */
export async function getSellerClients(search?: string): Promise<Client[]> {
    const supabase = await createServerSupabaseClient();

    let query = supabase
        .from('clients')
        .select('id, first_name, last_name, phone, whatsapp, email, city, province, created_at')
        .eq('is_deleted', false);

    if (search && search.trim() !== '') {
        const q = search.trim();
        query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
    }

    query = query.order('created_at', { ascending: false }).limit(50);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching seller clients:', error);
        return [];
    }

    return (data || []) as Client[];
}

/**
 * Registro rápido de cliente desde la PWA del vendedor.
 * Reutiliza createClientRecord de clients.ts.
 */
export async function createSellerClient(payload: {
    first_name: string;
    last_name: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    city?: string;
    notes?: string;
}) {
    const result = await createClientRecord({
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone: payload.phone,
        whatsapp: payload.whatsapp || payload.phone,
        email: payload.email || undefined,
        city: payload.city || undefined,
        notes: payload.notes ? `[Cargado desde Salón Móvil] ${payload.notes}` : '[Cargado desde Salón Móvil]'
    });

    if (result.success) {
        revalidatePath('/vendedor/clientes');
        revalidatePath('/admin/clientes');
    }

    return result;
}

/**
 * Toma de seña / reserva rápida desde el celular del vendedor.
 * Reutiliza createReservation de reservations.ts.
 */
export async function createSellerReservation(payload: {
    client_id: string;
    vehicle_id: string;
    amount: number;
    expiry_date?: string;
    notes?: string;
}) {
    const result = await createReservation({
        client_id: payload.client_id,
        vehicle_id: payload.vehicle_id,
        amount: payload.amount,
        expiry_date: payload.expiry_date,
        show_reserved_badge: true,
        notes: payload.notes ? `[Salón] ${payload.notes}` : '[Reserva tomada en salón]'
    });

    if (result.success) {
        revalidatePath('/vendedor');
        revalidatePath('/vendedor/reservas');
        revalidatePath('/admin/reservas');
        revalidatePath('/admin/vehiculos');
    }

    return result;
}

/**
 * Obtiene las señas / reservas activas para el salón.
 */
export async function getSellerReservations(): Promise<Reservation[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('reservations')
        .select(`
            id,
            reservation_code,
            client_id,
            vehicle_id,
            amount,
            reservation_date,
            expiry_date,
            status,
            show_reserved_badge,
            notes,
            is_deleted,
            created_at,
            updated_at,
            client:clients(id, first_name, last_name, phone, whatsapp),
            vehicle:vehicles(id, stock_code, brand, model, version, year, plate, sale_price, status)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(30);

    if (error) {
        console.error('Error fetching seller reservations:', error);
        return [];
    }

    return (data || []) as unknown as Reservation[];
}

/**
 * Obtiene los vehículos buscados activos para el salón.
 */
export async function getSellerWantedVehicles(): Promise<WantedVehicle[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('wanted_vehicles')
        .select(`
            *,
            client:clients(id, first_name, last_name, phone, whatsapp)
        `)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .limit(40);

    if (error) {
        console.error('Error fetching seller wanted vehicles:', error);
        return [];
    }

    return (data || []) as WantedVehicle[];
}

/**
 * Carga rápida de pedido de búsqueda de un cliente desde el salón.
 * Reutiliza createWantedVehicle de wanted-vehicles.ts.
 */
export async function createSellerWantedVehicle(payload: {
    client_id: string;
    brand: string;
    model: string;
    min_year?: number;
    max_year?: number;
    max_budget_ars?: number;
    fuel_type?: any;
    transmission?: any;
    priority?: any;
    notes?: string;
}) {
    const result = await createWantedVehicle({
        client_id: payload.client_id,
        brand: payload.brand,
        model: payload.model,
        year_min: payload.min_year,
        year_max: payload.max_year,
        max_budget: payload.max_budget_ars,
        fuel_type: payload.fuel_type,
        transmission: payload.transmission,
        priority: payload.priority || 'MEDIUM',
        notes: payload.notes
    });

    if (result.success) {
        revalidatePath('/vendedor/buscados');
        revalidatePath('/admin/vehiculos-buscados');
    }

    return result;
}
