'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SellerVehicle } from '@/lib/actions/seller';
import { formatARS } from '@/lib/utils/currency';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { SellerQuickReservationModal } from '@/components/seller/SellerQuickReservationModal';
import { 
    Search, 
    X, 
    Car, 
    Gauge, 
    Fuel, 
    Cog, 
    Calendar, 
    BookmarkCheck, 
    Share2, 
    ExternalLink, 
    ChevronRight,
    SlidersHorizontal
} from 'lucide-react';

interface SellerStockViewProps {
    initialVehicles: SellerVehicle[];
}

export function SellerStockView({ initialVehicles }: SellerStockViewProps) {
    const [vehicles, setVehicles] = useState<SellerVehicle[]>(initialVehicles);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'RESERVED'>('ALL');
    const [bodyTypeFilter, setBodyTypeFilter] = useState('ALL');

    // Modal de reserva rápida
    const [reservingVehicle, setReservingVehicle] = useState<SellerVehicle | null>(null);

    // Filtrado en vivo
    const filteredVehicles = useMemo(() => {
        return vehicles.filter((v) => {
            if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
            if (bodyTypeFilter !== 'ALL' && v.body_type !== bodyTypeFilter) return false;

            if (search.trim()) {
                const q = search.toLowerCase().trim();
                const matchBrand = v.brand?.toLowerCase().includes(q);
                const matchModel = v.model?.toLowerCase().includes(q);
                const matchVersion = v.version?.toLowerCase().includes(q);
                const matchPlate = v.plate?.toLowerCase().includes(q);
                const matchYear = String(v.year).includes(q);
                const matchStock = v.stock_code?.toLowerCase().includes(q);
                if (!matchBrand && !matchModel && !matchVersion && !matchPlate && !matchYear && !matchStock) {
                    return false;
                }
            }

            return true;
        });
    }, [vehicles, search, statusFilter, bodyTypeFilter]);

    // Función para armar mensaje de WhatsApp para compartir con el cliente
    const handleShareWhatsApp = (v: SellerVehicle, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://specialcars.com.ar';
        const publicUrl = `${siteUrl}/vehiculos/${v.slug || v.id}`;

        const lines = [
            `¡Hola! Te comparto la información del vehículo que vimos en *Special Cars*:`,
            ``,
            `🚗 *${v.brand} ${v.model}* ${v.version || ''} (${v.year})`,
            `📍 *Kilometraje:* ${v.mileage ? v.mileage.toLocaleString('es-AR') + ' km' : '0 km'}`,
            `⚙️ *Transmisión:* ${v.transmission || 'Manual'}`,
            `⛽ *Combustible:* ${v.fuel_type || 'Nafta'}`,
            `💰 *Precio al público:* ${formatARS(v.sale_price)}`,
            ``,
            `📸 *Mirá las fotos y ficha completa acá:*`,
            publicUrl,
            ``,
            `Cualquier consulta avisame y coordinamos para que lo veas en el salón.`
        ];

        const text = encodeURIComponent(lines.join('\n'));
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <div>
            {/* ENCABEZADO DE SALÓN */}
            <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: -0.5 }}>
                        Stock de Salón
                    </h1>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>
                        {filteredVehicles.length} {filteredVehicles.length === 1 ? 'unidad' : 'unidades'}
                    </span>
                </div>
            </div>

            {/* BUSCADOR INSTANTÁNEO */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
                <Search
                    size={17}
                    style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748B'
                    }}
                />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por marca, modelo, año, patente..."
                    style={{
                        width: '100%',
                        backgroundColor: '#111622',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        padding: '11px 40px 11px 42px',
                        color: '#FFFFFF',
                        fontSize: 14,
                        outline: 'none',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            padding: 4,
                            cursor: 'pointer'
                        }}
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* CHIPS DE FILTRO RÁPIDO */}
            <div
                style={{
                    display: 'flex',
                    gap: 6,
                    overflowX: 'auto',
                    paddingBottom: 8,
                    marginBottom: 14,
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {[
                    { label: 'Todos', val: 'ALL' },
                    { label: 'Disponibles', val: 'AVAILABLE' },
                    { label: 'Señados', val: 'RESERVED' }
                ].map((chip) => {
                    const active = statusFilter === chip.val;
                    return (
                        <button
                            key={chip.val}
                            onClick={() => setStatusFilter(chip.val as any)}
                            style={{
                                whiteSpace: 'nowrap',
                                padding: '6px 12px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 700,
                                border: active ? '1px solid #EA580C' : '1px solid rgba(255, 255, 255, 0.08)',
                                backgroundColor: active ? '#EA580C' : '#111622',
                                color: active ? '#FFFFFF' : '#94A3B8',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {chip.label}
                        </button>
                    );
                })}

                {/* Filtro carrocería */}
                {['SUV', 'Sedán', 'Pick-up', 'Hatchback'].map((bType) => {
                    const active = bodyTypeFilter === bType;
                    return (
                        <button
                            key={bType}
                            onClick={() => setBodyTypeFilter(active ? 'ALL' : bType)}
                            style={{
                                whiteSpace: 'nowrap',
                                padding: '6px 12px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 700,
                                border: active ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                                backgroundColor: active ? 'rgba(56, 189, 248, 0.15)' : '#111622',
                                color: active ? '#38BDF8' : '#94A3B8',
                                cursor: 'pointer'
                            }}
                        >
                            {bType}
                        </button>
                    );
                })}
            </div>

            {/* LISTADO DE AUTOS EN TARJETAS TÁCTILES */}
            {filteredVehicles.length === 0 ? (
                <div
                    style={{
                        backgroundColor: '#111622',
                        borderRadius: 16,
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: '#94A3B8'
                    }}
                >
                    <Car size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                        No se encontraron autos
                    </p>
                    <p style={{ fontSize: 13, margin: 0 }}>
                        Probá con otro término de búsqueda o limpiá los filtros.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {filteredVehicles.map((v) => {
                        const mainImage = v.images?.find((img) => img.is_primary)?.url || v.images?.[0]?.url;
                        const isReserved = v.status === 'RESERVED';

                        return (
                            <div
                                key={v.id}
                                style={{
                                    backgroundColor: '#111622',
                                    borderRadius: 16,
                                    border: isReserved ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                                    position: 'relative'
                                }}
                            >
                                {/* FOTO Y BADGES */}
                                <Link
                                    href={`/vendedor/vehiculos/${v.id}`}
                                    style={{ display: 'block', position: 'relative', width: '100%', height: 190, backgroundColor: '#05070B', textDecoration: 'none' }}
                                >
                                    {mainImage ? (
                                        <Image
                                            src={mainImage}
                                            alt={`${v.brand} ${v.model}`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 600px"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                                            <Car size={48} style={{ opacity: 0.3 }} />
                                        </div>
                                    )}

                                    {/* Gradiente para resaltar textos */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'linear-gradient(to top, rgba(17, 22, 34, 0.95) 0%, transparent 60%)'
                                        }}
                                    />

                                    {/* Badges superiores */}
                                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
                                        {isReserved ? (
                                            <span
                                                style={{
                                                    backgroundColor: '#D97706',
                                                    color: '#FFFFFF',
                                                    fontSize: 11,
                                                    fontWeight: 800,
                                                    padding: '3px 8px',
                                                    borderRadius: 6,
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                                                    letterSpacing: 0.4
                                                }}
                                            >
                                                SEÑADO / RESERVADO
                                            </span>
                                        ) : (
                                            <span
                                                style={{
                                                    backgroundColor: '#16A34A',
                                                    color: '#FFFFFF',
                                                    fontSize: 11,
                                                    fontWeight: 800,
                                                    padding: '3px 8px',
                                                    borderRadius: 6,
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                                                    letterSpacing: 0.4
                                                }}
                                            >
                                                DISPONIBLE
                                            </span>
                                        )}

                                        {v.is_offer && (
                                            <span
                                                style={{
                                                    backgroundColor: '#DC2626',
                                                    color: '#FFFFFF',
                                                    fontSize: 11,
                                                    fontWeight: 800,
                                                    padding: '3px 8px',
                                                    borderRadius: 6,
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                                                }}
                                            >
                                                OFERTA
                                            </span>
                                        )}
                                    </div>

                                    {/* Código de Stock */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                            backdropFilter: 'blur(4px)',
                                            color: '#94A3B8',
                                            fontSize: 11,
                                            fontFamily: 'var(--font-mono)',
                                            fontWeight: 700,
                                            padding: '2px 7px',
                                            borderRadius: 6
                                        }}
                                    >
                                        {v.stock_code}
                                    </div>

                                    {/* Título sobre el gradiente */}
                                    <div style={{ position: 'absolute', bottom: 10, left: 14, right: 14 }}>
                                        <div style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2 }}>
                                            {v.brand} {v.model}
                                        </div>
                                        {v.version && (
                                            <div style={{ fontSize: 12.5, color: '#CBD5E1', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {v.version}
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* CUERPO DE LA TARJETA */}
                                <div style={{ padding: '12px 14px 14px 14px' }}>
                                    {/* Ficha técnica compacta */}
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr 1fr',
                                            gap: 8,
                                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: 10,
                                            padding: '8px 10px',
                                            marginBottom: 12,
                                            fontSize: 12,
                                            color: '#CBD5E1'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <Calendar size={13} style={{ color: '#94A3B8' }} />
                                            <span>{v.year}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <Gauge size={13} style={{ color: '#94A3B8' }} />
                                            <span>{v.mileage ? `${(v.mileage / 1000).toFixed(0)}k km` : '0 km'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <Cog size={13} style={{ color: '#94A3B8' }} />
                                            <span style={{ textTransform: 'capitalize' }}>{v.transmission?.toLowerCase() || 'Manual'}</span>
                                        </div>
                                    </div>

                                    {/* PRECIO AL PÚBLICO */}
                                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <span style={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                                            Precio Venta
                                        </span>
                                        <div style={{ fontSize: 20, fontWeight: 900, color: '#FB923C', fontFamily: 'var(--font-mono)' }}>
                                            {formatARS(v.sale_price)}
                                        </div>
                                    </div>

                                    {/* BOTONES DE ACCIÓN PARA EL VENDEDOR */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        {/* Botón WhatsApp */}
                                        <button
                                            onClick={(e) => handleShareWhatsApp(v, e)}
                                            style={{
                                                backgroundColor: '#25D366',
                                                color: '#FFFFFF',
                                                border: 'none',
                                                borderRadius: 10,
                                                padding: '9px 12px',
                                                fontSize: 12.5,
                                                fontWeight: 800,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 6,
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                                            }}
                                        >
                                            <WhatsAppIcon size={15} color="#FFFFFF" />
                                            <span>Compartir</span>
                                        </button>

                                        {/* Botón Señar o Ver */}
                                        {!isReserved ? (
                                            <button
                                                onClick={() => setReservingVehicle(v)}
                                                style={{
                                                    backgroundColor: 'rgba(234, 88, 12, 0.15)',
                                                    border: '1px solid #EA580C',
                                                    color: '#FB923C',
                                                    borderRadius: 10,
                                                    padding: '9px 12px',
                                                    fontSize: 12.5,
                                                    fontWeight: 800,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 6,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <BookmarkCheck size={15} />
                                                <span>Tomar Seña</span>
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/vendedor/vehiculos/${v.id}`}
                                                style={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                                    color: '#FFFFFF',
                                                    borderRadius: 10,
                                                    padding: '9px 12px',
                                                    fontSize: 12.5,
                                                    fontWeight: 700,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 6,
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                <span>Ver Ficha</span>
                                                <ChevronRight size={14} />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL DE SEÑA RÁPIDA */}
            <SellerQuickReservationModal
                isOpen={!!reservingVehicle}
                vehicle={reservingVehicle}
                onClose={() => setReservingVehicle(null)}
                onSuccess={() => {
                    // Actualizar estado local a RESERVED
                    if (reservingVehicle) {
                        setVehicles((prev) =>
                            prev.map((item) =>
                                item.id === reservingVehicle.id ? { ...item, status: 'RESERVED' } : item
                            )
                        );
                    }
                }}
            />
        </div>
    );
}
