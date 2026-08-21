'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Registra una imagen de vehículo en la base de datos tras subirse a Storage.
 */
export async function registerVehicleImage(payload: {
    vehicle_id: string;
    storage_path: string;
    url: string;
    is_primary?: boolean;
    sort_order?: number;
    file_name?: string;
    file_size?: number;
    mime_type?: string;
}) {
    const adminClient = createAdminClient();

    // Si es marcada como primaria, desmarcar las otras del mismo vehículo
    if (payload.is_primary) {
        await adminClient
            .from('vehicle_images')
            .update({ is_primary: false })
            .eq('vehicle_id', payload.vehicle_id);
    } else {
        // Si no hay ninguna imagen primaria para este vehículo, hacer que esta sea primaria
        const { data: existing } = await adminClient
            .from('vehicle_images')
            .select('id')
            .eq('vehicle_id', payload.vehicle_id)
            .eq('is_primary', true)
            .maybeSingle();

        if (!existing) {
            payload.is_primary = true;
        }
    }

    const { data, error } = await adminClient
        .from('vehicle_images')
        .insert({
            vehicle_id: payload.vehicle_id,
            storage_path: payload.storage_path,
            url: payload.url,
            is_primary: Boolean(payload.is_primary),
            sort_order: payload.sort_order || 0,
            file_name: payload.file_name || null,
            file_size: payload.file_size || null,
            mime_type: payload.mime_type || null
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/admin/vehiculos/${payload.vehicle_id}`);
    revalidatePath('/admin/vehiculos');
    revalidatePath('/vehiculos');
    revalidatePath('/');

    return { success: true, image: data };
}

/**
 * Fija una imagen como la principal (portada del vehículo).
 */
export async function setPrimaryVehicleImage(vehicleId: string, imageId: string) {
    const adminClient = createAdminClient();

    // 1. Quitar is_primary de todas las fotos de este auto
    await adminClient
        .from('vehicle_images')
        .update({ is_primary: false })
        .eq('vehicle_id', vehicleId);

    // 2. Asignar is_primary a la seleccionada
    const { error } = await adminClient
        .from('vehicle_images')
        .update({ is_primary: true })
        .eq('id', imageId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/admin/vehiculos/${vehicleId}`);
    revalidatePath('/admin/vehiculos');
    revalidatePath('/vehiculos');
    revalidatePath('/');

    return { success: true };
}

/**
 * Reordena las fotos del vehículo según el nuevo array de IDs.
 */
export async function reorderVehicleImages(vehicleId: string, imageIdsInOrder: string[]) {
    const adminClient = createAdminClient();

    for (let i = 0; i < imageIdsInOrder.length; i++) {
        await adminClient
            .from('vehicle_images')
            .update({ sort_order: i })
            .eq('id', imageIdsInOrder[i]);
    }

    revalidatePath(`/admin/vehiculos/${vehicleId}`);
    revalidatePath('/vehiculos');
    return { success: true };
}

/**
 * Elimina una foto de la base de datos y de Supabase Storage.
 */
export async function deleteVehicleImage(imageId: string, vehicleId: string, storagePath: string) {
    const adminClient = createAdminClient();

    // 1. Borrar archivo del Storage
    if (storagePath) {
        await adminClient.storage.from('vehicle-images').remove([storagePath]);
    }

    // 2. Borrar registro DB
    const { error } = await adminClient
        .from('vehicle_images')
        .delete()
        .eq('id', imageId);

    if (error) {
        return { success: false, error: error.message };
    }

    // 3. Si era la primaria, elegir la primera restante como primaria
    const { data: remaining } = await adminClient
        .from('vehicle_images')
        .select('id, is_primary')
        .eq('vehicle_id', vehicleId)
        .order('sort_order', { ascending: true });

    if (remaining && remaining.length > 0 && !remaining.some(r => r.is_primary)) {
        await adminClient
            .from('vehicle_images')
            .update({ is_primary: true })
            .eq('id', remaining[0].id);
    }

    revalidatePath(`/admin/vehiculos/${vehicleId}`);
    revalidatePath('/admin/vehiculos');
    revalidatePath('/vehiculos');
    revalidatePath('/');

    return { success: true };
}
