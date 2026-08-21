/**
 * Formateador de moneda oficial para SpecialCars.
 * Regla: ARS exclusivamente, formato $ XX.XXX.XXX, sin decimales.
 */
export function formatARS(amount: number | string | null | undefined): string {
    if (amount === null || amount === undefined || amount === '') {
        return '$ 0';
    }

    const num = typeof amount === 'string' ? parseInt(amount.replace(/[^0-9-]/g, ''), 10) || 0 : Math.round(amount);

    // Formatear con separador de miles '.' para es-AR
    const formatted = new Intl.NumberFormat('es-AR', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
    }).format(num);

    return `$ ${formatted}`;
}

/**
 * Parsea un string ingresado por el usuario (ej: "$ 25.000.000" o "25000000") a número entero.
 */
export function parseARS(value: string | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return Math.round(value);
    
    const cleaned = value.toString().replace(/[^0-9-]/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formatea porcentaje con formato argentino (coma decimal, ej: 22,73 %)
 */
export function formatPercent(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
        return '0,00 %';
    }

    const formatted = new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
    }).format(value);

    return `${formatted} %`;
}
