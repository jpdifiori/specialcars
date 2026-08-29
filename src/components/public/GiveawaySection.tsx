'use client';

import { useState, useEffect } from 'react';
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
    MessageCircle,
    Clock,
    Flame
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
    const [mounted, setMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        isExpired: boolean;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

    // Determinar qué sorteo mostrar como principal
    const currentGiveaway = activeGiveaway || latestClosedGiveaway;
    const isClosed = !activeGiveaway && !!latestClosedGiveaway;

    useEffect(() => {
        setMounted(true);
        if (!currentGiveaway?.end_date) return;

        const calculateTime = () => {
            const now = new Date().getTime();
            // Handle date string (ensuring end of day if only date is provided)
            let target = new Date(currentGiveaway.end_date).getTime();
            if (currentGiveaway.end_date.length === 10) {
                target = new Date(`${currentGiveaway.end_date}T23:59:59`).getTime();
            }

            const difference = target - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [currentGiveaway?.end_date]);

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
        <section id="sorteos" style={{ padding: '50px 16px', backgroundColor: '#0B1120', position: 'relative', overflow: 'hidden' }}>
            {/* CSS Responsivo Incrustado para Mobile */}
            <style jsx>{`
                .giveaway-hero-grid {
                    display: grid;
                    grid-template-columns: 1.15fr 0.85fr;
                    align-items: center;
                    gap: 32px;
                    max-width: 1040px;
                    margin: 0 auto 48px;
                    padding: 0 12px;
                }
                .giveaway-hero-left {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                    text-align: left;
                }
                .giveaway-hero-title {
                    font-size: clamp(2.4rem, 5vw, 3.8rem);
                    font-weight: 900;
                    margin: 0;
                    letter-spacing: -0.03em;
                    line-height: 1.05;
                    display: flex;
                    flex-direction: column;
                }
                .giveaway-speech-bubble {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 18px;
                    background-color: rgba(30, 41, 59, 0.95);
                    border: 1px solid rgba(234, 88, 12, 0.45);
                    border-radius: 24px;
                    color: #FFFFFF;
                    font-size: 14px;
                    font-weight: 800;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                    width: fit-content;
                }
                .giveaway-clock-container {
                    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);
                    border: 1px solid rgba(234, 88, 12, 0.45);
                    box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.7), 0 0 25px rgba(234, 88, 12, 0.2);
                    border-radius: 20px;
                    padding: 16px 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    width: fit-content;
                }
                .giveaway-clock-box {
                    background-color: #0F172A;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 8px 12px;
                    min-width: 62px;
                    text-align: center;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
                }
                .giveaway-clock-box.seconds-box {
                    border-color: rgba(234, 88, 12, 0.7);
                    box-shadow: 0 0 14px rgba(234, 88, 12, 0.3), inset 0 2px 4px rgba(0,0,0,0.5);
                }
                .giveaway-clock-num {
                    font-size: clamp(1.4rem, 2.5vw, 1.8rem);
                    font-weight: 900;
                    color: #FFFFFF;
                    line-height: 1;
                    font-family: monospace;
                }
                .giveaway-clock-num.seconds-num {
                    color: #FB923C;
                }
                .giveaway-clock-label {
                    font-size: 10px;
                    font-weight: 800;
                    color: #94A3B8;
                    text-transform: uppercase;
                    margin-top: 4px;
                    letter-spacing: 0.04em;
                }
                .giveaway-clock-colon {
                    font-size: 20px;
                    font-weight: 900;
                    color: #EA580C;
                }
                .giveaway-hero-right {
                    display: flex;
                    align-items: center;
                    justifyContent: center;
                    position: relative;
                }
                .giveaway-hernan-wrapper {
                    position: relative;
                    width: 100%;
                    max-width: 390px;
                    height: 390px;
                    z-index: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .giveaway-hernan-glow {
                    position: absolute;
                    width: 320px;
                    height: 320px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(234, 88, 12, 0.45) 0%, rgba(234, 88, 12, 0) 70%);
                    filter: blur(25px);
                    z-index: 0;
                }
                .giveaway-spotlight-card {
                    background-color: #1E293B;
                    border-radius: 24px;
                    border: 2px solid rgba(234, 88, 12, 0.5);
                    overflow: hidden;
                    display: grid;
                    grid-template-columns: 1fr 1.2fr;
                    box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(234, 88, 12, 0.15);
                    position: relative;
                    max-width: 940px;
                    margin: 0 auto 48px;
                }
                .giveaway-spotlight-img-box {
                    min-height: 420px;
                    background-color: #0F172A;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }
                .giveaway-spotlight-info-box {
                    padding: 40px 32px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    position: relative;
                    background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
                    overflow: hidden;
                }
                .giveaway-spotlight-title {
                    font-size: clamp(1.6rem, 2.5vw, 2.2rem);
                    font-weight: 900;
                    color: #FFFFFF;
                    margin-bottom: 12px;
                    line-height: 1.2;
                    letter-spacing: -0.02em;
                    position: relative;
                    z-index: 1;
                }
                .giveaway-spotlight-desc-box {
                    padding: 12px 16px;
                    background-color: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-left: 4px solid #EA580C;
                    border-radius: 0 12px 12px 0;
                    margin-bottom: 20px;
                    position: relative;
                    z-index: 1;
                }
                .giveaway-spotlight-perks-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                    gap: 10px;
                    margin-bottom: 20px;
                    position: relative;
                    z-index: 1;
                }

                /* RESPONSIVE MOBILE OPTIMIZATIONS (≤ 768px) */
                @media (max-width: 768px) {
                    .giveaway-hero-grid {
                        display: flex !important;
                        flex-direction: row !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                        gap: 10px !important;
                        margin-bottom: 28px !important;
                        padding: 0 !important;
                    }
                    .giveaway-hero-left {
                        flex: 1 1 58% !important;
                        min-width: 0 !important;
                        gap: 8px !important;
                    }
                    .giveaway-hero-title {
                        font-size: clamp(1.35rem, 5.2vw, 1.95rem) !important;
                    }
                    .giveaway-speech-bubble {
                        padding: 4px 10px !important;
                        font-size: 10.5px !important;
                        border-radius: 14px !important;
                        gap: 5px !important;
                    }
                    .giveaway-speech-bubble span {
                        white-space: normal;
                        line-height: 1.2;
                    }
                    .giveaway-clock-container {
                        padding: 8px 10px !important;
                        border-radius: 14px !important;
                        gap: 6px !important;
                        width: 100% !important;
                    }
                    .giveaway-clock-header-row {
                        gap: 6px !important;
                    }
                    .giveaway-clock-header-txt {
                        font-size: 9.5px !important;
                    }
                    .giveaway-clock-live-badge {
                        font-size: 8.5px !important;
                        padding: 1px 5px !important;
                    }
                    .giveaway-clock-digits-row {
                        gap: 3px !important;
                    }
                    .giveaway-clock-box {
                        min-width: 32px !important;
                        padding: 4px 2px !important;
                        border-radius: 8px !important;
                        flex: 1;
                    }
                    .giveaway-clock-num {
                        font-size: 13.5px !important;
                    }
                    .giveaway-clock-label {
                        font-size: 7.5px !important;
                        margin-top: 1px !important;
                    }
                    .giveaway-clock-colon {
                        font-size: 12px !important;
                    }
                    .giveaway-clock-footer {
                        font-size: 9px !important;
                    }
                    .giveaway-hero-right {
                        flex: 0 0 40% !important;
                        max-width: 160px !important;
                    }
                    .giveaway-hernan-wrapper {
                        height: 200px !important;
                        max-width: 160px !important;
                    }
                    .giveaway-hernan-glow {
                        width: 150px !important;
                        height: 150px !important;
                    }

                    /* TARJETA DEL PREMIO EN MOBILE: UNO AL LADO DEL OTRO */
                    .giveaway-spotlight-card {
                        display: flex !important;
                        flex-direction: row !important;
                        border-radius: 16px !important;
                        margin-bottom: 28px !important;
                    }
                    .giveaway-spotlight-img-box {
                        flex: 0 0 42% !important;
                        min-height: 180px !important;
                        padding: 8px !important;
                    }
                    .giveaway-spotlight-info-box {
                        flex: 1 1 58% !important;
                        padding: 12px 10px !important;
                    }
                    .giveaway-spotlight-badge {
                        font-size: 9.5px !important;
                        padding: 2px 7px !important;
                    }
                    .giveaway-spotlight-title {
                        font-size: 14px !important;
                        margin-bottom: 4px !important;
                    }
                    .giveaway-spotlight-desc-box {
                        padding: 6px 8px !important;
                        margin-bottom: 8px !important;
                    }
                    .giveaway-spotlight-desc-box p {
                        font-size: 11px !important;
                        line-height: 1.35 !important;
                    }
                    .giveaway-spotlight-perks-grid {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 4px !important;
                        margin-bottom: 8px !important;
                    }
                    .giveaway-spotlight-perk-item {
                        padding: 4px 6px !important;
                        font-size: 9px !important;
                        gap: 4px !important;
                        border-radius: 6px !important;
                    }
                    .giveaway-spotlight-cta {
                        font-size: 10px !important;
                        gap: 4px !important;
                    }
                }
            `}</style>

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
                {/* Header de la sección: 2 Columnas (Texto Izquierda + Hernán Grande Derecha) */}
                <div className="giveaway-hero-grid">
                    {/* Columna Izquierda: Títulos y Datos */}
                    <div className="giveaway-hero-left">
                        <h2 className="giveaway-hero-title">
                            <span style={{ color: '#FFFFFF', textTransform: 'uppercase' }}>SORTEOS</span>
                            <span style={{ color: '#EA580C' }}>Special Cars</span>
                        </h2>

                        {/* Globo de mensaje divertido */}
                        <div className="giveaway-speech-bubble">
                            <Sparkles size={15} style={{ color: '#F59E0B', flexShrink: 0 }} />
                            <span>¡Sumate gratis, vos podés ser el próximo ganador!</span>
                        </div>

                        {/* RELOJ DE CUENTA REGRESIVA ÉPICO */}
                        <div className="giveaway-clock-container">
                            {/* Cabecera del Reloj */}
                            <div className="giveaway-clock-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                                <div className="giveaway-clock-header-txt" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FB923C', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    <Clock size={14} style={{ color: '#EA580C' }} />
                                    <span>{timeLeft.isExpired ? '⏳ Sorteo en Proceso' : '⏳ El sorteo finaliza en:'}</span>
                                </div>
                                <div className="giveaway-clock-live-badge" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    padding: '3px 9px',
                                    borderRadius: 12,
                                    backgroundColor: 'rgba(234, 88, 12, 0.15)',
                                    border: '1px solid rgba(234, 88, 12, 0.3)',
                                    color: '#EA580C',
                                    fontSize: 11,
                                    fontWeight: 900
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
                                    <span>EN VIVO</span>
                                </div>
                            </div>

                            {/* Bloques de Tiempo Digitales */}
                            {mounted ? (
                                <div className="giveaway-clock-digits-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {/* Días */}
                                    <div className="giveaway-clock-box">
                                        <div className="giveaway-clock-num">
                                            {String(timeLeft.days).padStart(2, '0')}
                                        </div>
                                        <div className="giveaway-clock-label">
                                            Días
                                        </div>
                                    </div>

                                    <span className="giveaway-clock-colon">:</span>

                                    {/* Horas */}
                                    <div className="giveaway-clock-box">
                                        <div className="giveaway-clock-num">
                                            {String(timeLeft.hours).padStart(2, '0')}
                                        </div>
                                        <div className="giveaway-clock-label">
                                            Horas
                                        </div>
                                    </div>

                                    <span className="giveaway-clock-colon">:</span>

                                    {/* Minutos */}
                                    <div className="giveaway-clock-box">
                                        <div className="giveaway-clock-num">
                                            {String(timeLeft.minutes).padStart(2, '0')}
                                        </div>
                                        <div className="giveaway-clock-label">
                                            Min
                                        </div>
                                    </div>

                                    <span className="giveaway-clock-colon">:</span>

                                    {/* Segundos (con resplandor naranja vibrante) */}
                                    <div className="giveaway-clock-box seconds-box">
                                        <div className="giveaway-clock-num seconds-num">
                                            {String(timeLeft.seconds).padStart(2, '0')}
                                        </div>
                                        <div className="giveaway-clock-label" style={{ color: '#EA580C' }}>
                                            Seg
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>
                                    Cargando cuenta regresiva...
                                </div>
                            )}

                            {/* Subtexto con fecha exacta */}
                            <div className="giveaway-clock-footer" style={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Calendar size={13} style={{ color: '#EA580C' }} />
                                <span>Cierre del sorteo: <strong>{formatDate(currentGiveaway.end_date)}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Hernán Saltando */}
                    <div className="giveaway-hero-right">
                        {/* Resplandor cálido detrás de Hernán */}
                        <div className="giveaway-hernan-glow" />

                        <div className="giveaway-hernan-wrapper">
                            <img
                                src="/images/hernan-jumping-winner.png"
                                alt="Hernán celebrando ganador del sorteo Special Cars"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.6))'
                                }}
                            />
                        </div>
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
                    <div style={{ maxWidth: 940, margin: '0 auto 48px' }}>
                        {(() => {
                            const prize = prizes[0];
                            const badge = getMedalBadge(prize.position);
                            const isWinnerAssigned = Boolean(prize.winner_name && prize.winner_name.trim());

                            return (
                                <div className="giveaway-spotlight-card">
                                    {/* Imagen del Premio */}
                                    <div className="giveaway-spotlight-img-box">
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
                                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5)',
                                            border: `1px solid ${badge.border}`
                                        }}>
                                            <span style={{ fontSize: 15 }}>{badge.icon}</span>
                                            <span>{badge.label}</span>
                                        </div>

                                        {prize.image_url ? (
                                            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 200 }}>
                                                <Image
                                                    src={prize.image_url}
                                                    alt={prize.title}
                                                    fill
                                                    style={{ objectFit: 'contain' }}
                                                    sizes="(max-width: 768px) 50vw, 50vw"
                                                    priority
                                                />
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', color: '#64748B' }}>
                                                <Gift size={64} strokeWidth={1.5} style={{ color: '#EA580C', opacity: 0.8, marginBottom: 10 }} />
                                                <p style={{ fontSize: 13, margin: 0, fontWeight: 700 }}>Premio Especial</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Información del Premio con Franjas y Estilo Festejos */}
                                    <div className="giveaway-spotlight-info-box">
                                        {/* Franjas diagonales de competición / festejo decorativas */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '180px',
                                            height: '100%',
                                            background: 'repeating-linear-gradient(-45deg, rgba(234, 88, 12, 0.05) 0, rgba(234, 88, 12, 0.05) 12px, transparent 12px, transparent 24px)',
                                            pointerEvents: 'none',
                                            zIndex: 0
                                        }} />

                                        {/* Cinta / Banner superior de celebración */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            gap: 6,
                                            marginBottom: 10,
                                            position: 'relative',
                                            zIndex: 1
                                        }}>
                                            <div className="giveaway-spotlight-badge" style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 5,
                                                padding: '3px 10px',
                                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                                border: '1px solid rgba(245, 158, 11, 0.4)',
                                                borderRadius: 20,
                                                color: '#F59E0B',
                                                fontSize: 11,
                                                fontWeight: 900,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                <Sparkles size={13} />
                                                <span>Premio Principal</span>
                                            </div>

                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                fontSize: 10.5,
                                                fontWeight: 800,
                                                color: '#EA580C',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.04em'
                                            }}>
                                                <Flame size={12} />
                                                <span>Edición Especial</span>
                                            </div>
                                        </div>

                                        {/* Título del Premio */}
                                        <h3 className="giveaway-spotlight-title">
                                            {prize.title}
                                        </h3>

                                        {/* Descripción del Premio en tarjeta destacada */}
                                        {prize.description && (
                                            <div className="giveaway-spotlight-desc-box">
                                                <p style={{ color: '#F1F5F9', fontSize: 14, lineHeight: 1.45, margin: 0, fontWeight: 500 }}>
                                                    {prize.description}
                                                </p>
                                            </div>
                                        )}

                                        {/* Franja de Beneficios / Características del Sorteo */}
                                        <div className="giveaway-spotlight-perks-grid">
                                            <div className="giveaway-spotlight-perk-item" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                padding: '6px 10px',
                                                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                                                borderRadius: 8,
                                                border: '1px solid rgba(255, 255, 255, 0.06)'
                                            }}>
                                                <Gift size={14} style={{ color: '#EA580C', flexShrink: 0 }} />
                                                <span style={{ fontSize: 11, color: '#E2E8F0', fontWeight: 700 }}>
                                                    100% Gratuito
                                                </span>
                                            </div>

                                            <div className="giveaway-spotlight-perk-item" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                padding: '6px 10px',
                                                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                                                borderRadius: 8,
                                                border: '1px solid rgba(255, 255, 255, 0.06)'
                                            }}>
                                                <Trophy size={14} style={{ color: '#F59E0B', flexShrink: 0 }} />
                                                <span style={{ fontSize: 11, color: '#E2E8F0', fontWeight: 700 }}>
                                                    Entrega Directa
                                                </span>
                                            </div>
                                        </div>

                                        {/* Indicador para completar formulario abajo */}
                                        <div className="giveaway-spotlight-cta" style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            color: '#FB923C',
                                            fontSize: 12,
                                            fontWeight: 800,
                                            position: 'relative',
                                            zIndex: 1
                                        }}>
                                            <PartyPopper size={15} style={{ color: '#EA580C' }} />
                                            <span>¡Completá abajo para participar!</span>
                                        </div>

                                        {isWinnerAssigned && (
                                            <div style={{
                                                marginTop: 14,
                                                padding: '10px 14px',
                                                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                                                borderRadius: 12,
                                                border: '1px solid rgba(34, 197, 94, 0.4)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                position: 'relative',
                                                zIndex: 1
                                            }}>
                                                <Trophy size={20} style={{ color: '#4ADE80', flexShrink: 0 }} />
                                                <div>
                                                    <div style={{ fontSize: 10, fontWeight: 800, color: '#86EFAC', textTransform: 'uppercase' }}>
                                                        Ganador Oficial
                                                    </div>
                                                    <div style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 800 }}>
                                                        {prize.winner_name}
                                                    </div>
                                                </div>
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
                            const isWinnerAssigned = Boolean(prize.winner_name && prize.winner_name.trim());

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
                            const isWinnerAssigned = Boolean(prize.winner_name && prize.winner_name.trim());

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

            </div>
        </section>
    );
}
