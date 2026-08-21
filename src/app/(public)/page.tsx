import Link from 'next/link';
import { getPublicVehicles } from '@/lib/actions/vehicles';
import { getAgencySettings } from '@/lib/actions/settings';
import { VehicleCard } from '@/components/public/VehicleCard';
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

    const wp = settings.whatsapp || '5491140980758';

    return (
        <div>
            {/* HERO SECTION */}
            <section className="hero-section">
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

            {/* SECCIÓN ÚLTIMOS INGRESOS */}
            <section className="public-section" style={{ paddingTop: featuredVehicles.length > 0 ? 0 : 70 }}>
                <div className="section-header">
                    <div>
                        <div className="section-subtitle">Novedades en Stock</div>
                        <h2 className="section-title">Últimos Ingresos</h2>
                    </div>
                    <Link href="/vehiculos" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#EA580C', fontWeight: 700, fontSize: 14 }}>
                        <span>Ver catálogo completo ({vehicles.length} disponibles)</span>
                        <ArrowRight size={15} />
                    </Link>
                </div>

                {latestVehicles.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                        <Car size={44} style={{ color: '#94A3B8', margin: '0 auto 12px' }} />
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Próximamente nuevos ingresos</h3>
                        <p style={{ fontSize: 14, color: '#64748B', maxWidth: 460, margin: '0 auto 20px' }}>
                            Estamos preparando nuevas unidades seleccionadas. Contactanos por WhatsApp para consultar vehículos en ingreso.
                        </p>
                        <a
                            href={`https://wa.me/${wp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-hero-whatsapp"
                        >
                            <MessageCircle size={16} />
                            <span>Consultar por WhatsApp</span>
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

                        <div style={{ display: 'flex', gap: 14 }}>
                            <a
                                href={`https://wa.me/${wp}?text=${encodeURIComponent('Hola, me gustaría recibir asesoramiento para comprar o vender un auto.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-hero-whatsapp"
                            >
                                <MessageCircle size={16} />
                                <span>Hablar con un Asesor</span>
                            </a>
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
                                    <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{settings.address || 'Av. del Libertador 4500'}, {settings.city || 'Palermo'}, {settings.province || 'CABA'}</div>
                                </div>
                                <div>
                                    <span style={{ color: '#64748B', fontSize: 12, textTransform: 'uppercase', fontWeight: 700 }}>Horarios de Atención</span>
                                    <div style={{ color: '#334155', marginTop: 2 }}>{settings.business_hours || 'Lunes a Viernes de 9 a 19 hs. Sábados de 10 a 14 hs.'}</div>
                                </div>
                                <div>
                                    <span style={{ color: '#64748B', fontSize: 12, textTransform: 'uppercase', fontWeight: 700 }}>WhatsApp Directo</span>
                                    <div style={{ color: '#EA580C', fontWeight: 800, marginTop: 2 }}>+{settings.whatsapp || '5491140980758'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
