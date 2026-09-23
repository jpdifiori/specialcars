'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SellerVehicle } from '@/lib/actions/seller';
import { formatARS } from '@/lib/utils/currency';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { SellerQuickReservationModal } from '@/components/seller/SellerQuickReservationModal';
import { 
    ArrowLeft, 
    Car, 
    Calendar, 
    Gauge, 
    Fuel, 
    Cog, 
    BookmarkCheck, 
    Share2, 
    CheckCircle2, 
    ShieldCheck, 
    Palette, 
    ChevronLeft, 
    ChevronRight 
} from 'lucide-react';

export function SellerVehicleDetailClient({ initialVehicle }: { initialVehicle: SellerVehicle }) {
    const [vehicle, setVehicle] = useState<SellerVehicle>(initialVehicle);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isReserving, setIsReserving] = useState(false);

    const images = vehicle.images || [];
    const isReserved = vehicle.status === 'RESERVED';

    const handleShareWhatsApp = () => {
        const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://specialcars.com.ar';
        const publicUrl = `${siteUrl}/vehiculos/${vehicle.slug || vehicle.id}`;

        const lines = [
            `¡Hola! Te comparto la ficha detallada del auto que vimos en *Special Cars*:`,
            ``,
            `🚗 *${vehicle.brand} ${vehicle.model}* ${vehicle.version || ''} (${vehicle.year})`,
            `📍 *Kilometraje:* ${vehicle.mileage ? vehicle.mileage.toLocaleString('es-AR') + ' km' : '0 km'}`,
            `⚙️ *Transmisión:* ${vehicle.transmission || 'Manual'}`,
            `⛽ *Combustible:* ${vehicle.fuel_type || 'Nafta'}`,
            `🎨 *Color:* ${vehicle.exterior_color || 'No especificado'}`,
            `💰 *Precio contado:* ${formatARS(vehicle.sale_price)}`,
            ``,
            `📸 *Mirá todas las fotos acá:*`,
            publicUrl,
            ``,
            `Cualquier consulta avisame!`
        ];

        const text = encodeURIComponent(lines.join('\n'));
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <div>
            {/* BARRA SUPERIOR CON RETORNO */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <Link
                    href="/vendedor"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#94A3B8',
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: 700
                    }}
                >
                    <ArrowLeft size={16} />
                    <span>Volver al Stock</span>
                </Link>

                <div style={{ display: 'flex', gap: 6 }}>
                    {isReserved ? (
                        <span
                            style={{
                                backgroundColor: '#D97706',
                                color: '#FFFFFF',
                                fontSize: 11,
                                fontWeight: 800,
                                padding: '3px 9px',
                                borderRadius: 6
                            }}
                        >
                            RESERVADO
                        </span>
                    ) : (
                        <span
                            style={{
                                backgroundColor: '#16A34A',
                                color: '#FFFFFF',
                                fontSize: 11,
                                fontWeight: 800,
                                padding: '3px 9px',
                                borderRadius: 6
                            }}
                        >
                            DISPONIBLE
                        </span>
                    )}
                </div>
            </div>

            {/* VISOR PRINCIPAL DE FOTOS TÁCTIL */}
            <div
                style={{
                    backgroundColor: '#05070B',
                    borderRadius: 16,
                    overflow: 'hidden',
                    position: 'relative',
                    width: '100%',
                    height: 240,
                    marginBottom: 10,
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
            >
                {images.length > 0 ? (
                    <Image
                        src={images[selectedImageIndex]?.url || images[0].url}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 600px"
                        style={{ objectFit: 'contain' }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                        <Car size={48} style={{ opacity: 0.3 }} />
                    </div>
                )}

                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                            style={{
                                position: 'absolute',
                                left: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                border: 'none',
                                color: '#FFFFFF',
                                borderRadius: '50%',
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                            style={{
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                border: 'none',
                                color: '#FFFFFF',
                                borderRadius: '50%',
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <ChevronRight size={18} />
                        </button>

                        <div
                            style={{
                                position: 'absolute',
                                bottom: 8,
                                right: 10,
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                color: '#FFFFFF',
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 12
                            }}
                        >
                            {selectedImageIndex + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>

            {/* CARRUSEL DE MINIATURAS */}
            {images.length > 1 && (
                <div
                    style={{
                        display: 'flex',
                        gap: 8,
                        overflowX: 'auto',
                        paddingBottom: 10,
                        marginBottom: 16,
                        scrollbarWidth: 'none'
                    }}
                >
                    {images.map((img, idx) => (
                        <div
                            key={img.id || idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            style={{
                                position: 'relative',
                                width: 56,
                                height: 56,
                                flexShrink: 0,
                                borderRadius: 8,
                                overflow: 'hidden',
                                border: selectedImageIndex === idx ? '2px solid #EA580C' : '1px solid rgba(255, 255, 255, 0.15)',
                                cursor: 'pointer',
                                opacity: selectedImageIndex === idx ? 1 : 0.6
                            }}
                        >
                            <Image src={img.url} alt="Miniatura" fill sizes="56px" style={{ objectFit: 'cover' }} />
                        </div>
                    ))}
                </div>
            )}

            {/* TÍTULO Y PRECIO */}
            <div
                style={{
                    backgroundColor: '#111622',
                    borderRadius: 16,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: 16,
                    marginBottom: 14
                }}
            >
                <div style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2 }}>
                    {vehicle.brand} {vehicle.model}
                </div>
                {vehicle.version && (
                    <div style={{ fontSize: 14, color: '#CBD5E1', marginTop: 3 }}>
                        {vehicle.version}
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div>
                        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                            Precio de Venta
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#FB923C', fontFamily: 'var(--font-mono)' }}>
                            {formatARS(vehicle.sale_price)}
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                            Código Interno
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#E2E8F0', fontFamily: 'var(--font-mono)' }}>
                            {vehicle.stock_code}
                        </div>
                    </div>
                </div>

                {/* BOTONES DE ACCIÓN RÁPIDA */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                    <button
                        onClick={handleShareWhatsApp}
                        style={{
                            backgroundColor: '#25D366',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 10,
                            padding: '12px',
                            fontSize: 13,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            cursor: 'pointer',
                            boxShadow: '0 3px 10px rgba(37, 211, 102, 0.3)'
                        }}
                    >
                        <WhatsAppIcon size={16} color="#FFFFFF" />
                        <span>Compartir Ficha</span>
                    </button>

                    {!isReserved ? (
                        <button
                            onClick={() => setIsReserving(true)}
                            style={{
                                backgroundColor: '#EA580C',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: 10,
                                padding: '12px',
                                fontSize: 13,
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                cursor: 'pointer',
                                boxShadow: '0 3px 10px rgba(234, 88, 12, 0.35)'
                            }}
                        >
                            <BookmarkCheck size={16} />
                            <span>Tomar Seña</span>
                        </button>
                    ) : (
                        <div
                            style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                border: '1px solid rgba(245, 158, 11, 0.4)',
                                color: '#F59E0B',
                                borderRadius: 10,
                                padding: '12px',
                                fontSize: 12.5,
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6
                            }}
                        >
                            <BookmarkCheck size={15} />
                            <span>Ya Señado</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ESPECIFICACIONES TÉCNICAS */}
            <div
                style={{
                    backgroundColor: '#111622',
                    borderRadius: 16,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: 16,
                    marginBottom: 14
                }}
            >
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Especificaciones Comerciales
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                    <div>
                        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Año</div>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{vehicle.year}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Kilometraje</div>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{vehicle.mileage ? vehicle.mileage.toLocaleString('es-AR') + ' km' : '0 km'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Transmisión</div>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{vehicle.transmission || 'Manual'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Combustible</div>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{vehicle.fuel_type || 'Nafta'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Color Exterior</div>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{vehicle.exterior_color || '-'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Carrocería</div>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{vehicle.body_type || '-'}</div>
                    </div>
                    {vehicle.plate && (
                        <div>
                            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Patente / Dominio</div>
                            <div style={{ fontWeight: 700, color: '#CBD5E1', fontFamily: 'var(--font-mono)' }}>{vehicle.plate}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* EQUIPAMIENTO Y DESTACADOS */}
            {vehicle.equipment && (
                <div
                    style={{
                        backgroundColor: '#111622',
                        borderRadius: 16,
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: 16,
                        marginBottom: 14
                    }}
                >
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Equipamiento
                    </h3>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {vehicle.equipment.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).map((item, idx) => (
                            <span
                                key={idx}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#E2E8F0',
                                    fontSize: 12,
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5
                                }}
                            >
                                <CheckCircle2 size={12} style={{ color: '#10B981' }} />
                                <span>{item}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL DE SEÑA RÁPIDA */}
            <SellerQuickReservationModal
                isOpen={isReserving}
                vehicle={vehicle}
                onClose={() => setIsReserving(false)}
                onSuccess={() => {
                    setVehicle((prev) => ({ ...prev, status: 'RESERVED' }));
                }}
            />
        </div>
    );
}
