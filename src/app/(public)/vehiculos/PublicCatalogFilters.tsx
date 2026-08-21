'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, RotateCcw } from 'lucide-react';

function CatalogFiltersInner() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [brand, setBrand] = useState(searchParams.get('brand') || 'ALL');
    const [bodyType, setBodyType] = useState(searchParams.get('body_type') || 'ALL');
    const [fuelType, setFuelType] = useState(searchParams.get('fuel_type') || 'ALL');
    const [transmission, setTransmission] = useState(searchParams.get('transmission') || 'ALL');
    const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'newest');
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (brand && brand !== 'ALL') params.set('brand', brand);
        if (bodyType && bodyType !== 'ALL') params.set('body_type', bodyType);
        if (fuelType && fuelType !== 'ALL') params.set('fuel_type', fuelType);
        if (transmission && transmission !== 'ALL') params.set('transmission', transmission);
        if (sortBy && sortBy !== 'newest') params.set('sort_by', sortBy);
        if (minPrice) params.set('min_price', minPrice);
        if (maxPrice) params.set('max_price', maxPrice);

        router.push(`/vehiculos?${params.toString()}`);
    };

    const resetFilters = () => {
        setBrand('ALL');
        setBodyType('ALL');
        setFuelType('ALL');
        setTransmission('ALL');
        setSortBy('newest');
        setMinPrice('');
        setMaxPrice('');
        router.push('/vehiculos');
    };

    return (
        <aside className="catalog-sidebar">
            <div className="catalog-sidebar-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Filter size={16} style={{ color: '#3b82f6' }} />
                    <span>Filtros de Búsqueda</span>
                </div>
                <button 
                    onClick={resetFilters}
                    style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}
                    title="Limpiar filtros"
                >
                    <RotateCcw size={12} />
                    <span>Limpiar</span>
                </button>
            </div>

            {/* Ordenar */}
            <div className="filter-group">
                <label className="filter-label">Ordenar Por</label>
                <select
                    className="admin-select"
                    style={{ width: '100%' }}
                    value={sortBy}
                    onChange={(e) => {
                        setSortBy(e.target.value);
                        setTimeout(applyFilters, 50);
                    }}
                >
                    <option value="newest">Más recientes ingresados</option>
                    <option value="price_asc">Menor precio ($ ARS)</option>
                    <option value="price_desc">Mayor precio ($ ARS)</option>
                    <option value="year_desc">Más nuevos (Año)</option>
                    <option value="mileage_asc">Menos kilómetros</option>
                </select>
            </div>

            {/* Tipo de Vehículo */}
            <div className="filter-group">
                <label className="filter-label">Tipo de Carrocería</label>
                <select
                    className="admin-select"
                    style={{ width: '100%' }}
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                >
                    <option value="ALL">Todos los tipos</option>
                    <option value="AUTO">Auto / Sedán / Hatchback</option>
                    <option value="SUV">SUV</option>
                    <option value="PICKUP">Pickup</option>
                    <option value="UTILITY">Utilitario</option>
                </select>
            </div>

            {/* Combustible */}
            <div className="filter-group">
                <label className="filter-label">Combustible</label>
                <select
                    className="admin-select"
                    style={{ width: '100%' }}
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                >
                    <option value="ALL">Todos los combustibles</option>
                    <option value="NAFTA">Nafta</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="GNC">GNC</option>
                    <option value="HYBRID">Híbrido</option>
                </select>
            </div>

            {/* Transmisión */}
            <div className="filter-group">
                <label className="filter-label">Transmisión</label>
                <select
                    className="admin-select"
                    style={{ width: '100%' }}
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                >
                    <option value="ALL">Todas las cajas</option>
                    <option value="MANUAL">Manual</option>
                    <option value="AUTOMATIC">Automática</option>
                </select>
            </div>

            {/* Rango de Precios en ARS */}
            <div className="filter-group">
                <label className="filter-label">Rango de Precio ($ ARS)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input
                        type="number"
                        className="admin-input"
                        placeholder="Mínimo"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <input
                        type="number"
                        className="admin-input"
                        placeholder="Máximo"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />
                </div>
            </div>

            <button
                onClick={applyFilters}
                className="btn-primary"
                style={{ width: '100%', marginTop: 12 }}
            >
                Aplicar Filtros
            </button>
        </aside>
    );
}

export function PublicCatalogFilters() {
    return (
        <Suspense fallback={<div className="catalog-sidebar" style={{ minHeight: 300 }} />}>
            <CatalogFiltersInner />
        </Suspense>
    );
}
