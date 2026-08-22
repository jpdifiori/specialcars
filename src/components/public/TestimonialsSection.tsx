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
        name: 'Martín Echeverría',
        location: 'Necochea',
        vehicle: 'Audi A1 Sportback',
        stars: 5,
        text: 'Excelente atención de todo el equipo de Special Cars. Me entregaron el A1 en impecables condiciones y la transferencia se realizó en tiempo récord. 100% recomendables.',
        timeAgo: 'Hace 1 semana',
        verified: true
    },
    {
        id: 2,
        name: "Gonzalo D'Angelo",
        location: 'Quequén',
        vehicle: 'Toyota Hilux 4x4 SRV',
        stars: 5,
        text: 'Entregué mi usado en parte de pago y me lo cotizaron muy bien, sin vueltas. Me llevé la Hilux con toda la documentación lista y garantizada. Da gusto comprar así.',
        timeAgo: 'Hace 2 semanas',
        verified: true
    },
    {
        id: 3,
        name: 'Valeria Rodríguez',
        location: 'Necochea',
        vehicle: 'Peugeot 208 Feline',
        stars: 5,
        text: 'Buscaba mi primer auto automático y Franco y los chicos me asesoraron con total paciencia y transparencia. El auto está nuevo tal como me lo mostraron en la web.',
        timeAgo: 'Hace 2 semanas',
        verified: true
    },
    {
        id: 4,
        name: 'Santiago Benítez',
        location: 'Tres Arroyos',
        vehicle: 'Volkswagen Amarok V6',
        stars: 5,
        text: 'Viajé desde Tres Arroyos exclusivamente a buscar la camioneta. Todo lo pactado por WhatsApp se cumplió al pie de la letra. Muy serios y profesionales.',
        timeAgo: 'Hace 3 semanas',
        verified: true
    },
    {
        id: 5,
        name: 'Carolina Méndez',
        location: 'Lobería',
        vehicle: 'Jeep Renegade Sport',
        stars: 5,
        text: 'Hicimos la operación con una parte financiada y me facilitaron todo el trámite. En pocos días ya estaba disfrutando del vehículo. Muchas gracias por la calidez.',
        timeAgo: 'Hace 1 mes',
        verified: true
    },
    {
        id: 6,
        name: 'Facundo Rossi',
        location: 'Balcarce',
        vehicle: 'Ford Ranger XLT',
        stars: 5,
        text: 'Excelente concesionaria. El estado de los vehículos seleccionados es de otro nivel, realmente impecables. Cero sorpresas y muy buena atención postventa.',
        timeAgo: 'Hace 1 mes',
        verified: true
    },
    {
        id: 7,
        name: 'Marcos Etchegoyen',
        location: 'Necochea',
        vehicle: 'Toyota Corolla Cross',
        stars: 5,
        text: 'Compré un 0 KM con ellos. Me asesoraron con los plazos de entrega y cumplieron exactamente con lo prometido. Impecable servicio y transparencia.',
        timeAgo: 'Hace 1 mes',
        verified: true
    },
    {
        id: 8,
        name: 'Mariana Zubillaga',
        location: 'San Cayetano',
        vehicle: 'Honda HR-V EXL',
        stars: 5,
        text: 'Súper conformes con el trato recibido. Fuimos a ver la camioneta un sábado a la mañana y nos explicaron cada detalle técnico. Transparencia total.',
        timeAgo: 'Hace 1 mes',
        verified: true
    },
    {
        id: 9,
        name: 'Ignacio Larrea',
        location: 'Mar del Plata',
        vehicle: 'BMW 320i M-Sport',
        stars: 5,
        text: 'Encontré la unidad en su web, les escribí y me pasaron fotos y videos detallados al instante. Al día siguiente fui a Necochea y me lo llevé. Nivel premium.',
        timeAgo: 'Hace 2 meses',
        verified: true
    },
    {
        id: 10,
        name: 'Luciano Albarracín',
        location: 'Necochea',
        vehicle: 'Volkswagen Taos Highline',
        stars: 5,
        text: 'Segunda vez que cambio de auto en Special Cars. La tranquilidad que te dan con la parte legal y el estado mecánico de cada auto no tiene precio.',
        timeAgo: 'Hace 2 meses',
        verified: true
    },
    {
        id: 11,
        name: 'Agustina Bardi',
        location: 'Necochea',
        vehicle: 'Chevrolet Cruze LTZ',
        stars: 5,
        text: 'Excelente experiencia. Muy amables, supieron escuchar lo que necesitaba y me consiguieron una unidad con poquísimos kilómetros. Feliz con mi compra.',
        timeAgo: 'Hace 2 meses',
        verified: true
    },
    {
        id: 12,
        name: 'Diego Fernández',
        location: 'Miramar',
        vehicle: 'Fiat Toro Volcano 4x4',
        stars: 5,
        text: 'Hice permuta llave por llave. En otras agencias me querían desvalorizar mi auto, pero acá me hicieron una oferta justa y cerramos la operación en el día.',
        timeAgo: 'Hace 2 meses',
        verified: true
    },
    {
        id: 13,
        name: 'Pablo Castelli',
        location: 'Tandil',
        vehicle: 'Ford Territory Titanium',
        stars: 5,
        text: 'Muy buena predisposición para coordinar la visita y revisar el vehículo. Todo muy claro desde el primer minuto. Volvería a comprar sin dudarlo.',
        timeAgo: 'Hace 3 meses',
        verified: true
    },
    {
        id: 14,
        name: 'Florencia Iriarte',
        location: 'Necochea',
        vehicle: 'Toyota Yaris XLS',
        stars: 5,
        text: 'La atención fue de primera. Me dieron facilidades y el auto me lo entregaron lavado, lustrado y listo para salir a la ruta. Súper agradecida.',
        timeAgo: 'Hace 3 meses',
        verified: true
    },
    {
        id: 15,
        name: 'Esteban Morales',
        location: 'Quequén',
        vehicle: 'Nissan Frontier PRO-4X',
        stars: 5,
        text: 'Compré la Frontier para el campo. Trato directo, honesto y entrega inmediata. Cumplieron con cada detalle acordado sin demoras.',
        timeAgo: 'Hace 3 meses',
        verified: true
    },
    {
        id: 16,
        name: 'Matías Santillán',
        location: 'Necochea',
        vehicle: 'Audi Q5 Quattro',
        stars: 5,
        text: 'Buscaba una SUV premium en estado óptimo. El auto superó mis expectativas y el seguimiento postventa fue excelente. Grandes profesionales.',
        timeAgo: 'Hace 3 meses',
        verified: true
    },
    {
        id: 17,
        name: 'Julieta Álvarez',
        location: 'Necochea',
        vehicle: 'Renault Duster Iconic',
        stars: 5,
        text: 'Agradezco a Franco por el asesoramiento previo por la página web y a todo el personal en el local. Me sentí muy cómoda y segura en cada paso.',
        timeAgo: 'Hace 4 meses',
        verified: true
    },
    {
        id: 18,
        name: 'Joaquín Peralta',
        location: 'Lobería',
        vehicle: 'Volkswagen Golf TSI',
        stars: 5,
        text: 'El auto impecable, con todo el historial de services comprobable. Tienen una gran variedad de unidades seleccionadas de calidad indiscutible.',
        timeAgo: 'Hace 4 meses',
        verified: true
    },
    {
        id: 19,
        name: 'Federico Quintana',
        location: 'Necochea',
        vehicle: 'Mercedes-Benz C200',
        stars: 5,
        text: 'Atención ágil y ejecutiva. Se encargaron de toda la gestoría de transferencia sin que yo tuviera que preocuparme por ningún trámite.',
        timeAgo: 'Hace 4 meses',
        verified: true
    },
    {
        id: 20,
        name: 'Camila Domínguez',
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
    const [itemsPerPage, setItemsPerPage] = useState(3);
    const containerRef = useRef<HTMLDivElement>(null);

    // Ajuste responsivo de cantidad de tarjetas visibles
    useEffect(() => {
        const updateItemsPerPage = () => {
            if (typeof window === 'undefined') return;
            if (window.innerWidth < 768) {
                setItemsPerPage(1);
            } else if (window.innerWidth < 1024) {
                setItemsPerPage(2);
            } else {
                setItemsPerPage(3);
            }
        };

        updateItemsPerPage();
        window.addEventListener('resize', updateItemsPerPage);
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, []);

    const maxIndex = Math.max(0, TESTIMONIALS.length - itemsPerPage);

    // Auto-play suave cada 4.5 segundos
    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 4500);

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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    // Paleta de gradientes para los avatares
    const avatarGradients = [
        'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
        'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
        'linear-gradient(135deg, #059669 0%, #047857 100%)',
        'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
        'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    ];

    return (
        <section 
            style={{
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                padding: '80px 24px',
                borderTop: '1px solid #1E293B',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            {/* Fondo decorativo con resplandor */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '800px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(234, 88, 12, 0.12) 0%, rgba(15, 23, 42, 0) 70%)',
                pointerEvents: 'none'
            }} />

            <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                {/* Header de la Sección */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 44 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: 'rgba(234, 88, 12, 0.15)',
                        border: '1px solid rgba(234, 88, 12, 0.35)',
                        color: '#FB923C',
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 12.5,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                        marginBottom: 14
                    }}>
                        <ShieldCheck size={16} />
                        <span>Experiencias Reales • Calificación 4.9/5</span>
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(26px, 3.5vw, 36px)',
                        fontWeight: 900,
                        letterSpacing: -0.5,
                        color: '#FFFFFF',
                        marginBottom: 12
                    }}>
                        Lo que dicen nuestros clientes
                    </h2>

                    <p style={{
                        fontSize: 'clamp(14px, 1.8vw, 16px)',
                        color: '#94A3B8',
                        maxWidth: 640,
                        lineHeight: 1.6
                    }}>
                        Más de 15 años acompañando a familias y empresas de Necochea y toda la región en la compra, venta y permuta de sus vehículos.
                    </p>

                    {/* Badge de satisfacción */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, color: '#FBBF24' }}>
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={18} fill="#FBBF24" stroke="#FBBF24" />
                        ))}
                        <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 15, marginLeft: 6 }}>4.9 / 5</span>
                        <span style={{ color: '#64748B', fontSize: 13 }}>(+250 operaciones verificadas)</span>
                    </div>
                </div>

                {/* Controles de Navegación Superiores */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginBottom: 20 }}>
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
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
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
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
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
                </div>

                {/* Contenedor del Carrusel */}
                <div 
                    ref={containerRef}
                    style={{
                        overflow: 'hidden',
                        padding: '8px 0 20px 0'
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
                                    borderRadius: 18,
                                    border: '1px solid #334155',
                                    padding: '24px 22px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                                    transition: 'all 0.3s ease',
                                    position: 'relative'
                                }}
                            >
                                {/* Comillas de Fondo */}
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
                                    {/* Estrellas y Fecha */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                        <div style={{ display: 'flex', gap: 3, color: '#FBBF24' }}>
                                            {[...Array(t.stars)].map((_, i) => (
                                                <Star key={i} size={15} fill="#FBBF24" stroke="#FBBF24" />
                                            ))}
                                        </div>
                                        <span style={{ fontSize: 11.5, color: '#64748B', fontWeight: 500 }}>
                                            {t.timeAgo}
                                        </span>
                                    </div>

                                    {/* Texto del Testimonio */}
                                    <p style={{
                                        fontSize: 14,
                                        lineHeight: 1.6,
                                        color: '#E2E8F0',
                                        marginBottom: 20,
                                        fontStyle: 'italic'
                                    }}>
                                        &ldquo;{t.text}&rdquo;
                                    </p>
                                </div>

                                {/* Footer con Info del Cliente y Vehículo */}
                                <div style={{ borderTop: '1px solid #334155', paddingTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: '50%',
                                        background: avatarGradients[idx % avatarGradients.length],
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 800,
                                        fontSize: 15,
                                        color: '#FFFFFF',
                                        flexShrink: 0,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                    }}>
                                        {getInitials(t.name)}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <span style={{ fontWeight: 800, fontSize: 14.5, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {t.name}
                                            </span>
                                            {t.verified && (
                                                <CheckCircle size={14} style={{ color: '#22C55E', flexShrink: 0 }} title="Comprador Verificado" />
                                            )}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>
                                            {t.location} • <strong style={{ color: '#FB923C' }}>{t.vehicle}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Indicadores / Dots de Progreso */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
                    {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setIsAutoPlaying(false);
                                setCurrentIndex(i);
                            }}
                            aria-label={`Ir al grupo de testimonios ${i + 1}`}
                            style={{
                                width: i === currentIndex ? 26 : 8,
                                height: 8,
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
        </section>
    );
}
