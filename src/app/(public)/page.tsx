import Link from 'next/link';
import { getPublicVehicles } from '@/lib/actions/vehicles';
import { getAgencySettings } from '@/lib/actions/settings';
import { getActiveGiveaway } from '@/lib/actions/giveaways';
import { VehicleCard } from '@/components/public/VehicleCard';
import { TestimonialsSection } from '@/components/public/TestimonialsSection';
import { VehicleFinderSection } from '@/components/public/VehicleFinderSection';
import { HeroFilterBar } from '@/components/public/HeroFilterBar';
import { GiveawaySection } from '@/components/public/GiveawaySection';
import { 
    Car, 
    MessageCircle, 
    ArrowRight, 
    ShieldCheck, 
    Sparkles, 
    ArrowLeftRight, 
    Award, 
    Flame
} from 'lucide-react';

export default async function PublicHomePage() {
    const [vehiclesRes, settings, giveawayRes] = await Promise.all([
        getPublicVehicles({ limit: 12, sort_by: 'newest' }),
        getAgencySettings(),
        getActiveGiveaway()
    ]);

    const vehicles = vehiclesRes.data;
    const offerVehicles = vehicles.filter(v => v.is_offer_active);
    const featuredVehicles = vehicles.filter(v => v.featured);
    const latestVehicles = vehicles.slice(0, 6);

    const wp = settings.whatsapp || '5492262574254';

    return (
        <div>
            {/* HERO SECTION */}
            <section className="hero-section">
                <div className="hero-grid-container">
                    {/* Columna Izquierda: Mensaje Comercial y CTAs */}
                    <div className="hero-content">
                        <div className="hero-badge">
                            <Sparkles size={14} style={{ color: '#EA580C' }} />
                            <span>Vehículos Seleccionados • Usados • 0 KM</span>
                        </div>

                        <h1 className="hero-title">
                            Encontrá tu próximo auto con <span>total confianza</span> y transparencia.
                        </h1>

                        <p className="hero-subtitle desktop-only-block">
                            En <strong>{settings.name || 'Special Cars'}</strong> encontrá vehículos seleccionados y verificados. Elegí tu próximo auto y entregá el tuyo en parte de pago con una excelente tasación.
                        </p>

                        <div className="hero-actions">
                            <Link href="/vehiculos" className="btn-hero-primary">
                                <Car size={17} />
                                <span className="desktop-only-inline">Ver Todos los Vehículos</span>
                                <span className="mobile-only-inline">Ver Todos</span>
                                <ArrowRight size={15} />
                            </Link>

                            <a
                                href={`https://wa.me/${wp}?text=${encodeURIComponent('Hola, me interesa conocer los autos disponibles en Special Cars.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-hero-whatsapp"
                            >
                                <MessageCircle size={17} />
                                <span className="desktop-only-inline">Consultar por WhatsApp</span>
                                <span className="mobile-only-inline">Consultar</span>
                            </a>
                        </div>

                        {/* Mini Badges de Confianza (Solo Desktop) */}
                        <div className="desktop-only" style={{ display: 'flex', flexWrap: 'wrap', gap: 18, borderTop: '1px solid #E2E8F0', paddingTop: 22 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#334155', fontWeight: 700 }}>
                                <ShieldCheck size={18} style={{ color: '#EA580C' }} />
                                <span>Unidades Verificadas</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#334155', fontWeight: 700 }}>
                                <ArrowLeftRight size={18} style={{ color: '#EA580C' }} />
                                <span>Tomamos tu Usado</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#334155', fontWeight: 700 }}>
                                <Award size={18} style={{ color: '#EA580C' }} />
                                <span>Gestoría Integral</span>
                            </div>
                        </div>

                        {/* COMBO MOBILE: Textos de Confianza + Hernán (+10% más grande) */}
                        <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 8, borderTop: '1px solid #E2E8F0', paddingTop: 6, paddingBottom: 0 }}>
                            {/* Columna Izquierda: 3 Textos de Confianza */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 50%', minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 9, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <ShieldCheck size={15} style={{ color: '#EA580C', flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>Unidades Verificadas</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 9, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <ArrowLeftRight size={15} style={{ color: '#EA580C', flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>Tomamos tu Usado</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 9, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <Award size={15} style={{ color: '#EA580C', flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>Gestoría Integral</span>
                                </div>
                            </div>

                            {/* Columna Derecha: Hernán +10% más grande */}
                            <div style={{ flex: '0 0 50%', maxWidth: 200, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', position: 'relative' }}>
                                <img
                                    src="/images/franco-hero.png"
                                    alt="Hernán Asesor de Special Cars"
                                    style={{ width: '100%', maxHeight: 250, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 10px 22px rgba(0,0,0,0.22))' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha Desktop: Hernán de cuerpo entero */}
                    <div className="hero-visual desktop-only-block">
                        <div className="hero-visual-backdrop" />

                        {/* Badge Flotante Superior (Solo Desktop) */}
                        <div className="hero-floating-tag-top desktop-only">
                            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>Hernán</div>
                                <div style={{ fontSize: 10.5, color: '#64748B', lineHeight: 1.1 }}>Asesor Comercial</div>
                            </div>
                        </div>

                        {/* Imagen Oficial de Hernán de cuerpo entero */}
                        <img
                            src="/images/franco-hero.png"
                            alt="Hernán Asesor de Special Cars"
                            className="hero-franco-img"
                        />
                    </div>
                </div>
            </section>

            {/* BUSCADOR RÁPIDO DE VEHÍCULOS (MOBILE & DESKTOP) */}
            <HeroFilterBar />

            {/* BENEFICIOS / PROPUESTA DE VALOR (SOLO DESKTOP) */}
            <section className="desktop-only-block" style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', padding: '48px 24px' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C', flexShrink: 0 }}>
                            <ShieldCheck size={22} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Unidades Seleccionadas</h3>
                            <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5 }}>Revisamos cada vehículo y su documentación antes de ponerlo a la venta.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', flexShrink: 0 }}>
                            <ArrowLeftRight size={22} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Tomamos tu Usado en Permuta</h3>
                            <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5 }}>Cotización justa e inmediata de tu vehículo como parte de pago.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C', flexShrink: 0 }}>
                            <Award size={22} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Gestoría Integral</h3>
                            <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5 }}>Nos encargamos de toda la transferencia y trámites registrales.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN DE OFERTAS DESTACADAS */}
            {offerVehicles.length > 0 && (
                <section className="public-section" style={{ backgroundColor: '#FFF7ED', borderTop: '1px solid #FFEDD5', borderBottom: '1px solid #FFEDD5', padding: '40px 20px' }}>
                    <div className="section-header" style={{ marginBottom: 20 }}>
                        <div>
                            <div className="section-subtitle" style={{ color: '#EA580C', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 800, fontSize: 11.5, marginBottom: 2 }}>
                                <Flame size={14} />
                                <span>Oportunidades Imperdibles</span>
                            </div>
                            <h2 className="section-title" style={{ color: '#0F172A', fontSize: 'clamp(20px, 3.5vw, 28px)', margin: 0 }}>
                                Ofertas de la Semana
                            </h2>
                        </div>
                        <Link 
                            href="/ofertas" 
                            style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: 6, 
                                backgroundColor: '#EA580C', 
                                color: '#FFFFFF', 
                                fontWeight: 800, 
                                fontSize: 12.5,
                                padding: '8px 14px',
                                borderRadius: 8,
                                textDecoration: 'none',
                                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)'
                            }}
                        >
                            <span>Ver todas ({offerVehicles.length})</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="vehicles-grid">
                        {offerVehicles.map(v => (
                            <VehicleCard key={v.id} vehicle={v} isOfferSection={true} />
                        ))}
                    </div>
                </section>
            )}

            {/* SECCIÓN VEHÍCULOS DESTACADOS */}
            {featuredVehicles.length > 0 && (
                <section className="public-section" style={{ padding: '40px 20px' }}>
                    <div className="section-header" style={{ marginBottom: 20 }}>
                        <div>
                            <div className="section-subtitle" style={{ fontSize: 11.5, marginBottom: 2 }}>Selección Especial</div>
                            <h2 className="section-title" style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', margin: 0 }}>Vehículos Destacados</h2>
                        </div>
                        <Link href="/vehiculos" style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#EA580C', fontWeight: 700, fontSize: 13 }}>
                            <span>Ver catálogo</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="vehicles-grid">
                        {featuredVehicles.map(v => (
                            <VehicleCard key={v.id} vehicle={v} />
                        ))}
                    </div>
                </section>
            )}

            {/* SECCIÓN: CATÁLOGO DE INGRESOS */}
            <section className="public-section" style={{ backgroundColor: '#FFFFFF', padding: '40px 20px' }}>
                <div className="section-header" style={{ marginBottom: 20 }}>
                    <div>
                        <div className="section-subtitle" style={{ fontSize: 11.5, marginBottom: 2 }}>Últimos Ingresos</div>
                        <h2 className="section-title" style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', margin: 0 }}>Novedades en Stock</h2>
                    </div>
                    <Link href="/vehiculos" className="section-link" style={{ fontSize: 13, fontWeight: 700 }}>
                        <span>Ver catálogo completo ({vehicles.length})</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>

                {latestVehicles.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#F8FAFC', borderRadius: 16, border: '1px dashed #CBD5E1' }}>
                        <Car size={48} style={{ color: '#94A3B8', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>
                            No hay vehículos disponibles en este momento
                        </h3>
                        <p style={{ fontSize: 14, color: '#64748B', maxWidth: 460, margin: '0 auto 20px' }}>
                            Estamos renovando nuestro inventario. Escribinos para avisarte en cuanto ingresen nuevas unidades.
                        </p>
                        <a
                            href={`https://wa.me/${wp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary"
                            style={{ display: 'inline-flex', padding: '10px 20px', fontSize: 14 }}
                        >
                            <MessageCircle size={16} />
                            <span>Consultar Próximos Ingresos</span>
                        </a>
                    </div>
                ) : (
                    <div className="vehicles-grid">
                        {latestVehicles.map(v => (
                            <VehicleCard key={v.id} vehicle={v} />
                        ))}
                    </div>
                )}
            </section>

            {/* SECCIÓN: SORTEOS ESPECIALES */}
            <GiveawaySection 
                activeGiveaway={giveawayRes.active} 
                latestClosedGiveaway={giveawayRes.latestClosed} 
                whatsappNumber={wp} 
            />

            {/* SECCIÓN: BUSCAMOS TU AUTO POR VOS (FORMULARIO INTERACTIVO) */}
            <VehicleFinderSection whatsappNumber={wp} />

            {/* SECCIÓN: CARRUSEL DE 20 TESTIMONIOS */}
            <TestimonialsSection />

            {/* PRESENTACIÓN DE LA AGENCIA CON BANNER OFICIAL */}
            <section className="about-section" style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '48px 20px' }}>
                <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'center' }}>
                    <div>
                        <div className="section-subtitle" style={{ fontSize: 11.5, marginBottom: 2 }}>Sobre Nosotros</div>
                        <h2 className="section-title" style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', marginBottom: 14 }}>
                            {settings.name || 'Special Cars'}
                        </h2>
                        <p style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.6, marginBottom: 12 }}>
                            {settings.description || 'Concesionaria líder en vehículos premium, usados y 0 KM. Más de 15 años brindando transparencia, calidad y confianza en cada operación.'}
                        </p>
                        <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.55, marginBottom: 18 }}>
                            Nuestro compromiso es la transparencia absoluta en cada operación: te mostramos el estado real del vehículo, verificamos la documentación legal y te brindamos asesoramiento personalizado.
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'nowrap', marginTop: 4 }}>
                            <a
                                href={`https://wa.me/${wp}?text=${encodeURIComponent('Hola, me gustaría recibir asesoramiento para comprar o vender un auto.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    backgroundColor: '#25D366',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    padding: '11px 16px',
                                    borderRadius: 12,
                                    fontWeight: 800,
                                    fontSize: 13.5,
                                    boxShadow: '0 3px 10px rgba(37, 211, 102, 0.35)',
                                    textDecoration: 'none',
                                    color: '#FFFFFF',
                                    flex: '1',
                                    maxWidth: 220
                                }}
                            >
                                <MessageCircle size={16} />
                                <span>Hablar con un Asesor</span>
                            </a>

                            {/* Hernán al lado en la misma línea */}
                            <a
                                href={`https://wa.me/${wp}?text=${encodeURIComponent('Hola Hernán, me gustaría recibir asesoramiento para comprar o vender un auto.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Contactar a Hernán por WhatsApp"
                                style={{
                                    width: 54,
                                    height: 54,
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '2px solid #EA580C',
                                    backgroundColor: '#FFFFFF',
                                    flexShrink: 0,
                                    position: 'relative',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25), 0 2px 6px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}
                            >
                                <img
                                    src="/images/hernan-phone-circle.png"
                                    alt="Hernán Asesor Comercial Special Cars"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                            </a>
                        </div>
                    </div>

                    {/* Columna Derecha: Banner Carbono y Card de Información (Solo Desktop) */}
                    <div className="desktop-only-block" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Banner Oficial de Fibra de Carbono */}
                        <div style={{
                            borderRadius: 16,
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                            border: '1px solid #1E293B',
                            backgroundColor: '#0F172A'
                        }}>
                            <img
                                src="/images/specialcars-banner-carbon.png"
                                alt="Special Cars Official Banner"
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>

                        {/* Tarjeta de Contacto */}
                        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 28, boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)' }}>
                            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
                                Información de la Concesionaria
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14 }}>
                                <div>
                                    <span style={{ color: '#64748B', fontSize: 12, textTransform: 'uppercase', fontWeight: 700 }}>Dirección</span>
                                    <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                                        {[settings.address || 'Calle 48 2350', settings.city, settings.province].filter(Boolean).join(', ')}
                                    </div>
                                </div>
                                <div>
                                    <span style={{ color: '#64748B', fontSize: 12, textTransform: 'uppercase', fontWeight: 700 }}>Horarios de Atención</span>
                                    <div style={{ color: '#334155', marginTop: 2 }}>{settings.business_hours || 'Lunes a Viernes de 8:00 a 17:00 hs. Sábados de 08:00 a 12:30 hs.'}</div>
                                </div>
                                <div>
                                    <span style={{ color: '#64748B', fontSize: 12, textTransform: 'uppercase', fontWeight: 700 }}>WhatsApp Directo</span>
                                    <div style={{ marginTop: 4 }}>
                                        <a 
                                            href={`https://wa.me/${wp}?text=${encodeURIComponent('Hola! Me comunico desde la página web de Special Cars para hacer una consulta.')}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            style={{ 
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                color: '#EA580C', 
                                                fontWeight: 800,
                                                fontSize: 15,
                                                textDecoration: 'none'
                                            }}
                                            title="Abrir WhatsApp"
                                        >
                                            <span>+54 9 2262 57-4254</span>
                                            <span style={{
                                                width: 26,
                                                height: 26,
                                                borderRadius: '50%',
                                                backgroundColor: '#25D366',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#FFFFFF',
                                                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.35)',
                                                flexShrink: 0
                                            }}>
                                                <MessageCircle size={15} />
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
