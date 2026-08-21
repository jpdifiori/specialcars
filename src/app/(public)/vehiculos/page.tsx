import { getPublicVehicles } from '@/lib/actions/vehicles';
import { VehicleCard } from '@/components/public/VehicleCard';
import { PublicCatalogFilters } from './PublicCatalogFilters';
import { Car, Filter } from 'lucide-react';

export const metadata = {
    title: 'Catálogo de Vehículos en Stock | Special Cars',
    description: 'Explorá nuestro inventario actualizado de vehículos seleccionados, usados y 0 KM con precios en Pesos Argentinos (ARS).'
};

export default async function PublicCatalogPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams;

    const res = await getPublicVehicles({
        brand: params.brand,
        body_type: params.body_type,
        fuel_type: params.fuel_type,
        transmission: params.transmission,
        min_price: params.min_price ? parseInt(params.min_price, 10) : undefined,
        max_price: params.max_price ? parseInt(params.max_price, 10) : undefined,
        min_year: params.min_year ? parseInt(params.min_year, 10) : undefined,
        max_year: params.max_year ? parseInt(params.max_year, 10) : undefined,
        sort_by: (params.sort_by as any) || 'newest',
        limit: 24
    });

    const vehicles = res.data;

    return (
        <div className="public-section" style={{ paddingTop: 40 }}>
            {/* Header del Catálogo */}
            <div style={{ marginBottom: 32 }}>
                <h1 className="section-title">
                    Catálogo de Vehículos Disponibles
                </h1>
                <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
                    Mostrando <strong>{res.total} unidades</strong> disponibles en stock con precios oficiales en Pesos Argentinos ($ ARS).
                </p>
            </div>

            {/* Layout Catálogo: Sidebar Filtros + Grid */}
            <div className="catalog-container">
                {/* Sidebar Filtros */}
                <PublicCatalogFilters />

                {/* Grid de Vehículos */}
                <div>
                    {vehicles.length === 0 ? (
                        <div style={{ padding: 60, textAlign: 'center', backgroundColor: '#0e121c', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Car size={44} style={{ color: '#64748b', margin: '0 auto 12px' }} />
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                                No se encontraron vehículos
                            </h3>
                            <p style={{ fontSize: 13.5, color: '#94a3b8', maxWidth: 460, margin: '0 auto' }}>
                                Probá ajustando o limpiando los filtros seleccionados para ver más unidades disponibles.
                            </p>
                        </div>
                    ) : (
                        <div className="vehicles-grid">
                            {vehicles.map((v) => (
                                <VehicleCard key={v.id} vehicle={v} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
