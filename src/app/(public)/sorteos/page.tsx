import Link from 'next/link';
import Image from 'next/image';
import { getActiveGiveaway, getPublicGiveaways } from '@/lib/actions/giveaways';
import { getAgencySettings } from '@/lib/actions/settings';
import { GiveawaySection } from '@/components/public/GiveawaySection';
import { 
    Gift, 
    Trophy, 
    Calendar, 
    Sparkles, 
    ShieldCheck, 
    CheckCircle2, 
    HelpCircle, 
    ArrowRight,
    Award
} from 'lucide-react';

export const metadata = {
    title: 'Sorteos y Concursos Oficiales | Special Cars Necochea',
    description: 'Participá gratis en los sorteos oficiales de Special Cars. Consultá las bases, premios (1°, 2° y 3° puesto) y conocé a los ganadores de cada edición.',
    openGraph: {
        title: '🎁 Sorteos Exclusivos | Special Cars',
        description: 'Inscribite gratis con tu nombre, email y celular para participar por increíbles premios.',
        type: 'website'
    }
};

export default async function PublicGiveawaysPage() {
    const [giveawayRes, allGiveaways, settings] = await Promise.all([
        getActiveGiveaway(),
        getPublicGiveaways(),
        getAgencySettings()
    ]);

    const wp = settings.whatsapp || '5492262574254';
    const pastGiveaways = allGiveaways.filter(g => g.status === 'closed');

    const formatDate = (isoString: string) => {
        try {
            return new Date(isoString).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return isoString;
        }
    };

    return (
        <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: 80 }}>
            {/* Cabecera & Breadcrumbs */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748B', marginBottom: 20 }}>
                    <Link href="/" style={{ color: '#EA580C', fontWeight: 600 }}>Inicio</Link>
                    <span>/</span>
                    <span style={{ color: '#0F172A', fontWeight: 700 }}>Sorteos</span>
                </div>
            </div>

            {/* SECCIÓN PRINCIPAL: SORTEO ACTIVO Y FORMULARIO */}
            <GiveawaySection 
                activeGiveaway={giveawayRes.active} 
                latestClosedGiveaway={giveawayRes.latestClosed} 
                whatsappNumber={wp} 
            />

            <div style={{ maxWidth: 1200, margin: '60px auto 0', padding: '0 20px' }}>
                {/* HISTORIAL DE SORTEOS ANTERIORES & GANADORES */}
                {pastGiveaways.length > 0 && (
                    <div style={{ marginBottom: 60 }}>
                        <div style={{ marginBottom: 24, textAlign: 'center' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                color: '#EA580C',
                                fontWeight: 800,
                                fontSize: 12,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                marginBottom: 6
                            }}>
                                <Trophy size={14} />
                                <span>Ediciones Pasadas</span>
                            </div>
                            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                                Historial de Ganadores
                            </h2>
                            <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
                                Conoce a los afortunados ganadores de las ediciones anteriores de nuestros sorteos.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                            {pastGiveaways.map((giveaway) => (
                                <div
                                    key={giveaway.id}
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: 16,
                                        border: '1px solid #E2E8F0',
                                        padding: '24px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                                            {giveaway.title}
                                        </h3>
                                        <span style={{
                                            fontSize: 11,
                                            fontWeight: 800,
                                            backgroundColor: '#DCFCE7',
                                            color: '#15803D',
                                            padding: '3px 8px',
                                            borderRadius: 20
                                        }}>
                                            FINALIZADO
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#64748B', marginBottom: 16 }}>
                                        <Calendar size={14} style={{ color: '#EA580C' }} />
                                        <span>Fecha: {formatDate(giveaway.end_date)}</span>
                                    </div>

                                    {/* Lista de premios y ganadores */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {(giveaway.prizes || []).map((prize) => (
                                            <div
                                                key={prize.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '10px 14px',
                                                    backgroundColor: '#F8FAFC',
                                                    borderRadius: 10,
                                                    border: '1px solid #E2E8F0'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C' }}>
                                                        {prize.position}° PREMIO: {prize.title}
                                                    </div>
                                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                                                        🏆 {prize.winner_name || 'Ganador anunciado'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* BASES Y PREGUNTAS FRECUENTES */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    border: '1px solid #E2E8F0',
                    padding: '36px 28px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <HelpCircle size={24} style={{ color: '#EA580C' }} />
                        <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                            Preguntas Frecuentes sobre nuestros Sorteos
                        </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                        <div>
                            <h4 style={{ fontSize: 15, fontWeight: 800, color: '#1E293B', marginBottom: 6 }}>
                                ¿Tiene algún costo participar?
                            </h4>
                            <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                                No, la participación en todos nuestros sorteos es 100% gratuita y sin obligación de compra.
                            </p>
                        </div>

                        <div>
                            <h4 style={{ fontSize: 15, fontWeight: 800, color: '#1E293B', marginBottom: 6 }}>
                                ¿Cómo se eligen los ganadores?
                            </h4>
                            <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                                Se realiza una selección aleatoria y transparente entre todos los inscriptos válidos al momento de finalizar la fecha del sorteo.
                            </p>
                        </div>

                        <div>
                            <h4 style={{ fontSize: 15, fontWeight: 800, color: '#1E293B', marginBottom: 6 }}>
                                ¿Cómo me entero si gané?
                            </h4>
                            <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                                Publicamos los nombres y apellidos de los ganadores en esta sección y además nos comunicamos directamente por WhatsApp o llamada telefónica.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
