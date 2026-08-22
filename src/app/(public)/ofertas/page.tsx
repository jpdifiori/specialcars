import Link from 'next/link';
import { getPublicVehicles } from '@/lib/actions/vehicles';
import { getAgencySettings } from '@/lib/actions/settings';
import { VehicleCard } from '@/components/public/VehicleCard';
import { 
    Flame, 
    MessageCircle, 
    Car, 
    ArrowRight, 
    ShieldCheck, 
    ArrowLeftRight, 
    Sparkles, 
    Award,
    Tag,
    Share2
} from 'lucide-react';

export const metadata = {
    title: 'Ofertas Especiales y Oportunidades Únicas | Special Cars',
    description: 'Aprovechá descuentos exclusivos en vehículos seleccionados en Special Cars. Precios promocionales en Pesos Argentinos ($ ARS) por tiempo limitado.',
    openGraph: {
        title: '🔥 Ofertas Especiales de Vehículos | Special Cars',
        description: 'Vehículos seleccionados con precio de oferta especial y ahorro garantizado. Tomamos tu usado y financiamos.',
        type: 'website'
    }
};

export default async function PublicOffersPage() {
    const [offersRes, settings] = await Promise.all([
        getPublicVehicles({ only_offers: true, limit: 50, sort_by: 'newest' }),
        getAgencySettings()
    ]);

    const offers = offersRes.data;
    const wp = settings.whatsapp || '5492262574254';

    return (
        <div className="public-section" style={{ paddingTop: 36, paddingBottom: 80 }}>
            {/* Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748B', marginBottom: 20 }}>
                <Link href="/" style={{ color: '#EA580C', fontWeight: 600 }}>Inicio</Link>
                <span>/</span>
                <span style={{ color: '#0F172A', fontWeight: 700 }}>Ofertas Especiales</span>
            </div>

            {/* HERO / HEADER DE OFERTAS */}
            <div style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                borderRadius: 20,
                padding: '44px 36px',
                color: '#FFFFFF',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 12px 36px rgba(15, 23, 42, 0.15)',
                marginBottom: 40,
                border: '1px solid #334155'
            }}>
                {/* Glow decorativo de fondo */}
                <div style={{
                    position: 'absolute',
                    top: '-40%',
                    right: '-10%',
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(234, 88, 12, 0.28) 0%, rgba(234, 88, 12, 0) 70%)',
                    pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: '#EA580C',
                        color: '#FFFFFF',
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 12.5,
                        fontWeight: 900,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                        marginBottom: 16,
                        boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)'
                    }}>
                        <Flame size={15} />
                        <span>Oportunidades por Tiempo Limitado</span>
                    </div>

                    <h1 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'clamp(26px, 4vw, 38px)',
                        fontWeight: 900,
                        lineHeight: 1.15,
                        color: '#FFFFFF',
                        marginBottom: 12
                    }}>
                        Vehículos en Oferta Especial
                    </h1>

                    <p style={{
                        fontSize: 15,
                        color: '#CBD5E1',
                        lineHeight: 1.6,
                        marginBottom: 24,
                        maxWidth: 620
                    }}>
                        Aprovechá unidades seleccionadas con <strong>precios promocionales exclusivos</strong> y ahorro comprobable. Todas las unidades cuentan con documentación al día y garantía de transferibilidad.
                    </p>

                    {/* Badges de Garantía */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#E2E8F0', fontWeight: 600 }}>
                            <ShieldCheck size={16} style={{ color: '#EA580C' }} />
                            <span>100% Verificados</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#E2E8F0', fontWeight: 600 }}>
                            <ArrowLeftRight size={16} style={{ color: '#EA580C' }} />
                            <span>Aceptamos Permutas</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#E2E8F0', fontWeight: 600 }}>
                            <Award size={16} style={{ color: '#EA580C' }} />
                            <span>Precios Finales en ARS</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* LISTADO DE OFERTAS */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                            Ofertas Vigentes
                        </h2>
                        <p style={{ fontSize: 13.5, color: '#64748B', margin: '4px 0 0 0' }}>
                            {offers.length === 1 ? '1 vehículo con precio promocional' : `${offers.length} vehículos con precios promocionales`}
                        </p>
                    </div>

                    <Link 
                        href="/vehiculos" 
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: '#EA580C',
                            fontWeight: 700,
                            fontSize: 13.5,
                            textDecoration: 'none'
                        }}
                    >
                        <span>Ver catálogo completo</span>
                        <ArrowRight size={15} />
                    </Link>
                </div>

                {offers.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '64px 24px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        border: '1px dashed #CBD5E1',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                    }}>
                        <div style={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            backgroundColor: '#FFF7ED',
                            color: '#EA580C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <Flame size={32} />
                        </div>
                        <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                            No hay ofertas activas en este momento
                        </h3>
                        <p style={{ fontSize: 14, color: '#64748B', maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.6 }}>
                            Estamos renovando nuestras promociones. Mientras tanto, podés consultar todas nuestras unidades disponibles o contactarnos directamente para avisarte ante nuevas ofertas.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <Link href="/vehiculos" className="btn-primary" style={{ padding: '10px 20px', fontSize: 13.5 }}>
                                <Car size={16} />
                                <span>Ver Catálogo Completo</span>
                            </Link>
                            <a
                                href={`https://wa.me/${wp}?text=${encodeURIComponent('Hola! Me gustaría que me avisen cuando publiquen nuevas ofertas de vehículos en Special Cars.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-hero-whatsapp"
                                style={{
                                    backgroundColor: '#25D366',
                                    color: '#FFFFFF',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 20px',
                                    borderRadius: 10,
                                    fontWeight: 700,
                                    fontSize: 13.5,
                                    textDecoration: 'none'
                                }}
                            >
                                <MessageCircle size={16} />
                                <span>Avisarme de Nuevas Ofertas</span>
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="vehicles-grid">
                        {offers.map(v => (
                            <VehicleCard key={v.id} vehicle={v} isOfferSection={true} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
