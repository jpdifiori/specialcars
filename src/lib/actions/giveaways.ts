'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Giveaway, GiveawayPrize, GiveawayParticipant, GiveawayStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Obtiene el sorteo activo principal para mostrar en la web pública (Landing / Sorteos).
 * Si no hay uno activo, busca el último finalizado recientemente para mostrar los ganadores.
 */
export async function getActiveGiveaway(): Promise<{
    active: Giveaway | null;
    latestClosed: Giveaway | null;
}> {
    try {
        const admin = createAdminClient();

        // 1. Buscar sorteo activo
        const { data: activeData, error: activeErr } = await admin
            .from('giveaways')
            .select(`
                *,
                prizes:giveaway_prizes(*),
                participants:giveaway_participants(count)
            `)
            .eq('status', 'active')
            .eq('is_deleted', false)
            .order('end_date', { ascending: true })
            .limit(1)
            .maybeSingle();

        let active: Giveaway | null = null;
        if (activeData) {
            const count = activeData.participants?.[0]?.count ?? 0;
            const prizes = (activeData.prizes || []).sort((a: any, b: any) => a.position - b.position);
            active = {
                ...activeData,
                prizes,
                participants_count: count
            };
        }

        // 2. Buscar último sorteo cerrado con ganadores
        const { data: closedData, error: closedErr } = await admin
            .from('giveaways')
            .select(`
                *,
                prizes:giveaway_prizes(*),
                participants:giveaway_participants(count)
            `)
            .eq('status', 'closed')
            .eq('is_deleted', false)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        let latestClosed: Giveaway | null = null;
        if (closedData) {
            const count = closedData.participants?.[0]?.count ?? 0;
            const prizes = (closedData.prizes || []).sort((a: any, b: any) => a.position - b.position);
            latestClosed = {
                ...closedData,
                prizes,
                participants_count: count
            };
        }

        return { active, latestClosed };
    } catch (err: any) {
        console.error('Error fetching active giveaway:', err);
        return { active: null, latestClosed: null };
    }
}

/**
 * Obtiene todos los sorteos públicos (activos y cerrados para historial).
 */
export async function getPublicGiveaways(): Promise<Giveaway[]> {
    try {
        const admin = createAdminClient();
        const { data, error } = await admin
            .from('giveaways')
            .select(`
                *,
                prizes:giveaway_prizes(*),
                participants:giveaway_participants(count)
            `)
            .in('status', ['active', 'closed'])
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

        if (error || !data) return [];

        return data.map((g: any) => ({
            ...g,
            prizes: (g.prizes || []).sort((a: any, b: any) => a.position - b.position),
            participants_count: g.participants?.[0]?.count ?? 0
        }));
    } catch (err) {
        console.error('Error fetching public giveaways:', err);
        return [];
    }
}

/**
 * Registra un participante en un sorteo activo.
 * Incluye validaciones y chequeo de duplicados por email y celular.
 */
export async function registerGiveawayParticipant(payload: {
    giveaway_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}) {
    const admin = createAdminClient();

    const firstName = payload.first_name?.trim();
    const lastName = payload.last_name?.trim();
    const email = payload.email?.trim().toLowerCase();
    const phone = payload.phone?.trim().replace(/\s+/g, '');

    if (!firstName || !lastName || !email || !phone) {
        return { success: false, error: 'Por favor completá todos los campos obligatorios.' };
    }

    if (!email.includes('@') || !email.includes('.')) {
        return { success: false, error: 'El correo electrónico no tiene un formato válido.' };
    }

    if (phone.length < 8) {
        return { success: false, error: 'El número de celular ingresado es demasiado corto.' };
    }

    try {
        // Verificar que el sorteo existe y está activo
        const { data: giveaway, error: gwErr } = await admin
            .from('giveaways')
            .select('id, title, status, end_date')
            .eq('id', payload.giveaway_id)
            .eq('is_deleted', false)
            .single();

        if (gwErr || !giveaway) {
            return { success: false, error: 'El sorteo seleccionado no existe o no está disponible.' };
        }

        if (giveaway.status !== 'active') {
            return { success: false, error: 'Este sorteo ya no se encuentra activo.' };
        }

        // Verificar duplicados
        const { data: existingEmail } = await admin
            .from('giveaway_participants')
            .select('id')
            .eq('giveaway_id', payload.giveaway_id)
            .ilike('email', email)
            .maybeSingle();

        if (existingEmail) {
            return { success: false, error: 'Este correo electrónico ya se encuentra registrado en este sorteo.' };
        }

        const { data: existingPhone } = await admin
            .from('giveaway_participants')
            .select('id')
            .eq('giveaway_id', payload.giveaway_id)
            .eq('phone', phone)
            .maybeSingle();

        if (existingPhone) {
            return { success: false, error: 'Este número de celular ya está registrado en este sorteo.' };
        }

        // Insertar participante
        const { data: newParticipant, error: insertErr } = await admin
            .from('giveaway_participants')
            .insert({
                giveaway_id: payload.giveaway_id,
                first_name: firstName,
                last_name: lastName,
                email,
                phone
            })
            .select()
            .single();

        if (insertErr) {
            console.error('Error inserting giveaway participant:', insertErr);
            return { success: false, error: 'No se pudo completar el registro. Intentalo de nuevo.' };
        }

        revalidatePath('/sorteos');
        revalidatePath('/');
        revalidatePath(`/admin/sorteos/${payload.giveaway_id}`);

        return {
            success: true,
            data: newParticipant,
            message: `¡Felicitaciones ${firstName}! Ya estás participando del sorteo "${giveaway.title}".`
        };
    } catch (err: any) {
        console.error('Error in registerGiveawayParticipant:', err);
        return { success: false, error: err.message || 'Error inesperado al registrar participación.' };
    }
}

// ==========================================
// ACCIONES DEL PANEL DE ADMINISTRACIÓN
// ==========================================

/**
 * Obtiene todos los sorteos para la tabla de administración.
 */
export async function getGiveawaysAdmin(): Promise<Giveaway[]> {
    try {
        const admin = createAdminClient();
        const { data, error } = await admin
            .from('giveaways')
            .select(`
                *,
                prizes:giveaway_prizes(*),
                participants:giveaway_participants(count)
            `)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching admin giveaways:', error);
            return [];
        }

        return (data || []).map((g: any) => ({
            ...g,
            prizes: (g.prizes || []).sort((a: any, b: any) => a.position - b.position),
            participants_count: g.participants?.[0]?.count ?? 0
        }));
    } catch (err) {
        console.error('Error in getGiveawaysAdmin:', err);
        return [];
    }
}

/**
 * Obtiene un sorteo por ID con todos sus detalles para el Admin.
 */
export async function getGiveawayById(id: string): Promise<Giveaway | null> {
    try {
        const admin = createAdminClient();
        const { data, error } = await admin
            .from('giveaways')
            .select(`
                *,
                prizes:giveaway_prizes(*),
                participants:giveaway_participants(count)
            `)
            .eq('id', id)
            .eq('is_deleted', false)
            .maybeSingle();

        if (error || !data) return null;

        return {
            ...data,
            prizes: (data.prizes || []).sort((a: any, b: any) => a.position - b.position),
            participants_count: data.participants?.[0]?.count ?? 0
        };
    } catch (err) {
        console.error('Error in getGiveawayById:', err);
        return null;
    }
}

/**
 * Obtiene los participantes inscriptos a un sorteo.
 */
export async function getGiveawayParticipantsAction(giveawayId: string): Promise<GiveawayParticipant[]> {
    try {
        const admin = createAdminClient();
        const { data, error } = await admin
            .from('giveaway_participants')
            .select('*')
            .eq('giveaway_id', giveawayId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching giveaway participants:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Error in getGiveawayParticipantsAction:', err);
        return [];
    }
}

/**
 * Sube una imagen de premio o banner a Supabase Storage (bucket: 'giveaways').
 */
export async function uploadGiveawayImageAction(formData: FormData): Promise<{
    success: boolean;
    url?: string;
    error?: string;
}> {
    const admin = createAdminClient();
    const file = formData.get('file') as File;
    const giveawayId = (formData.get('giveaway_id') as string) || 'general';

    if (!file) {
        return { success: false, error: 'No se envió ningún archivo.' };
    }

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `${giveawayId}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

        const { error: uploadErr } = await admin.storage
            .from('giveaways')
            .upload(fileName, buffer, {
                contentType: file.type || 'image/jpeg',
                cacheControl: '3600',
                upsert: true
            });

        if (uploadErr) {
            console.error('Error subiendo imagen a Storage giveaways:', uploadErr);
            return { success: false, error: uploadErr.message };
        }

        const { data: publicUrlData } = admin.storage
            .from('giveaways')
            .getPublicUrl(fileName);

        return { success: true, url: publicUrlData.publicUrl };
    } catch (err: any) {
        console.error('Error in uploadGiveawayImageAction:', err);
        return { success: false, error: err.message || 'Error al procesar la imagen.' };
    }
}

/**
 * Crea un nuevo sorteo con sus premios configurados.
 */
export async function createGiveawayAction(payload: {
    title: string;
    description?: string;
    terms_and_conditions?: string;
    start_date: string;
    end_date: string;
    status?: GiveawayStatus;
    banner_url?: string;
    prizes: {
        position: number;
        title: string;
        description?: string;
        image_url?: string;
    }[];
}) {
    const admin = createAdminClient();

    if (!payload.title || !payload.end_date) {
        return { success: false, error: 'El título y la fecha de finalización son obligatorios.' };
    }

    try {
        const slug = payload.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

        // 1. Insertar el sorteo
        const { data: giveaway, error: gwErr } = await admin
            .from('giveaways')
            .insert({
                title: payload.title.trim(),
                slug,
                description: payload.description?.trim() || null,
                terms_and_conditions: payload.terms_and_conditions?.trim() || null,
                start_date: payload.start_date || new Date().toISOString(),
                end_date: payload.end_date,
                status: payload.status || 'draft',
                banner_url: payload.banner_url || null
            })
            .select()
            .single();

        if (gwErr || !giveaway) {
            console.error('Error creating giveaway:', gwErr);
            return { success: false, error: gwErr?.message || 'Error al crear el sorteo.' };
        }

        // 2. Insertar premios si fueron definidos
        if (payload.prizes && payload.prizes.length > 0) {
            const prizesToInsert = payload.prizes.map((p, idx) => ({
                giveaway_id: giveaway.id,
                position: p.position || idx + 1,
                title: p.title.trim(),
                description: p.description?.trim() || null,
                image_url: p.image_url || null
            }));

            const { error: prizesErr } = await admin
                .from('giveaway_prizes')
                .insert(prizesToInsert);

            if (prizesErr) {
                console.error('Error creating prizes for giveaway:', prizesErr);
            }
        }

        revalidatePath('/admin/sorteos');
        revalidatePath('/sorteos');
        revalidatePath('/');

        return { success: true, data: giveaway };
    } catch (err: any) {
        console.error('Error in createGiveawayAction:', err);
        return { success: false, error: err.message || 'Error inesperado al crear el sorteo.' };
    }
}

/**
 * Actualiza los datos y premios de un sorteo.
 */
export async function updateGiveawayAction(
    id: string,
    payload: {
        title: string;
        description?: string;
        terms_and_conditions?: string;
        start_date: string;
        end_date: string;
        status?: GiveawayStatus;
        banner_url?: string;
        prizes: {
            id?: string;
            position: number;
            title: string;
            description?: string;
            image_url?: string;
            winner_participant_id?: string | null;
            winner_name?: string | null;
        }[];
    }
) {
    const admin = createAdminClient();

    try {
        // 1. Actualizar sorteo
        const { error: gwErr } = await admin
            .from('giveaways')
            .update({
                title: payload.title.trim(),
                description: payload.description?.trim() || null,
                terms_and_conditions: payload.terms_and_conditions?.trim() || null,
                start_date: payload.start_date,
                end_date: payload.end_date,
                status: payload.status,
                banner_url: payload.banner_url || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (gwErr) {
            console.error('Error updating giveaway:', gwErr);
            return { success: false, error: gwErr.message };
        }

        // 2. Gestionar premios
        // Eliminar premios que ya no existen
        const incomingPrizeIds = payload.prizes.filter(p => p.id).map(p => p.id!);
        if (incomingPrizeIds.length > 0) {
            await admin
                .from('giveaway_prizes')
                .delete()
                .eq('giveaway_id', id)
                .not('id', 'in', `(${incomingPrizeIds.join(',')})`);
        } else {
            await admin.from('giveaway_prizes').delete().eq('giveaway_id', id);
        }

        // Upsert de premios
        for (const [idx, p] of payload.prizes.entries()) {
            const prizeData = {
                giveaway_id: id,
                position: p.position || idx + 1,
                title: p.title.trim(),
                description: p.description?.trim() || null,
                image_url: p.image_url || null,
                winner_participant_id: p.winner_participant_id || null,
                winner_name: p.winner_name || null,
                updated_at: new Date().toISOString()
            };

            if (p.id) {
                await admin.from('giveaway_prizes').update(prizeData).eq('id', p.id);
            } else {
                await admin.from('giveaway_prizes').insert(prizeData);
            }
        }

        revalidatePath('/admin/sorteos');
        revalidatePath(`/admin/sorteos/${id}`);
        revalidatePath('/sorteos');
        revalidatePath('/');

        return { success: true };
    } catch (err: any) {
        console.error('Error in updateGiveawayAction:', err);
        return { success: false, error: err.message || 'Error al actualizar el sorteo.' };
    }
}

/**
 * Cambia el estado de un sorteo (borrador, activo, cerrado, cancelado).
 */
export async function updateGiveawayStatusAction(id: string, status: GiveawayStatus) {
    const admin = createAdminClient();

    try {
        const { error } = await admin
            .from('giveaways')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin/sorteos');
        revalidatePath(`/admin/sorteos/${id}`);
        revalidatePath('/sorteos');
        revalidatePath('/');

        return { success: true };
    } catch (err: any) {
        console.error('Error in updateGiveawayStatusAction:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Asigna un ganador (manual o participante inscripto) a un puesto/premio.
 */
export async function assignGiveawayWinnerAction(payload: {
    prize_id: string;
    giveaway_id: string;
    participant_id?: string | null;
    winner_name: string;
}) {
    const admin = createAdminClient();

    try {
        const winnerName = payload.winner_name.trim();

        // 1. Actualizar el premio con los datos del ganador
        const { error: prizeErr } = await admin
            .from('giveaway_prizes')
            .update({
                winner_participant_id: payload.participant_id || null,
                winner_name: winnerName,
                winner_announced_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', payload.prize_id);

        if (prizeErr) throw prizeErr;

        // 2. Si se vinculó a un participante registrado, marcarlo como ganador
        if (payload.participant_id) {
            // Obtener la posición del premio
            const { data: prize } = await admin
                .from('giveaway_prizes')
                .select('position')
                .eq('id', payload.prize_id)
                .single();

            await admin
                .from('giveaway_participants')
                .update({
                    is_winner: true,
                    prize_position: prize?.position || 1
                })
                .eq('id', payload.participant_id);
        }

        revalidatePath('/admin/sorteos');
        revalidatePath(`/admin/sorteos/${payload.giveaway_id}`);
        revalidatePath('/sorteos');
        revalidatePath('/');

        return { success: true };
    } catch (err: any) {
        console.error('Error in assignGiveawayWinnerAction:', err);
        return { success: false, error: err.message || 'Error al asignar ganador.' };
    }
}

/**
 * Sortea un ganador de forma 100% aleatoria entre todos los inscriptos válidos
 * que aún no hayan ganado ningún premio en este sorteo.
 */
export async function drawRandomWinnerAction(
    giveawayId: string, 
    prizeId: string
): Promise<{ 
    success: boolean; 
    winner?: GiveawayParticipant; 
    winnerName?: string; 
    error?: string;
}> {
    const admin = createAdminClient();

    try {
        // Obtener todos los participantes del sorteo que no son ganadores todavía
        const { data: eligibleParticipants, error: partErr } = await admin
            .from('giveaway_participants')
            .select('*')
            .eq('giveaway_id', giveawayId)
            .eq('is_winner', false);

        if (partErr || !eligibleParticipants || eligibleParticipants.length === 0) {
            return {
                success: false,
                error: 'No hay participantes disponibles o todos ya han ganado un premio.'
            };
        }

        // Selección aleatoria
        const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
        const selectedWinner = eligibleParticipants[randomIndex];
        const winnerFullName = `${selectedWinner.first_name} ${selectedWinner.last_name}`;

        // Asignar al premio
        const assignRes = await assignGiveawayWinnerAction({
            prize_id: prizeId,
            giveaway_id: giveawayId,
            participant_id: selectedWinner.id,
            winner_name: winnerFullName
        });

        if (!assignRes.success) {
            return assignRes;
        }

        return {
            success: true,
            winner: selectedWinner,
            winnerName: winnerFullName
        };
    } catch (err: any) {
        console.error('Error in drawRandomWinnerAction:', err);
        return { success: false, error: err.message || 'Error al realizar el sorteo aleatorio.' };
    }
}

/**
 * Elimina (soft delete) un sorteo.
 */
export async function deleteGiveawayAction(id: string) {
    const admin = createAdminClient();

    try {
        const { error } = await admin
            .from('giveaways')
            .update({ is_deleted: true, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin/sorteos');
        revalidatePath('/sorteos');
        revalidatePath('/');

        return { success: true };
    } catch (err: any) {
        console.error('Error in deleteGiveawayAction:', err);
        return { success: false, error: err.message };
    }
}
