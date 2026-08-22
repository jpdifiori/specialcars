import Link from 'next/link';
import { getPublicVehicles } from '@/lib/actions/vehicles';
import { getAgencySettings } from '@/lib/actions/settings';
import { VehicleCard } from '@/components/public/VehicleCard';
import { TestimonialsSection } from '@/components/public/TestimonialsSection';
import { 
    Car, 
    MessageCircle, 
    ArrowRight, 
    ShieldCheck, 
    Sparkles, 
    ArrowLeftRight, 
    Award
} from 'lucide-react';

export default async function PublicHomePage() {
    const [vehiclesRes, settings] = await Promise.all([
        getPublicVehicles({ limit: 12, sort_by: 'newest' }),
        getAgencySettings()
    ]);

    const vehicles = vehiclesRes.data;
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

                        <p className="hero-subtitle">
                            En <strong>{settings.name || 'Special Cars'}</strong> encontrá vehículos seleccionados y verificados. Elegí tu próximo auto y entregá el tuyo en parte de pago con una excelente tasación.
                        </p>

                        <div className="hero-actions">
                            <Link href="/vehiculos" className="btn-hero-primary">
                                <Car size={18} />
                                <span>Ver Todos los Vehículos</span>
                                <ArrowRight size={16} />
                            </Link>

                            <a
                                href={`https://wa.me/${wp}?text=${encodeURIComponent('Hola, me interesa conocer los autos disponibles en Special Cars.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-hero-whatsapp"
                            >
                                <MessageCircle size={18} />
                                <span>Consultar por WhatsApp</span>
                            </a>
                        </div>

                        {/* Mini Badges de Confianza */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, borderTop: '1px solid #E2E8F0', paddingTop: 22 }}>
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
                    </div>

                    {/* Columna Derecha: Franco con Llave en Mano y Badges Interactivos */}
                    <div className="hero-visual">
                        <div className="hero-visual-backdrop" />

                        {/* Badge Flotante Superior */}
                        <div className="hero-floating-tag-top">
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

            {/* BENEFICIOS / PROPUESTA DE VALOR */}
            <section style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', padding: '48px 24px' }}>
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

            {/* SECCIÓN VEHÍCULOS DESTACADOS */}
            {featuredVehicles.length > 0 && (
                <section className="public-section">
                    <div className="section-header">
                        <div>
                            <div className="section-subtitle">Selección Especial</div>
                            <h2 className="section-title">Vehículos Destacados</h2>
                        </div>
                        <Link href="/vehiculos" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#EA580C', fontWeight: 700, fontSize: 14 }}>
                            <span>Ver todo el catálogo</span>
                            <ArrowRight size={15} />
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
            <section className="public-section" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="section-header">
                    <div>
                        <div className="section-subtitle">Últimos Ingresos</div>
                        <h2 className="section-title">Novedades en Stock</h2>
                    </div>
                    <Link href="/vehiculos" className="section-link">
                        <span>Ver catálogo completo ({vehicles.length})</span>
                        <ArrowRight size={16} />
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

            {/* SECCIÓN: CARRUSEL DE 20 TESTIMONIOS */}
            <TestimonialsSection />

            {/* PRESENTACIÓN DE LA AGENCIA CON BANNER OFICIAL */}
            <section style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '80px 24px' }}>
                <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 48, alignItems: 'center' }}>
                    <div>
                        <div className="section-subtitle">Sobre Nosotros</div>
                        <h2 className="section-title" style={{ marginBottom: 20 }}>
                            {settings.name || 'Special Cars'}
                        </h2>
                        <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            {settings.description || 'Concesionaria líder en vehículos premium, usados y 0 KM. Más de 15 años brindando transparencia, calidad y confianza en cada operación.'}
                        </p>
                        <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, marginBottom: 24 }}>
                            Nuestro compromiso es la transparencia absoluta en cada operación: te mostramos el estado real del vehículo, verificamos la documentación legal y te brindamos asesoramiento personalizado.
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                            <a
                                href={`https://wa.me/${wp}?text=${encodeURIComponent('Hola, me gustaría recibir asesoramiento para comprar o vender un auto.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-hero-whatsapp"
                                style={{
                                    backgroundColor: '#25D366',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '14px 24px',
                                    borderRadius: 12,
                                    fontWeight: 700,
                                    fontSize: 15,
                                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                                    textDecoration: 'none',
                                    color: '#FFFFFF'
                                }}
                            >
                                <MessageCircle size={18} />
                                <span>Hablar con un Asesor</span>
                            </a>

                            {/* Hernán hablando por el móvil */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                padding: '6px 14px 6px 8px',
                                borderRadius: 40,
                                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)'
                            }}>
                                <div style={{
                                    width: 46,
                                    height: 46,
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '2px solid #EA580C',
                                    backgroundColor: '#0F172A',
                                    flexShrink: 0,
                                    position: 'relative'
                                }}>
                                    <img
                                        src="/images/hernan-phone-circle.png"
                                        alt="Hernán Asesor de Special Cars"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        bottom: 1,
                                        right: 1,
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        backgroundColor: '#22C55E',
                                        border: '1.5px solid #FFFFFF'
                                    }} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>Hernán</div>
                                    <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.2 }}>Atención directa</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
