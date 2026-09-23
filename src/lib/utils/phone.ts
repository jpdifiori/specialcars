/**
 * Utilidades para normalización y formateo de números de teléfono y WhatsApp.
 */

/**
 * Normaliza un número telefónico para la API de WhatsApp (wa.me).
 * Agrega el prefijo de país 549 (Argentina) si falta o ajusta si tiene prefijo 54.
 */
export function formatWhatsAppNumber(rawPhone?: string | null): string {
    if (!rawPhone) return '';
    
    let cleaned = rawPhone.replace(/\D/g, '');
    if (!cleaned) return '';

    // Si comienza con 0 (código interurbano local en Argentina), removerlo
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.replace(/^0+/, '');
    }

    // Si ya empieza con 549 (Argentina móvil para WhatsApp)
    if (cleaned.startsWith('549')) {
        return cleaned;
    }

    // Si empieza con 54 pero le falta el 9 móvil (ej: +54 2262...)
    if (cleaned.startsWith('54')) {
        return `549${cleaned.slice(2)}`;
    }

    // Si tiene 10 dígitos o más (código de área + número sin 0 ni 15)
    if (cleaned.length >= 10) {
        return `549${cleaned}`;
    }

    return cleaned;
}

/**
 * Genera la URL universal de WhatsApp (wa.me) con mensaje opcional prellenado.
 */
export function buildWhatsAppUrl(phone?: string | null, text?: string): string {
    const formatted = formatWhatsAppNumber(phone);
    if (!formatted) return '';

    const base = `https://wa.me/${formatted}`;
    return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
