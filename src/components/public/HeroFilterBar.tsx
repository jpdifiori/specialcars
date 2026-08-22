'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Flame, Car, Filter, ArrowRight } from 'lucide-react';
import { POPULAR_CAR_BRANDS } from '@/lib/constants/car-brands';

export function HeroFilterBar() {
    const router = useRouter();
    const [selectedBrand, setSelectedBrand] = useState('ALL');
    const [selectedBodyType, setSelectedBodyType] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (selectedBrand && selectedBrand !== 'ALL') {
            params.set('brand', selectedBrand);
        }
        if (selectedBodyType && selectedBodyType !== 'ALL') {
            params.set('body_type', selectedBodyType);
        }
        if (searchTerm.trim()) {
            params.set('brand', searchTerm.trim());
        }

        const query = params.toString();
        router.push(query ? `/vehiculos?${query}` : '/vehiculos');
    };

    return (
        <div className="hero-filter-container">
            <div className="hero-filter-card">
                {/* Header / Título del Buscador Rápido */}
                <div className="hero-filter-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            backgroundColor: '#FFF7ED',
                            color: '#EA580C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Search size={16} />
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                            Buscador Rápido de Vehículos
                        </span>
                    </div>
                    <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                        Encontrá tu auto en segundos
                    </span>
                </div>

                {/* Formulario Principal de Filtros */}
                <form onSubmit={handleSearch} className="hero-filter-form">
                    {/* Selector de Marca */}
                    <div className="hero-filter-field">
                        <label className="hero-filter-label">Marca</label>
                        <select
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                            className="hero-filter-select"
                        >
                            <option value="ALL">Todas las marcas</option>
                            {POPULAR_CAR_BRANDS.filter(b => b !== 'Otro').map((brand) => (
                                <option key={brand} value={brand}>
                                    {brand}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Tipo / Carrocería */}
                    <div className="hero-filter-field">
                        <label className="hero-filter-label">Tipo de Vehículo</label>
                        <select
                            value={selectedBodyType}
                            onChange={(e) => setSelectedBodyType(e.target.value)}
                            className="hero-filter-select"
                        >
                            <option value="ALL">Todos los tipos</option>
                            <option value="SUV">SUV / Camioneta</option>
                            <option value="PICKUP">Pick-up</option>
                            <option value="SEDAN">Sedán</option>
                            <option value="HATCHBACK">Hatchback / 5 Puertas</option>
                            <option value="COUPE">Coupé / Deportivo</option>
                            <option value="UTILITARIO">Utilitario / Furgón</option>
                        </select>
                    </div>

                    {/* Botón de Acción Principal */}
                    <button
                        type="submit"
                        className="hero-filter-btn"
                    >
                        <Search size={17} />
                        <span>Ver Resultados</span>
                    </button>
                </form>

                {/* Accesos Rápidos / Categorías Populares en Móvil y Desktop */}
                <div className="hero-filter-chips">
                    <span style={{ fontSize: 12, color: '#64748B', fontWeight: 700, marginRight: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Filter size={13} />
                        Accesos rápidos:
                    </span>
                    <Link href="/ofertas" className="hero-chip hero-chip-fire">
                        <Flame size={13} />
                        <span>Ofertas Especiales</span>
                    </Link>
                    <Link href="/vehiculos?body_type=PICKUP" className="hero-chip">
                        <span>🛻 Pick-ups</span>
                    </Link>
                    <Link href="/vehiculos?body_type=SUV" className="hero-chip">
                        <span>🚙 SUVs</span>
                    </Link>
                    <Link href="/vehiculos?body_type=SEDAN" className="hero-chip">
                        <span>🚗 Sedanes</span>
                    </Link>
                    <Link href="/#buscar-auto" className="hero-chip hero-chip-highlight">
                        <span>✨ Pedir auto específico</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
