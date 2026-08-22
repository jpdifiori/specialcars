import Link from 'next/link';
import { PublicVehicleItem } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';
import { isOfferActive, calculateOfferSavings, getOfferBadgeLabel, getVehicleWhatsAppMessage } from '@/lib/utils/offer';
import { Gauge, Fuel, Cog, Calendar, ArrowRight, Image as ImageIcon, MessageCircle, Flame } from 'lucide-react';

export function VehicleCard({ 
    vehicle,
    isOfferSection = false 
}: { 
    vehicle: PublicVehicleItem;
    isOfferSection?: boolean;
}) {
    const slugUrl = `/vehiculos/${vehicle.slug || vehicle.id}`;
    const wpNumber = '5492262574254';
    const hasActiveOffer = isOfferActive(vehicle);
    const offerSavings = hasActiveOffer && vehicle.offer_price 
        ? calculateOfferSavings(vehicle.price, vehicle.offer_price) 
        : null;

    const wpMsg = getVehicleWhatsAppMessage({
        brand: vehicle.brand,
        model: vehicle.model,
        version: vehicle.version,
        year: vehicle.year,
        is_offer: vehicle.is_offer,
        offer_price: vehicle.offer_price,
        price: vehicle.price,
        offer_start_date: vehicle.offer_start_date,
        offer_end_date: vehicle.offer_end_date
    });
    const wpUrl = `https://wa.me/${wpNumber}?text=${encodeURIComponent(wpMsg)}`;

    return (
        <div className={`vehicle-card ${hasActiveOffer ? 'vehicle-card-offer' : ''}`} style={hasActiveOffer ? { borderColor: '#FDBA74' } : undefined}>
            {/* Foto de Portada */}
            <Link href={slugUrl} className="vehicle-card-image-wrap" style={{ aspectRatio: '16/9.5' }}>
                {vehicle.primary_image_url ? (
                    <img 
                        src={vehicle.primary_image_url} 
                        alt={`${vehicle.brand} ${vehicle.model}`} 
                        className="vehicle-card-img"
                        loading="lazy"
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <ImageIcon size={28} />
                    </div>
                )}

                {/* Badge de Oferta Activa */}
                {hasActiveOffer && (
                    <div style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        backgroundColor: '#EA580C',
                        color: '#FFFFFF',
                        padding: '3px 9px',
                        borderRadius: 14,
                        fontSize: 11,
                        fontWeight: 900,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        boxShadow: '0 2px 8px rgba(234, 88, 12, 0.45)',
                        zIndex: 2,
                        letterSpacing: 0.2
                    }}>
                        <Flame size={12} />
                        <span>{getOfferBadgeLabel(vehicle.offer_label)} {offerSavings ? `· ${offerSavings.discountPercentage}% OFF` : ''}</span>
                    </div>
                )}

                {vehicle.featured && !hasActiveOffer && (
                    <div className="vehicle-card-badge-featured" style={{ top: 10, left: 10, padding: '3px 8px', fontSize: 10.5 }}>
                        Destacado
                    </div>
                )}

                {vehicle.status === 'RESERVED' && (
                    <div className="vehicle-card-badge-reserved" style={{ top: 10, right: 10, padding: '3px 8px', fontSize: 10.5 }}>
                        Reservado
                    </div>
                )}
            </Link>

            {/* Cuerpo de la Card (Minimalista & Compacto) */}
            <div className="vehicle-card-body" style={{ padding: '14px 16px' }}>
                {/* Título y Versión */}
                <div style={{ marginBottom: 8 }}>
                    <Link href={slugUrl} style={{ textDecoration: 'none' }}>
                        <h3 className="vehicle-card-title" style={{ fontSize: 16.5, fontWeight: 900, marginBottom: 2, lineHeight: 1.2 }}>
                            {vehicle.brand} {vehicle.model}
                        </h3>
                    </Link>
                    <div className="vehicle-card-version" style={{ fontSize: 12.5, color: '#64748B', marginBottom: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {vehicle.version || vehicle.commercial_title || `${vehicle.year}`}
                    </div>
                </div>

                {/* Especificaciones Clave (Compactas) */}
                <div className="vehicle-card-specs" style={{ padding: '8px 0', marginBottom: 10, gap: '6px 12px' }}>
                    <div className="spec-item" style={{ fontSize: 12 }}>
                        <Calendar size={12} className="spec-icon" />
                        <span>{vehicle.year}</span>
                    </div>
                    <div className="spec-item" style={{ fontSize: 12 }}>
                        <Gauge size={12} className="spec-icon" />
                        <span>{vehicle.mileage?.toLocaleString('es-AR')} km</span>
                    </div>
                    <div className="spec-item" style={{ fontSize: 12 }}>
                        <Fuel size={12} className="spec-icon" />
                        <span style={{ textTransform: 'capitalize' }}>{vehicle.fuel_type?.toLowerCase()}</span>
                    </div>
                    <div className="spec-item" style={{ fontSize: 12 }}>
                        <Cog size={12} className="spec-icon" />
                        <span style={{ textTransform: 'capitalize' }}>{vehicle.transmission?.toLowerCase()}</span>
                    </div>
                </div>

                {/* Footer: Precios y CTA */}
                <div className="vehicle-card-footer" style={{ marginTop: 'auto', paddingTop: 4 }}>
                    {hasActiveOffer ? (
                        <div style={{ width: '100%' }}>
                            {/* Fila superior: Precio anterior tachado + Ahorro */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                                <span style={{ fontSize: 11.5, color: '#94A3B8', textDecoration: 'line-through', fontWeight: 600 }}>
                                    {formatARS(vehicle.price)}
                                </span>
                                {offerSavings && (
                                    <span style={{
                                        fontSize: 10.5,
                                        fontWeight: 800,
                                        color: '#059669',
                                        backgroundColor: '#ECFDF5',
                                        border: '1px solid #A7F3D0',
                                        padding: '1px 6px',
                                        borderRadius: 4
                                    }}>
                                        Ahorrás {offerSavings.formattedSavings}
                                    </span>
                                )}
                            </div>

                            {/* Fila inferior: Precio Oferta + Enlace */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ color: '#EA580C', fontSize: 19, fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                                    {formatARS(vehicle.offer_price)}
                                </span>
                                <Link 
                                    href={slugUrl}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        fontSize: 12.5,
                                        fontWeight: 800,
                                        color: '#0F172A',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <span>Ver auto</span>
                                    <ArrowRight size={13} style={{ color: '#EA580C' }} />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                {vehicle.hide_price ? (
                                    <a
                                        href={wpUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            color: '#EA580C',
                                            fontSize: 13.5,
                                            fontWeight: 800,
                                            textDecoration: 'none'
                                        }}
                                        title="Consultar precio por WhatsApp"
                                    >
                                        <span>Consultar precio</span>
                                        <MessageCircle size={14} style={{ color: '#22C55E' }} />
                                    </a>
                                ) : (
                                    <div>
                                        <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                                            Precio final
                                        </div>
                                        <div className="vehicle-card-price" style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
                                            {formatARS(vehicle.price)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link 
                                href={slugUrl}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontSize: 12.5,
                                    fontWeight: 800,
                                    color: '#0F172A',
                                    textDecoration: 'none'
                                }}
                            >
                                <span>Ver auto</span>
                                <ArrowRight size={13} style={{ color: '#EA580C' }} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
