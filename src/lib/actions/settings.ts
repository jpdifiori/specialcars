'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AgencySettings } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Obtiene la configuración de la agencia (datos de contacto, horarios, redes, legal).
 */
export async function getAgencySettings(): Promise<AgencySettings> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('agency_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

    if (error || !data) {
        // Retornar defaults si aún no se inicializó la tabla
        return {
            id: 'default',
            name: 'Special Cars',
            description: 'Concesionaria líder en vehículos premium, usados y 0 KM. Más de 15 años brindando transparencia, calidad y confianza en cada operación.',
            address: 'Calle 48 2350',
            city: '',
            province: '',
            phone: '+54 2262 57-4254',
            whatsapp: '5492262574254',
            email: 'juanpablo.difiori@gmail.com',
            instagram: 'https://instagram.com/specialcarsneceochea',
            facebook: 'https://facebook.com/specialcars',
            tiktok: 'https://tiktok.com/@specialcars_neceochea',
            google_maps_url: null,
            business_hours: 'Lunes a Viernes de 8:00 a 17:00 hs. Sábados de 08:00 a 12:30 hs.',
            legal_info: null,
            updated_at: new Date().toISOString()
        };
    }

    return data as AgencySettings;
}

/**
 * Actualiza la configuración de la agencia.
 */
export async function updateAgencySettings(payload: Partial<AgencySettings>) {
    const adminClient = createAdminClient();

    // Obtener el ID del registro actual o insertar
    const { data: current } = await adminClient.from('agency_settings').select('id').limit(1).maybeSingle();

    const updateData: any = {
        name: payload.name?.trim() || 'Special Cars',
        description: payload.description?.trim() || '',
        address: payload.address?.trim() || '',
        city: payload.city?.trim() || '',
        province: payload.province?.trim() || '',
        phone: payload.phone?.trim() || '+54 2262 57-4254',
        whatsapp: payload.whatsapp?.trim() || '5492262574254',
        email: payload.email?.trim() || '',
        instagram: payload.instagram?.trim() || null,
        facebook: payload.facebook?.trim() || null,
        tiktok: payload.tiktok?.trim() || null,
        google_maps_url: payload.google_maps_url?.trim() || null,
        business_hours: payload.business_hours?.trim() || '',
        legal_info: payload.legal_info?.trim() || null,
        logo_url: payload.logo_url || null,
        hero_image_url: payload.hero_image_url || null,
        updated_at: new Date().toISOString()
    };

    let result;
    if (current?.id) {
        result = await adminClient
            .from('agency_settings')
            .update(updateData)
            .eq('id', current.id)
            .select()
            .single();
    } else {
        result = await adminClient
            .from('agency_settings')
            .insert(updateData)
            .select()
            .single();
    }

    if (result.error) {
        return { success: false, error: result.error.message };
    }

    revalidatePath('/admin/configuracion');
    revalidatePath('/');
    revalidatePath('/vehiculos');

    return { success: true, settings: result.data };
}
