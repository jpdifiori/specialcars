'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Giveaway, GiveawayPrize } from '@/lib/types';
import { registerGiveawayParticipant } from '@/lib/actions/giveaways';
import { 
    Gift, 
    Trophy, 
    Calendar, 
    Users, 
    Sparkles, 
    CheckCircle2, 
    AlertCircle, 
    ArrowRight, 
    Award, 
    Medal, 
    PartyPopper,
    Send,
    MessageCircle
} from 'lucide-react';

interface GiveawaySectionProps {
    activeGiveaway?: Giveaway | null;
    latestClosedGiveaway?: Giveaway | null;
    whatsappNumber?: string;
}

export function GiveawaySection({ 
    activeGiveaway, 
    latestClosedGiveaway,
    whatsappNumber = '5492262574254'
}: GiveawaySectionProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [registeredSuccessfully, setRegisteredSuccessfully] = useState(false);

    // Determinar qué sorteo mostrar como principal
    const currentGiveaway = activeGiveaway || latestClosedGiveaway;
    const isClosed = !activeGiveaway && !!latestClosedGiveaway;

    if (!currentGiveaway) {
        return (
            <section id="sorteos" className="giveaway-section-wrapper" style={{ padding: '60px 20px', backgroundColor: '#0B1120' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', color: '#FFFFFF' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 16px',
                        backgroundColor: 'rgba(234, 88, 12, 0.15)',
                        border: '1px solid rgba(234, 88, 12, 0.4)',
                        borderRadius: 30,
                        color: '#FB923C',
                        fontWeight: 700,
                        fontSize: 13,
                        marginBottom: 16
                    }}>
                        <Gift size={16} />
                        <span>Sorteos Especiales</span>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 12, color: '#F8FAFC' }}>
                        ¡Próximamente nuevos sorteos en Special Cars!
                    </h2>
                    <p style={{ color: '#94A3B8', maxWidth: 600, margin: '0 auto 24px', fontSize: 15, lineHeight: 1.6 }}>
                        Estamos preparando premios y sorpresas exclusivas para nuestra comunidad. Seguinos en nuestras redes o contactanos para enterarte primero.
                    </p>
                    <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola! Me gustaría enterarme de los próximos sorteos de Special Cars.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-hero-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    >
                        <MessageCircle size={18} />
                        <span>Consultar por WhatsApp</span>
                    </a>
                </div>
            </section>
        );
    }

    const prizes = (currentGiveaway.prizes || []).sort((a, b) => a.position - b.position);

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

    const getMedalBadge = (position: number) => {
        if (position === 1) {
            return {
                label: '1° PREMIO',
                icon: '🥇',
                bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFFFFF',
                border: '#FBBF24'
            };
        }
        if (position === 2) {
            return {
                label: '2° PREMIO',
                icon: '🥈',
                bg: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
                color: '#FFFFFF',
                border: '#CBD5E1'
            };
        }
        if (position === 3) {
            return {
                label: '3° PREMIO',
                icon: '🥉',
                bg: 'linear-gradient(135deg, #B45309 0%, #78350F 100%)',
                color: '#FFFFFF',
                border: '#D97706'
            };
        }
        return {
            label: `${position}° PREMIO`,
            icon: '🎁',
            bg: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            color: '#FFFFFF',
            border: '#818CF8'
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage(null);

        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
            setStatusMessage({ type: 'error', text: 'Por favor completá todos los campos para participar.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await registerGiveawayParticipant({
                giveaway_id: currentGiveaway.id,
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone
            });

            if (res.success) {
                setRegisteredSuccessfully(true);
                setStatusMessage({ type: 'success', text: res.message || '¡Te registraste exitosamente en el sorteo!' });
            } else {
                setStatusMessage({ type: 'error', text: res.error || 'Ocurrió un error al registrarte.' });
            }
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.message || 'Error de conexión. Intentalo de nuevo.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/sorteos` : 'https://specialcarsnecochea.com/sorteos';
    const whatsappShareText = encodeURIComponent(`¡Participá del ${currentGiveaway.title} en Special Cars! Ingresá acá: ${shareUrl}`);

    return (
        <section id="sorteos" style={{ padding: '70px 20px', backgroundColor: '#0B1120', position: 'relative', overflow: 'hidden' }}>
            {/* Elementos visuales de fondo */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '800px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(234, 88, 12, 0.12) 0%, rgba(11, 17, 32, 0) 70%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header de la sección */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 18px',
                        backgroundColor: isClosed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 88, 12, 0.15)',
                        border: `1px solid ${isClosed ? 'rgba(34, 197, 94, 0.4)' : 'rgba(234, 88, 12, 0.4)'}`,
                        borderRadius: 30,
                        color: isClosed ? '#4ADE80' : '#FB923C',
                        fontWeight: 800,
                        fontSize: 13,
                        marginBottom: 14,
                        letterSpacing: '0.04em'
                    }}>
                        {isClosed ? <PartyPopper size={16} /> : <Gift size={16} />}
                        <span>{isClosed ? '🏆 RESULTADOS DEL SORTEO' : '🎁 SORTEO ACTIVO'}</span>
                    </div>

                    <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, color: '#FFFFFF', marginBottom: 12, letterSpacing: '-0.02em' }}>
                        {currentGiveaway.title}
                    </h2>

                    {currentGiveaway.description && (
                        <p style={{ color: '#94A3B8', maxWidth: 720, margin: '0 auto 16px', fontSize: 16, lineHeight: 1.6 }}>
                            {currentGiveaway.description}
                        </p>
                    )}

                    {/* Chips de Fechas y Participantes */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 16 }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 14px',
                            backgroundColor: 'rgba(30, 41, 59, 0.8)',
                            borderRadius: 20,
                            border: '1px solid #334155',
                            color: '#CBD5E1',
                            fontSize: 13,
                            fontWeight: 600
                        }}>
                            <Calendar size={14} style={{ color: '#EA580C' }} />
                            <span>Vigencia: {formatDate(currentGiveaway.start_date)} al {formatDate(currentGiveaway.end_date)}</span>
                        </div>

                        {!isClosed && currentGiveaway.participants_count !== undefined && (
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 14px',
                                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                borderRadius: 20,
                                border: '1px solid #334155',
                                color: '#CBD5E1',
                                fontSize: 13,
                                fontWeight: 600
                            }}>
                                <Users size={14} style={{ color: '#38BDF8' }} />
                                <span>{currentGiveaway.participants_count} {currentGiveaway.participants_count === 1 ? 'persona participando' : 'personas participando'}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Banner de Ganadores si el sorteo ya está cerrado */}
                {isClosed && (
                    <div style={{
                        backgroundColor: 'rgba(22, 101, 52, 0.2)',
                        border: '2px solid rgba(34, 197, 94, 0.4)',
                        borderRadius: 16,
                        padding: '24px 20px',
                        marginBottom: 36,
                        textAlign: 'center',
                        color: '#FFFFFF'
                    }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <Trophy size={28} style={{ color: '#FACC15' }} />
                            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#4ADE80', margin: 0 }}>
                                ¡Felicitaciones a los Ganadores!
                            </h3>
                        </div>
                        <p style={{ color: '#E2E8F0', fontSize: 15, margin: 0 }}>
                            Agradecemos a todos por participar. A continuación se detallan los ganadores de cada puesto:
                        </p>
                    </div>
                )}

                {/* Grid o Showcase de Premios según la cantidad (1, 2, 3 o más) */}
                {prizes.length === 1 ? (
                    // CASO 1 PREMIO: Spotlight Card Destacado
                    <div style={{ maxWidth: 820, margin: '0 auto 48px' }}>
                        {(() => {
                            const prize = prizes[0];
                            const badge = getMedalBadge(prize.position);
                            const isWinnerAssigned = !prize.winner_name;

                            return (
                                <div style={{
                                    backgroundColor: '#1E293B',
                                    borderRadius: 22,
                                    border: '2px solid rgba(245, 158, 11, 0.4)',
                                    overflow: 'hidden',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
                                    position: 'relative'
                                }}>
                                    {/* Imagen del Premio */}
                                    <div style={{
                                        minHeight: 280,
                                        maxHeight: 380,
                                        backgroundColor: '#0F172A',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 16
                                    }}>
                                        {/* Badge de Medalla */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 14,
                                            left: 14,
                                            zIndex: 2,
                                            background: badge.bg,
                                            color: badge.color,
                                            padding: '6px 14px',
                                            borderRadius: 30,
                                            fontWeight: 900,
                                            fontSize: 12,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                                            border: `1px solid ${badge.border}`
                                        }}>
                                            <span style={{ fontSize: 15 }}>{badge.icon}</span>
                                            <span>{badge.label}</span>
                                        </div>

                                        {prize.image_url ? (
                                            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 250 }}>
                                                <Image
                                                    src={prize.image_url}
                                                    alt={prize.title}
                                                    fill
                                                    style={{ objectFit: 'contain' }}
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                />
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', color: '#64748B' }}>
                                                <Gift size={64} strokeWidth={1.5} style={{ color: '#EA580C', opacity: 0.8, marginBottom: 8 }} />
                                                <p style={{ fontSize: 14, margin: 0, fontWeight: 600 }}>Premio Especial</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Información del Premio */}
                                    <div style={{
                                        padding: '32px 28px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        backgroundColor: '#1E293B'
                                    }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            color: '#F59E0B',
                                            fontSize: 12,
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            marginBottom: 8
                                        }}>
                                            <Sparkles size={15} />
                                            <span>Premio Principal en Juego</span>
                                        </div>

                                        <h3 style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF', marginBottom: 12, lineHeight: 1.3 }}>
                                            {prize.title}
                                        </h3>

                                        {prize.description && (
                                            <p style={{ color: '#CBD5E1', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                                                {prize.description}
                                            </p>
                                        )}

                                        {isWinnerAssigned && (
                                            <div style={{
                                                marginTop: 20,
                                                padding: '12px 16px',
                                                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                                                borderRadius: 12,
                                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10
                                            }}>
                                                <Trophy size={20} style={{ color: '#4ADE80', flexShrink: 0 }} />
                                                <span style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 600 }}>
                                                    Ganador Oficial: <strong>{prize.winner_name}</strong>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                ) : prizes.length === 2 ? (
                    // CASO 2 PREMIOS: Grid de 2 Columnas Centradas
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: 24,
                        maxWidth: 960,
                        margin: '0 auto 48px'
                    }}>
                        {prizes.map((prize) => {
                            const badge = getMedalBadge(prize.position);
                            const isWinnerAssigned = !prize.winner_name;

                            return (
                                <div
                                    key={prize.id}
                                    style={{
                                        backgroundColor: '#1E293B',
                                        borderRadius: 20,
                                        border: `2px solid ${isWinnerAssigned ? '#22C55E' : '#334155'}`,
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.45)'
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute',
                                        top: 14,
                                        left: 14,
                                        zIndex: 2,
                                        background: badge.bg,
                                        color: badge.color,
                                        padding: '6px 14px',
                                        borderRadius: 30,
                                        fontWeight: 900,
                                        fontSize: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                                        border: `1px solid ${badge.border}`
                                    }}>
                                        <span style={{ fontSize: 15 }}>{badge.icon}</span>
                                        <span>{badge.label}</span>
                                    </div>

                                    <div style={{
                                        width: '100%',
                                        height: 240,
                                        backgroundColor: '#0F172A',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 14
                                    }}>
                                        {prize.image_url ? (
                                            <Image
                                                src={prize.image_url}
                                                alt={prize.title}
                                                fill
                                                style={{ objectFit: 'contain' }}
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                        ) : (
                                            <div style={{ textAlign: 'center', color: '#64748B' }}>
                                                <Gift size={54} strokeWidth={1.5} style={{ color: '#EA580C', opacity: 0.8, marginBottom: 8 }} />
                                                <p style={{ fontSize: 13, margin: 0, fontWeight: 600 }}>Premio Especial</p>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <h4 style={{ fontSize: 19, fontWeight: 800, color: '#FFFFFF', marginBottom: 8, lineHeight: 1.3 }}>
                                                {prize.title}
                                            </h4>
                                            {prize.description && (
                                                <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                                                    {prize.description}
                                                </p>
                                            )}
                                        </div>

                                        {isWinnerAssigned && (
                                            <div style={{
                                                marginTop: 16,
                                                padding: '10px 14px',
                                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                borderRadius: 10,
                                                border: '1px solid rgba(34, 197, 94, 0.25)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8
                                            }}>
                                                <Award size={18} style={{ color: '#4ADE80', flexShrink: 0 }} />
                                                <span style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 600 }}>
                                                    Ganador: <strong>{prize.winner_name}</strong>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // CASO 3 O MÁS PREMIOS: Grid de 3 Columnas
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 24,
                        marginBottom: 48
                    }}>
                        {prizes.map((prize) => {
                            const badge = getMedalBadge(prize.position);
                            const isWinnerAssigned = !prize.winner_name;

                            return (
                                <div
                                    key={prize.id}
                                    style={{
                                        backgroundColor: '#1E293B',
                                        borderRadius: 18,
                                        border: `2px solid ${isWinnerAssigned ? '#22C55E' : '#334155'}`,
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute',
                                        top: 14,
                                        left: 14,
                                        zIndex: 2,
                                        background: badge.bg,
                                        color: badge.color,
                                        padding: '6px 14px',
                                        borderRadius: 30,
                                        fontWeight: 900,
                                        fontSize: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                        border: `1px solid ${badge.border}`
                                    }}>
                                        <span style={{ fontSize: 15 }}>{badge.icon}</span>
                                        <span>{badge.label}</span>
                                    </div>

                                    <div style={{
                                        width: '100%',
                                        height: 220,
                                        backgroundColor: '#0F172A',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 12
                                    }}>
                                        {prize.image_url ? (
                                            <Image
                                                src={prize.image_url}
                                                alt={prize.title}
                                                fill
                                                style={{ objectFit: 'contain' }}
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div style={{ textAlign: 'center', color: '#64748B' }}>
                                                <Gift size={54} strokeWidth={1.5} style={{ color: '#EA580C', opacity: 0.8, marginBottom: 8 }} />
                                                <p style={{ fontSize: 13, margin: 0, fontWeight: 600 }}>Premio Especial</p>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <h4 style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, lineHeight: 1.3 }}>
                                                {prize.title}
                                            </h4>
                                            {prize.description && (
                                                <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                                                    {prize.description}
                                                </p>
                                            )}
                                        </div>

                                        {isWinnerAssigned && (
                                            <div style={{
                                                marginTop: 16,
                                                padding: '10px 12px',
                                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                borderRadius: 10,
                                                border: '1px solid rgba(34, 197, 94, 0.25)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8
                                            }}>
                                                <Award size={18} style={{ color: '#4ADE80', flexShrink: 0 }} />
                                                <span style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 600 }}>
                                                    Premio asignado a: <strong>{prize.winner_name}</strong>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Formulario de Participación Luminoso y de Alto Contraste (Solo si el sorteo está ACTIVO) */}
                {!isClosed && (
                    <div style={{
                        maxWidth: 720,
                        margin: '0 auto',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 24,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '40px 32px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
                    }}>
                        {!registeredSuccessfully ? (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        backgroundColor: '#FFF7ED',
                                        border: '1px solid #FDBA74',
                                        color: '#EA580C',
                                        padding: '4px 14px',
                                        borderRadius: 20,
                                        fontWeight: 800,
                                        fontSize: 12,
                                        marginBottom: 10,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em'
                                    }}>
                                        <Sparkles size={15} />
                                        <span>Participá Gratis en 30 Segundos</span>
                                    </div>
                                    <h3 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                                        Completá tus datos para participar
                                    </h3>
                                    <p style={{ color: '#64748B', fontSize: 14.5, margin: 0 }}>
                                        Ingresá tus datos para entrar en el sorteo. Te contactaremos si resultás ganador.
                                    </p>
                                </div>

                                {statusMessage && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '12px 16px',
                                        borderRadius: 12,
                                        marginBottom: 22,
                                        fontSize: 14,
                                        fontWeight: 700,
                                        backgroundColor: statusMessage.type === 'success' ? '#DCFCE7' : '#FEE2E2',
                                        border: `1px solid ${statusMessage.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
                                        color: statusMessage.type === 'success' ? '#15803D' : '#B91C1C'
                                    }}>
                                        {statusMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                        <span>{statusMessage.text}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 6 }}>
                                                Nombre <span style={{ color: '#EA580C' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej: Juan Pablo"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: 12,
                                                    backgroundColor: '#F8FAFC',
                                                    border: '1.5px solid #CBD5E1',
                                                    color: '#0F172A',
                                                    fontSize: 15,
                                                    fontWeight: 500,
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#EA580C';
                                                    e.target.style.backgroundColor = '#FFFFFF';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.15)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#CBD5E1';
                                                    e.target.style.backgroundColor = '#F8FAFC';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 6 }}>
                                                Apellido <span style={{ color: '#EA580C' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej: Pérez"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: 12,
                                                    backgroundColor: '#F8FAFC',
                                                    border: '1.5px solid #CBD5E1',
                                                    color: '#0F172A',
                                                    fontSize: 15,
                                                    fontWeight: 500,
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#EA580C';
                                                    e.target.style.backgroundColor = '#FFFFFF';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.15)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#CBD5E1';
                                                    e.target.style.backgroundColor = '#F8FAFC';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 6 }}>
                                                Correo Electrónico <span style={{ color: '#EA580C' }}>*</span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="tu@email.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: 12,
                                                    backgroundColor: '#F8FAFC',
                                                    border: '1.5px solid #CBD5E1',
                                                    color: '#0F172A',
                                                    fontSize: 15,
                                                    fontWeight: 500,
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#EA580C';
                                                    e.target.style.backgroundColor = '#FFFFFF';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.15)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#CBD5E1';
                                                    e.target.style.backgroundColor = '#F8FAFC';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 6 }}>
                                                Celular / WhatsApp <span style={{ color: '#EA580C' }}>*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="Ej: 2262 574254"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: 12,
                                                    backgroundColor: '#F8FAFC',
                                                    border: '1.5px solid #CBD5E1',
                                                    color: '#0F172A',
                                                    fontSize: 15,
                                                    fontWeight: 500,
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#EA580C';
                                                    e.target.style.backgroundColor = '#FFFFFF';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.15)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#CBD5E1';
                                                    e.target.style.backgroundColor = '#F8FAFC';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        style={{
                                            marginTop: 8,
                                            width: '100%',
                                            padding: '15px 24px',
                                            borderRadius: 12,
                                            background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                                            color: '#FFFFFF',
                                            fontSize: 16,
                                            fontWeight: 900,
                                            border: 'none',
                                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 10,
                                            boxShadow: '0 12px 24px -6px rgba(234, 88, 12, 0.45)',
                                            transition: 'transform 0.15s ease, opacity 0.2s ease'
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <span>Registrando tu participación...</span>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                <span>¡Quiero Participar del Sorteo!</span>
                                            </>
                                        )}
                                    </button>

                                    <p style={{ fontSize: 12, color: '#64748B', textAlign: 'center', margin: '4px 0 0' }}>
                                        🔒 Tus datos están protegidos. Al participar aceptás las bases del sorteo de Special Cars.
                                    </p>
                                </form>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px 8px' }}>
                                <div style={{
                                    width: 70,
                                    height: 70,
                                    borderRadius: '50%',
                                    backgroundColor: '#DCFCE7',
                                    border: '2px solid #22C55E',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    color: '#15803D'
                                }}>
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>
                                    ¡Ya estás participando!
                                </h3>
                                <p style={{ color: '#475569', fontSize: 15, maxWidth: 500, margin: '0 auto 24px', lineHeight: 1.6 }}>
                                    Registramos tus datos correctamente para <strong>{currentGiveaway.title}</strong>. El sorteo se realizará el día <strong>{formatDate(currentGiveaway.end_date)}</strong>.
                                </p>

                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
                                    <a
                                        href={`https://wa.me/?text=${whatsappShareText}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '12px 20px',
                                            backgroundColor: '#25D366',
                                            color: '#FFFFFF',
                                            fontWeight: 800,
                                            borderRadius: 10,
                                            fontSize: 14,
                                            textDecoration: 'none'
                                        }}
                                    >
                                        <MessageCircle size={18} />
                                        <span>Compartir por WhatsApp</span>
                                    </a>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRegisteredSuccessfully(false);
                                            setFormData({ firstName: '', lastName: '', email: '', phone: '' });
                                            setStatusMessage(null);
                                        }}
                                        style={{
                                            padding: '12px 20px',
                                            backgroundColor: '#F1F5F9',
                                            color: '#334155',
                                            fontWeight: 700,
                                            borderRadius: 10,
                                            fontSize: 14,
                                            border: '1px solid #CBD5E1',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Registrar a otra persona
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Botón Ver Más / Bases */}
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                    <Link
                        href="/sorteos"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 20px',
                            borderRadius: 30,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#FB923C',
                            fontWeight: 700,
                            fontSize: 14,
                            textDecoration: 'none'
                        }}
                    >
                        <span>Ver más detalles, bases y sorteos anteriores</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
