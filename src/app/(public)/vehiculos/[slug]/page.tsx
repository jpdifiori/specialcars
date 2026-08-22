import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublicVehicleBySlug, getPublicVehicles } from '@/lib/actions/vehicles';
import { getAgencySettings } from '@/lib/actions/settings';
import { formatARS } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { isOfferActive, calculateOfferSavings, getOfferBadgeLabel, getVehicleWhatsAppMessage } from '@/lib/utils/offer';
import { VehicleDetailGallery } from './VehicleDetailGallery';
import { VehicleCard } from '@/components/public/VehicleCard';
import { 
    Car, 
    MessageCircle, 
    ArrowLeft, 
    Check, 
    ShieldCheck, 
    Calendar, 
    Gauge, 
    Fuel, 
    Cog, 
    Palette, 
    Tag,
    Share2,
    Flame
} from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const vehicle = await getPublicVehicleBySlug(slug);

    if (!vehicle) {
        return { title: 'Vehículo no encontrado | Special Cars' };
    }

    const isOffer = isOfferActive(vehicle);
    const offerPriceStr = isOffer && vehicle.offer_price ? formatARS(vehicle.offer_price) : formatARS(vehicle.price);
    const title = vehicle.meta_title || `${isOffer ? '🔥 OFERTA: ' : ''}${vehicle.brand} ${vehicle.model} ${vehicle.version || ''} (${vehicle.year}) | Special Cars`;
    const description = vehicle.meta_description || `Comprá tu ${vehicle.brand} ${vehicle.model} ${vehicle.year} por ${offerPriceStr} en Special Cars.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: vehicle.primary_image_url ? [vehicle.primary_image_url] : []
        }
    };
}

export default async function PublicVehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [vehicle, settings, relatedRes] = await Promise.all([
        getPublicVehicleBySlug(slug),
        getAgencySettings(),
        getPublicVehicles({ limit: 3 })
    ]);

    if (!vehicle) {
        notFound();
    }

    const relatedVehicles = relatedRes.data.filter(v => v.id !== vehicle.id).slice(0, 3);
    const wp = settings.whatsapp || '5492262574254';

    const hasOffer = isOfferActive(vehicle);
    const savings = hasOffer && vehicle.offer_price ? calculateOfferSavings(vehicle.price, vehicle.offer_price) : null;
    const autoWpMessage = getVehicleWhatsAppMessage(vehicle);
    const wpLink = `https://wa.me/${wp}?text=${encodeURIComponent(autoWpMessage)}`;

    return (
        <div className="public-section" style={{ paddingTop: 30 }}>
            {/* Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                <Link href="/" style={{ color: '#EA580C', fontWeight: 600 }}>Inicio</Link>
                <span>/</span>
                <Link href="/vehiculos" style={{ color: '#EA580C', fontWeight: 600 }}>Catálogo</Link>
                <span>/</span>
                <span style={{ color: '#000000', fontWeight: 700 }}>{vehicle.brand} {vehicle.model}</span>
            </div>

            {/* Grid Principal: Galería + Ficha Comercial */}
            <div className="detail-grid">
                {/* Galería de Fotos */}
                <div>
                    <VehicleDetailGallery 
                        images={vehicle.images || []} 
                        brand={vehicle.brand} 
                        model={vehicle.model} 
                    />

                    {/* Descripción y Equipamiento */}
                    <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {vehicle.description && (
                            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#000000', marginBottom: 12 }}>
                                    Descripción del Vehículo
                                </h3>
                                <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                                    {vehicle.description}
                                </p>
                            </div>
                        )}

                        {vehicle.equipment && (
                            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#000000', marginBottom: 12 }}>
                                    Equipamiento & Confort
                                </h3>
                                <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                                    {vehicle.equipment}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Tarjeta de Compra y Especificaciones */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="detail-info-card">
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                                    {vehicle.body_type}
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#64748b' }}>
                                    Código: {vehicle.stock_code}
                                </span>
                            </div>

                            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, color: '#000000', lineHeight: 1.2 }}>
                                {vehicle.commercial_title || `${vehicle.brand} ${vehicle.model} ${vehicle.version || ''}`}
                            </h1>
                            <div style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>
                                Año {vehicle.year} • {vehicle.mileage?.toLocaleString('es-AR')} km
                            </div>
                        </div>

                        {/* Caja de Precio */}
                        <div className="detail-price-box" style={hasOffer ? { borderColor: '#FDBA74', backgroundColor: '#FFF7ED' } : undefined}>
                            {hasOffer && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#EA580C', color: '#FFFFFF', padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 900, marginBottom: 8, letterSpacing: 0.3 }}>
                                    <Flame size={13} />
                                    <span>{getOfferBadgeLabel(vehicle.offer_label)} {savings ? `· ${savings.formattedDiscount}` : ''}</span>
                                </div>
                            )}

                            <div style={{ fontSize: 12, color: hasOffer ? '#9A3412' : '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>
                                {vehicle.hide_price ? 'Condición Comercial' : (hasOffer ? 'Precio Especial de Oferta' : 'Precio Final al Contado / Permuta')}
                            </div>
                            {vehicle.hide_price ? (
                                <a
                                    href={wpLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        color: '#EA580C',
                                        fontSize: 26,
                                        fontWeight: 900,
                                        textDecoration: 'none'
                                    }}
                                >
                                    <span>Consultar precio!</span>
                                    <span style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        backgroundColor: '#25D366',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#FFFFFF',
                                        flexShrink: 0,
                                        boxShadow: '0 2px 6px rgba(37, 211, 102, 0.4)'
                                    }}>
                                        <MessageCircle size={16} />
                                    </span>
                                </a>
                            ) : hasOffer ? (
                                <div>
                                    <div style={{ fontSize: 14, color: '#94A3B8', textDecoration: 'line-through', fontWeight: 600 }}>
                                        Antes: {formatARS(vehicle.price)}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
                                        <span style={{ fontSize: 14, color: '#EA580C', fontWeight: 900, textTransform: 'uppercase' }}>Ahora:</span>
                                        <div className="detail-price" style={{ color: '#EA580C', fontSize: 34, fontWeight: 900 }}>
                                            {formatARS(vehicle.offer_price)}
                                        </div>
                                    </div>
                                    {savings && (
                                        <div style={{ display: 'inline-block', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 800, marginTop: 8 }}>
                                            🎉 ¡Ahorrás {savings.formattedSavings}! ({savings.formattedDiscount})
                                        </div>
                                    )}
                                    {vehicle.offer_end_date && (
                                        <div style={{ fontSize: 12, color: '#9A3412', fontWeight: 600, marginTop: 6 }}>
                                            ⏰ Oferta por tiempo limitado válida hasta el {formatDate(vehicle.offer_end_date)}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="detail-price" style={{ color: '#EA580C', fontSize: 32, fontWeight: 900 }}>
                                    {formatARS(vehicle.price)}
                                </div>
                            )}
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                                Aceptamos permutas al mejor valor del mercado y financiación a medida.
                            </div>
                        </div>

                        {/* CTA PRINCIPAL WHATSAPP */}
                        <a
                            href={wpLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-whatsapp-detail"
                        >
                            <MessageCircle size={22} />
                            <span>CONSULTAR POR ESTE VEHÍCULO</span>
                        </a>

                        {/* Especificaciones Técnicas */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#94a3b8', marginBottom: 14 }}>
                                Ficha Técnica
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13.5 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1' }}>
                                    <Calendar size={15} style={{ color: '#3b82f6' }} />
                                    <span>Año: <strong>{vehicle.year}</strong></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1' }}>
                                    <Gauge size={15} style={{ color: '#3b82f6' }} />
                                    <span>Km: <strong>{vehicle.mileage?.toLocaleString('es-AR')}</strong></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1' }}>
                                    <Fuel size={15} style={{ color: '#3b82f6' }} />
                                    <span>Combustible: <strong>{vehicle.fuel_type}</strong></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1' }}>
                                    <Cog size={15} style={{ color: '#3b82f6' }} />
                                    <span>Caja: <strong>{vehicle.transmission}</strong></span>
                                </div>
                                {vehicle.exterior_color && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1', gridColumn: 'span 2' }}>
                                        <Palette size={15} style={{ color: '#3b82f6' }} />
                                        <span>Color: <strong>{vehicle.exterior_color}</strong></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Garantías Special Cars */}
                        <div style={{ backgroundColor: '#131926', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#94a3b8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 600 }}>
                                <Check size={14} />
                                <span>Documentación lista para transferir</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 600 }}>
                                <Check size={14} />
                                <span>Verificación policial e informe de dominio al día</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 600 }}>
                                <Check size={14} />
                                <span>Tomamos tu vehículo en permuta</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* VEHÍCULOS RELACIONADOS */}
            {relatedVehicles.length > 0 && (
                <section style={{ marginTop: 40, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="section-header">
                        <div>
                            <div className="section-subtitle">Otras Opciones</div>
                            <h2 className="section-title">Vehículos Similares en Stock</h2>
                        </div>
                        <Link href="/vehiculos" style={{ color: '#3b82f6', fontSize: 14, fontWeight: 600 }}>
                            Ver todos →
                        </Link>
                    </div>

                    <div className="vehicles-grid">
                        {relatedVehicles.map((v) => (
                            <VehicleCard key={v.id} vehicle={v} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
