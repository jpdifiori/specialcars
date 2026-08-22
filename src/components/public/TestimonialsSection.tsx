'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle, ShieldCheck } from 'lucide-react';

interface Testimonial {
    id: number;
    name: string;
    location: string;
    vehicle: string;
    stars: number;
    text: string;
    timeAgo: string;
    verified: boolean;
}

const TESTIMONIALS: Testimonial[] = [
    {
        id: 1,
        name: 'Santiago',
        location: 'Tres Arroyos',
        vehicle: 'Toyota Hilux SRX',
        stars: 5,
        text: 'Viajé desde Tres Arroyos exclusivamente a buscar la camioneta. Todo lo pactado por WhatsApp se cumplió al pie de la letra. Muy serios y profesionales.',
        timeAgo: 'Hace 3 semanas',
        verified: true
    },
    {
        id: 2,
        name: 'Agustina',
        location: 'Necochea',
        vehicle: 'Chevrolet Cruze LTZ',
        stars: 5,
        text: 'Excelente experiencia. Muy amables, supieron escuchar lo que necesitaba y me consiguieron una unidad con poquísimos kilómetros. Feliz con mi compra.',
        timeAgo: 'Hace 1 mes',
        verified: true
    },
    {
        id: 3,
        name: 'Diego',
        location: 'Miramar',
        vehicle: 'Fiat Toro Volcano 4x4',
        stars: 5,
        text: 'Hice permuta llave por llave. En otras agencias me querían desvalorizar mi auto, pero acá me hicieron una oferta justa y cerramos la operación en el día.',
        timeAgo: 'Hace 1 mes',
        verified: true
    },
    {
        id: 4,
        name: 'Mariana',
        location: 'Lobería',
        vehicle: 'Volkswagen Taos Highline',
        stars: 5,
        text: 'Destaco la transparencia. Me mostraron el historial completo del auto y me asesoraron con toda la tranquilidad. La mejor agencia de la zona.',
        timeAgo: 'Hace 1 mes',
        verified: true
    },
    {
        id: 5,
        name: 'Gonzalo',
        location: 'Necochea',
        vehicle: 'Ford Ranger XLT',
        stars: 5,
        text: 'Es el tercer auto que compro con ellos a lo largo de los años. La calidad humana y la rapidez para resolver la documentación es insuperable.',
        timeAgo: 'Hace 2 meses',
        verified: true
    },
    {
        id: 6,
        name: 'Valeria',
        location: 'Balcarce',
        vehicle: 'Peugeot 208 Feline',
        stars: 5,
        text: 'Buscaba mi primer auto y me guiaron en cada paso. Muy buena predisposición para responder todas mis dudas. El auto me lo entregaron impecable.',
        timeAgo: 'Hace 2 meses',
        verified: true
    },
    {
        id: 7,
        name: 'Carlos',
        location: 'Quequén',
        vehicle: 'Toyota Corolla Cross',
        stars: 5,
        text: 'Excelente atención de Hernán y todo el equipo. Entrega puntual, vehículo en estado nuevo y gestoría impecable sin dolores de cabeza.',
        timeAgo: 'Hace 2 meses',
        verified: true
    },
    {
        id: 8,
        name: 'Lucía',
        location: 'Necochea',
        vehicle: 'Jeep Renegade Longitude',
        stars: 5,
        text: 'Compré a distancia coordinando todo por teléfono. Me mandaron videos detallados del auto y cuando fui a retirarlo estaba aún mejor de lo esperado.',
        timeAgo: 'Hace 2 meses',
        verified: true
    },
    {
        id: 9,
        name: 'Martín',
        location: 'Mar del Plata',
        vehicle: 'Volkswagen Amarok V6',
        stars: 5,
        text: 'Fui desde Mar del Plata por recomendación de un amigo y valió 100% la pena. Stock seleccionado de verdad y precios súper competitivos.',
        timeAgo: 'Hace 2 meses',
        verified: true
    },
    {
        id: 10,
        name: 'Paula',
        location: 'Necochea',
        vehicle: 'Ford Territory Titanium',
        stars: 5,
        text: 'Atención personalizada y muy respetuosa. Me tomaron mi usado a un precio excelente y la entrega del nuevo fue rapidísima.',
        timeAgo: 'Hace 2 meses',
        verified: true
    },
    {
        id: 11,
        name: 'Facundo',
        location: 'San Cayetano',
        vehicle: 'Toyota Hilux DX',
        stars: 5,
        text: 'Camioneta de trabajo impecable. Te dicen las cosas como son, sin vueltas ni sorpresas en el precio final. Totalmente recomendables.',
        timeAgo: 'Hace 3 meses',
        verified: true
    },
    {
        id: 12,
        name: 'Romina',
        location: 'Necochea',
        vehicle: 'Honda HR-V EXL',
        stars: 5,
        text: 'Súper conformes con la compra. El trámite de transferencia fue rápido y prolijo. Da gusto comprar en una agencia seria y con trayectoria.',
        timeAgo: 'Hace 3 meses',
        verified: true
    },
    {
        id: 13,
        name: 'Lucas',
        location: 'Necochea',
        vehicle: 'Chevrolet Tracker Premier',
        stars: 5,
        text: 'Muy buena tasación de mi vehículo anterior. En 48 horas ya tenía la transferencia lista y el auto nuevo en la cochera.',
        timeAgo: 'Hace 3 meses',
        verified: true
    },
    {
        id: 14,
        name: 'Florencia',
        location: 'Necochea',
        vehicle: 'Toyota Yaris XLS',
        stars: 5,
        text: 'La atención fue de primera. Me dieron facilidades y el auto me lo entregaron lavado, lustrado y listo para salir a la ruta. Súper agradecida.',
        timeAgo: 'Hace 3 meses',
        verified: true
    },
    {
        id: 15,
        name: 'Esteban',
        location: 'Quequén',
        vehicle: 'Nissan Frontier PRO-4X',
        stars: 5,
        text: 'Compré la Frontier para el campo. Trato directo, honesto y entrega inmediata. Cumplieron con cada detalle acordado sin demoras.',
        timeAgo: 'Hace 3 meses',
        verified: true
    },
    {
        id: 16,
        name: 'Matías',
        location: 'Necochea',
        vehicle: 'Audi Q5 Quattro',
        stars: 5,
        text: 'Buscaba una SUV premium en estado óptimo. El auto superó mis expectativas y el seguimiento postventa fue excelente. Grandes profesionales.',
        timeAgo: 'Hace 3 meses',
        verified: true
    },
    {
        id: 17,
        name: 'Julieta',
        location: 'Necochea',
        vehicle: 'Renault Duster Iconic',
        stars: 5,
        text: 'Agradezco a Hernán por el asesoramiento previo por la página web y a todo el personal en el local. Me sentí muy cómoda y segura en cada paso.',
        timeAgo: 'Hace 4 meses',
        verified: true
    },
    {
        id: 18,
        name: 'Joaquín',
        location: 'Lobería',
        vehicle: 'Volkswagen Golf TSI',
        stars: 5,
        text: 'El auto impecable, con todo el historial de services comprobable. Tienen una gran variedad de unidades seleccionadas de calidad indiscutible.',
        timeAgo: 'Hace 4 meses',
        verified: true
    },
    {
        id: 19,
        name: 'Federico',
        location: 'Necochea',
        vehicle: 'Mercedes-Benz C200',
        stars: 5,
        text: 'Atención ágil y ejecutiva. Se encargaron de toda la gestoría de transferencia sin que yo tuviera que preocuparme por ningún trámite.',
        timeAgo: 'Hace 4 meses',
        verified: true
    },
    {
        id: 20,
        name: 'Camila',
        location: 'San Cayetano',
        vehicle: 'Citroën C4 Cactus Shine',
        stars: 5,
        text: 'Hermosa experiencia en Special Cars. Me tomaron mi usado al instante y me facilitaron la entrega del nuevo. Muy agradecida con la atención recibida.',
        timeAgo: 'Hace 5 meses',
        verified: true
    }
];

export function TestimonialsSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [itemsPerPage, setItemsPerPage] = useState(2);
    const [isDesktop, setIsDesktop] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Swipe Touch Support
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    useEffect(() => {
        const handleResize = () => {
            if (typeof window === 'undefined') return;
            const width = window.innerWidth;
            setIsDesktop(width >= 992);
            if (width < 992) {
                setItemsPerPage(1);
            } else {
                setItemsPerPage(2);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = Math.max(0, TESTIMONIALS.length - itemsPerPage);

    // Auto-play suave cada 5 segundos
    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, maxIndex]);

    const handlePrev = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    };

    const handleNext = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        if (distance > 45) {
            handleNext();
        } else if (distance < -45) {
            handlePrev();
        }
        touchStartX.current = null;
        touchEndX.current = null;
    };

    const avatarGradients = [
        'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
        'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
        'linear-gradient(135deg, #059669 0%, #047857 100%)',
        'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
        'linear-gradient(135deg, #DB2777 0%, #BE185D 100%)',
        'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
        'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)'
    ];

    const getInitials = (name: string) => name.charAt(0).toUpperCase();

    return (
        <section 
            id="testimonios"
            style={{
                backgroundColor: '#0F172A',
                borderTop: '1px solid #1E293B',
                borderBottom: '1px solid #1E293B',
                padding: isDesktop ? '60px 24px' : '36px 16px 0 16px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Resplandor ambiental de fondo */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '20%',
                width: '700px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(234, 88, 12, 0.12) 0%, rgba(15, 23, 42, 0) 70%)',
                pointerEvents: 'none'
            }} />

            <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                
                {isDesktop ? (
                    /* =========================================================================
                       LAYOUT DESKTOP: 2 Columnas (Franco apuntando a la DERECHA)
                       ========================================================================= */
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '410px 1fr',
                        gap: 36,
                        alignItems: 'center'
                    }}>
                        {/* COLUMNA IZQUIERDA: Textos + Franco Apuntando a la derecha */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            position: 'relative',
                            maxWidth: 410
                        }}>
                            {/* Badge de Confianza */}
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 7,
                                backgroundColor: 'rgba(234, 88, 12, 0.15)',
                                border: '1px solid rgba(234, 88, 12, 0.35)',
                                color: '#FB923C',
                                padding: '6px 14px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: 0.6,
                                marginBottom: 12,
                                alignSelf: 'flex-start'
                            }}>
                                <ShieldCheck size={15} />
                                <span>Experiencias Reales • 4.9/5</span>
                            </div>

                            <h2 style={{
                                fontSize: 36,
                                fontWeight: 900,
                                letterSpacing: -0.5,
                                color: '#FFFFFF',
                                lineHeight: 1.15,
                                marginBottom: 12
                            }}>
                                Lo que dicen<br />nuestros clientes
                            </h2>

                            <p style={{
                                fontSize: 14.5,
                                color: '#94A3B8',
                                lineHeight: 1.6,
                                marginBottom: 14,
                                maxWidth: 390
                            }}>
                                Más de 15 años acompañando a familias y empresas de Necochea y la región en la compra, venta y permuta de sus vehículos.
                            </p>

                            {/* Puntuación General */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, color: '#FBBF24' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="#FBBF24" stroke="#FBBF24" />
                                ))}
                                <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 14.5, marginLeft: 5 }}>4.9 / 5</span>
                                <span style={{ color: '#64748B', fontSize: 12.5 }}>(+250 verificadas)</span>
                            </div>

                            {/* Imagen de Hernán Apuntando a la Derecha */}
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                maxWidth: 360,
                                marginTop: 4
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    width: 300,
                                    height: 300,
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(234, 88, 12, 0.18) 0%, transparent 70%)',
                                    zIndex: 1,
                                    pointerEvents: 'none'
                                }} />

                                <img
                                    src="/images/franco-pointing.png"
                                    alt="Hernán Asesor de Special Cars señalando testimonios"
                                    style={{
                                        width: '100%',
                                        maxWidth: 340,
                                        height: 'auto',
                                        display: 'block',
                                        position: 'relative',
                                        zIndex: 2,
                                        filter: 'drop-shadow(0 12px 26px rgba(0,0,0,0.35))'
                                    }}
                                />
                            </div>

                            {/* Controles de Navegación del Carrusel en Desktop */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
                                <button
                                    onClick={handlePrev}
                                    aria-label="Anterior testimonio"
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: '50%',
                                        backgroundColor: '#1E293B',
                                        color: '#FFFFFF',
                                        border: '1px solid #334155',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#EA580C';
                                        e.currentTarget.style.borderColor = '#EA580C';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1E293B';
                                        e.currentTarget.style.borderColor = '#334155';
                                    }}
                                >
                                    <ChevronLeft size={22} />
                                </button>

                                <button
                                    onClick={handleNext}
                                    aria-label="Siguiente testimonio"
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: '50%',
                                        backgroundColor: '#1E293B',
                                        color: '#FFFFFF',
                                        border: '1px solid #334155',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#EA580C';
                                        e.currentTarget.style.borderColor = '#EA580C';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#1E293B';
                                        e.currentTarget.style.borderColor = '#334155';
                                    }}
                                >
                                    <ChevronRight size={22} />
                                </button>

                                <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>
                                    {currentIndex + 1} de {maxIndex + 1}
                                </span>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: Carrusel de Testimonios */}
                        <div style={{ overflow: 'hidden', minWidth: 0 }}>
                            <div 
                                ref={containerRef}
                                style={{
                                    overflow: 'hidden',
                                    padding: '8px 0 16px 0'
                                }}
                            >
                                <div 
                                    style={{
                                        display: 'flex',
                                        gap: 20,
                                        transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
                                        transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
                                    }}
                                >
                                    {TESTIMONIALS.map((t, idx) => (
                                        <div
                                            key={t.id}
                                            style={{
                                                flex: `0 0 calc(${100 / itemsPerPage}% - ${(20 * (itemsPerPage - 1)) / itemsPerPage}px)`,
                                                backgroundColor: '#1E293B',
                                                borderRadius: 20,
                                                border: '1px solid #334155',
                                                padding: '24px 22px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                                position: 'relative',
                                                minHeight: 240
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute',
                                                top: 18,
                                                right: 20,
                                                color: 'rgba(234, 88, 12, 0.18)',
                                                pointerEvents: 'none'
                                            }}>
                                                <Quote size={38} />
                                            </div>

                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <div style={{ display: 'flex', gap: 3, color: '#FBBF24' }}>
                                                        {[...Array(t.stars)].map((_, i) => (
                                                            <Star key={i} size={15} fill="#FBBF24" stroke="#FBBF24" />
                                                        ))}
                                                    </div>
                                                    <span style={{ fontSize: 11.5, color: '#64748B', fontWeight: 500 }}>
                                                        {t.timeAgo}
                                                    </span>
                                                </div>

                                                <p style={{
                                                    fontSize: 14,
                                                    lineHeight: 1.6,
                                                    color: '#E2E8F0',
                                                    marginBottom: 18,
                                                    fontStyle: 'italic'
                                                }}>
                                                    &ldquo;{t.text}&rdquo;
                                                </p>
                                            </div>

                                            <div style={{ borderTop: '1px solid #334155', paddingTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 42,
                                                    height: 42,
                                                    borderRadius: '50%',
                                                    background: avatarGradients[idx % avatarGradients.length],
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 800,
                                                    fontSize: 15,
                                                    color: '#FFFFFF',
                                                    flexShrink: 0,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.35)'
                                                }}>
                                                    {getInitials(t.name)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: 14.5, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        <span>{t.name}</span>
                                                        <CheckCircle size={14} style={{ color: '#10B981' }} />
                                                    </div>
                                                    <div style={{ fontSize: 12, color: '#94A3B8' }}>
                                                        {t.location} • <strong style={{ color: '#FB923C' }}>{t.vehicle}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Dots de Progreso */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
                                {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setIsAutoPlaying(false);
                                            setCurrentIndex(i);
                                        }}
                                        aria-label={`Ir al testimonio ${i + 1}`}
                                        style={{
                                            width: i === currentIndex ? 24 : 7,
                                            height: 7,
                                            borderRadius: 4,
                                            backgroundColor: i === currentIndex ? '#EA580C' : '#334155',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            padding: 0
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* =========================================================================
                       LAYOUT MOBILE: 1 Testimonio COMPLETO por vez + Franco abajo a la izq
                       ========================================================================= */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* 1. ENCABEZADO MÓVIL + INDICADOR DE BARRAS ARRIBA */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                backgroundColor: 'rgba(234, 88, 12, 0.15)',
                                border: '1px solid rgba(234, 88, 12, 0.35)',
                                color: '#FB923C',
                                padding: '4px 12px',
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                marginBottom: 6
                            }}>
                                <ShieldCheck size={13} />
                                <span>Experiencias Reales • 4.9/5</span>
                            </div>

                            <h2 style={{
                                fontSize: 22,
                                fontWeight: 900,
                                letterSpacing: -0.5,
                                color: '#FFFFFF',
                                lineHeight: 1.2,
                                margin: '0 0 6px 0'
                            }}>
                                Lo que dicen nuestros clientes
                            </h2>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#FBBF24', marginBottom: 10 }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill="#FBBF24" stroke="#FBBF24" />
                                ))}
                                <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 13, marginLeft: 4 }}>4.9 / 5</span>
                                <span style={{ color: '#64748B', fontSize: 11 }}>(+250)</span>
                            </div>

                            {/* INDICADOR DE BARRAS / PROGRESS (ARRIBA) */}
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3.5, marginBottom: 8, overflowX: 'auto', padding: '2px 0' }}>
                                {TESTIMONIALS.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setIsAutoPlaying(false);
                                            setCurrentIndex(i);
                                        }}
                                        aria-label={`Testimonio ${i + 1}`}
                                        style={{
                                            width: i === currentIndex ? 16 : 4.5,
                                            height: 5,
                                            borderRadius: 3,
                                            backgroundColor: i === currentIndex ? '#EA580C' : '#334155',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.25s ease',
                                            padding: 0,
                                            flexShrink: 0
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 2. CARRUSEL DE TESTIMONIOS (1 SOLO COMPLETO POR SLIDE CON SWIPE TÁCTIL) */}
                        <div 
                            style={{ overflow: 'hidden', width: '100%', touchAction: 'pan-y' }}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            <div 
                                ref={containerRef}
                                style={{ overflow: 'hidden', width: '100%' }}
                            >
                                <div 
                                    style={{
                                        display: 'flex',
                                        transform: `translateX(-${currentIndex * 100}%)`,
                                        transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
                                    }}
                                >
                                    {TESTIMONIALS.map((t, idx) => (
                                        <div
                                            key={t.id}
                                            style={{
                                                flex: '0 0 100%',
                                                width: '100%',
                                                boxSizing: 'border-box',
                                                padding: '0 2px'
                                            }}
                                        >
                                            <div style={{
                                                backgroundColor: '#1E293B',
                                                borderRadius: 18,
                                                border: '1px solid #334155',
                                                padding: '18px 16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                                position: 'relative',
                                                minHeight: 180,
                                                boxSizing: 'border-box'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    right: 14,
                                                    color: 'rgba(234, 88, 12, 0.18)',
                                                    pointerEvents: 'none'
                                                }}>
                                                    <Quote size={28} />
                                                </div>

                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                        <div style={{ display: 'flex', gap: 3, color: '#FBBF24' }}>
                                                            {[...Array(t.stars)].map((_, i) => (
                                                                <Star key={i} size={13} fill="#FBBF24" stroke="#FBBF24" />
                                                            ))}
                                                        </div>
                                                        <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                                                            {t.timeAgo}
                                                        </span>
                                                    </div>

                                                    <p style={{
                                                        fontSize: 13.5,
                                                        lineHeight: 1.5,
                                                        color: '#E2E8F0',
                                                        marginBottom: 14,
                                                        fontStyle: 'italic'
                                                    }}>
                                                        &ldquo;{t.text}&rdquo;
                                                    </p>
                                                </div>

                                                <div style={{ borderTop: '1px solid #334155', paddingTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: '50%',
                                                        background: avatarGradients[idx % avatarGradients.length],
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 800,
                                                        fontSize: 13.5,
                                                        color: '#FFFFFF',
                                                        flexShrink: 0
                                                    }}>
                                                        {getInitials(t.name)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: 13, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <span>{t.name}</span>
                                                            <CheckCircle size={12} style={{ color: '#10B981' }} />
                                                        </div>
                                                        <div style={{ fontSize: 11, color: '#94A3B8' }}>
                                                            {t.location} • <strong style={{ color: '#FB923C' }}>{t.vehicle}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 3. IMAGEN TRANSPARENTE DEBAJO POSICIONADA A LA IZQUIERDA Y PEGADA A LOS TESTIMONIOS */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            width: '100%',
                            marginTop: -6,
                            paddingLeft: 2
                        }}>
                            <div style={{
                                position: 'relative',
                                display: 'inline-block'
                            }}>
                                <img
                                    src="/images/franco-pointing-up.png"
                                    alt="Hernán señalando hacia arriba a los testimonios"
                                    style={{
                                        width: '100%',
                                        maxWidth: 216,
                                        height: 'auto',
                                        display: 'block',
                                        position: 'relative',
                                        zIndex: 2,
                                        filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.5))'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
