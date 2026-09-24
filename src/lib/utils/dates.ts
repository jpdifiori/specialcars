/**
 * Formateadores de fecha para SpecialCars (locale: es-AR).
 */

export function formatDate(dateString: string | Date | null | undefined): string {
    if (!dateString) return '-';
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        if (isNaN(date.getTime())) return '-';
        return new Intl.DateTimeFormat('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'America/Argentina/Buenos_Aires'
        }).format(date);
    } catch {
        return '-';
    }
}

export function formatDateLong(dateString: string | Date | null | undefined): string {
    if (!dateString) return '-';
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        if (isNaN(date.getTime())) return '-';
        return new Intl.DateTimeFormat('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'America/Argentina/Buenos_Aires'
        }).format(date);
    } catch {
        return '-';
    }
}

export function calculateDaysInStock(purchaseDateString: string | Date | null | undefined, saleDateString?: string | Date | null | undefined): number {
    if (!purchaseDateString) return 0;
    try {
        const start = new Date(purchaseDateString);
        const end = saleDateString ? new Date(saleDateString) : new Date();
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
        return 0;
    }
}

export function formatRelativeContact(dateString: string | Date | null | undefined): string {
    if (!dateString) return '';
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        if (isNaN(date.getTime())) return '';
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Hace instantes';
        if (diffHours < 24) return `Hoy hace ${diffHours}h`;
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return formatDate(date);
    } catch {
        return '';
    }
}

