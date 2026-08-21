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
            year: 'numeric'
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
            year: 'numeric'
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
