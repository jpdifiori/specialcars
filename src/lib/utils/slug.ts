/**
 * Genera un slug SEO amigable a partir de marca, modelo, versión y año.
 * Ej: "Fiat", "Toro", "Volcano 4x4", 2021 -> "fiat-toro-volcano-4x4-2021"
 */
export function generateVehicleSlug(brand: string, model: string, version?: string | null, year?: number | null): string {
    const parts = [brand, model, version, year ? year.toString() : '']
        .filter(Boolean)
        .join(' ');

    return parts
        .toLowerCase()
        .normalize('NFD') // Quita acentos
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-') // Reemplaza no alfanuméricos por guiones
        .replace(/^-+|-+$/g, ''); // Quita guiones iniciales o finales
}
