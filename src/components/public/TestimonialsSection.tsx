'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle, ShieldCheck, ThumbsUp } from 'lucide-react';

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
        name: 'Martín',
        location: 'Necochea',
        vehicle: 'Audi A1 Sportback',
        stars: 5,
        text: 'Excelente atención de todo el equipo de Special Cars. Me entregaron el A1 en impecables condiciones y la transferencia se realizó en tiempo récord. 100% recomendables.',
        timeAgo: 'Hace 1 semana',
        verified: true
    },
    {
        id: 2,
        name: 'Gonzalo',
        location: 'Quequén',
        vehicle: 'Toyota Hilux 4x4 SRV',
        stars: 5,
        text: 'Entregué mi usado en parte de pago y me lo cotizaron muy bien, sin vueltas. Me llevé la Hilux con toda la documentación lista y garantizada. Da gusto comprar así.',
        timeAgo: 'Hace 2 semanas',
        verified: true
    },
    {
        id: 3,
        name: 'Valeria',
        location: 'Necochea',
        vehicle: 'Peugeot 208 Feline',
        stars: 5,
        text: 'Buscaba mi primer auto automático y Hernán y los chicos me asesoraron con total paciencia y transparencia. El auto está nuevo tal como me lo mostraron en la web.',
        timeAgo: 'Hace 2 semanas',
        verified: true
    },
    {
        id: 4,
        name: 'Santiago',
        location: 'Tres Arroyos',
        vehicle: 'Volkswagen Amarok V6',
        stars: 5,
        text: 'Viajé desde Tres Arroyos exclusivamente a buscar la camioneta. Todo lo pactado por WhatsApp se cumplió al pie de la letra. Muy serios y profesionales.',
        timeAgo: 'Hace 3 semanas',
        verified: true
    },
    {
        id: 5,
        name: 'Carolina',
        location: 'Lobería',
        vehicle: 'Jeep Renegade Sport',
        stars: 5,
        text: 'Hicimos la operación con una parte financiada y me facilitaron todo el trámite. En pocos días ya estaba disfrutando del vehículo. Muchas gracias por la calidez.',
        timeAgo: 'Hace 1 mes',
        verified: true
    },
    {
        id: 6,
        name: 'Facundo',
        location: 'Balcarce',
        vehicle: 'Ford Ranger XLT',
        stars: 5,
        text: 'Excelente concesionaria. El estado de los vehículos seleccionados es de otro nivel, realmente impecables. Cero sorpresas y muy buena atención postventa.',
        timeAgo: 'Hace 1 mes',
        verified: true
    },
    {
        id: 7,
        name: 'Marcos',
        location: 'Necochea',
        vehicle: 'Toyota Corolla Cross',
        stars: 5,
        text: 'Compré un 0 KM con ellos. Me asesoraron con los plazos de entrega y cumplieron exactamente con lo prometido. Impecable servicio y transparencia.',
        timeAgo: 'Hace 1 mes',
        verified: true
    },
    {
        id: 8,
        name: 'Mariana',
        location: 'San Cayetano',
        vehicle: 'Honda HR-V EXL',
        stars: 5,
        text: 'Súper conformes con el trato recibido. Fuimos a ver la camioneta un sábado a la mañana y nos explicaron cada detalle técnico. Transparencia total.',
        timeAgo: 'Hace 1 mes',
        verified: true
    },
    {
        id: 9,
        name: 'Ignacio',
        location: 'Mar del Plata',
        vehicle: 'BMW 320i M-Sport',
        stars: 5,
        text: 'Encontré la unidad en su web, les escribí y me pasaron fotos y videos detallados al instante. Al día siguiente fui a Necochea y me lo llevé. Nivel premium.',
        timeAgo: 'Hace 2 meses',
        verified: true
    },
    {
        id: 10,
        name: 'Luciano',
        location: 'Necochea',
        vehicle: 'Volkswagen Taos Highline',
        stars: 5,
        text: 'Segunda vez que cambio de auto en Special Cars. La tranquilidad que te dan con la parte legal y el estado mecánico de cada auto no tiene precio.',
        timeAgo: 'Hace 2 meses',
        verified: true
    },
    {
        id: 11,
        name: 'Agustina',
        location: 'Necochea',
        vehicle: 'Chevrolet Cruze LTZ',
        stars: 5,
        text: 'Excelente experiencia. Muy amables, supieron escuchar lo que necesitaba y me consiguieron una unidad con poquísimos kilómetros. Feliz con mi compra.',
        timeAgo: 'Hace 2 meses',
        verified: true
    },
    {
        id: 12,
        name: 'Diego',
        location: 'Miramar',
        vehicle: 'Fiat Toro Volcano 4x4',
        stars: 5,
        text: 'Hice permuta llave por llave. En otras agencias me querían desvalorizar mi auto, pero acá me hicieron una oferta justa y cerramos la operación en el día.',
        timeAgo: 'Hace 2 meses',
        verified: true
    },
    {
        id: 13,
        name: 'Pablo',
        location: 'Tandil',
        vehicle: 'Ford Territory Titanium',
        stars: 5,
        text: 'Muy buena predisposición para coordinar la visita y revisar el vehículo. Todo muy claro desde el primer minuto. Volvería a comprar sin dudarlo.',
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
    const containerRef = useRef<HTMLDivElement>(null);

    // Ajuste responsivo: en desktop mostramos 2 tarjetas para dar lugar armónico a Franco a la izquierda
    useEffect(() => {
        const updateItemsPerPage = () => {
            if (typeof window === 'undefined') return;
            if (window.innerWidth < 1024) {
                setItemsPerPage(1);
            } else {
                setItemsPerPage(2);
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
        return name.charAt(0).toUpperCase();
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
                left: '20%',
                width: '700px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(234, 88, 12, 0.12) 0%, rgba(15, 23, 42, 0) 70%)',
                pointerEvents: 'none'
            }} />

            <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                
                {/* Layout a 2 Columnas: Franco Apuntando (Izq) + Carrusel de Testimonios (Der) */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 36,
                    alignItems: 'center'
                }}>
                    
                    {/* COLUMNA IZQUIERDA: Textos + Franco Apuntando a la Derecha */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        {/* Badge de Confianza */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            backgroundColor: 'rgba(234, 88, 12, 0.15)',
                            border: '1px solid rgba(234, 88, 12, 0.35)',
                            color: '#FB923C',
                            padding: '6px 14px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: 0.8,
                            marginBottom: 14,
                            alignSelf: 'flex-start'
                        }}>
                            <ShieldCheck size={15} />
                            <span>Experiencias Reales • Calificación 4.9/5</span>
                        </div>

                        <h2 style={{
                            fontSize: 'clamp(26px, 3.2vw, 36px)',
                            fontWeight: 900,
                            letterSpacing: -0.5,
                            color: '#FFFFFF',
                            lineHeight: 1.15,
                            marginBottom: 12
                        }}>
                            Lo que dicen nuestros clientes
                        </h2>

                        <p style={{
                            fontSize: 'clamp(14px, 1.6vw, 15.5px)',
                            color: '#94A3B8',
                            lineHeight: 1.6,
                            marginBottom: 16
                        }}>
                            Más de 15 años acompañando a familias y empresas de Necochea y la región en la compra, venta y permuta de sus vehículos.
                        </p>

                        {/* Puntuación General */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, color: '#FBBF24' }}>
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={17} fill="#FBBF24" stroke="#FBBF24" />
                            ))}
                            <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 14.5, marginLeft: 6 }}>4.9 / 5</span>
                            <span style={{ color: '#64748B', fontSize: 12.5 }}>(+250 verificadas)</span>
                        </div>

                        {/* Contenedor Visual de Franco Apuntando con Badge Flotante */}
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            maxWidth: 380,
                            marginTop: 4
                        }}>
                            {/* Resplandor suave */}
                            <div style={{
                                position: 'absolute',
                                width: 260,
                                height: 260,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(234, 88, 12, 0.18) 0%, transparent 70%)',
                                zIndex: 1,
                                pointerEvents: 'none'
                            }} />

                            {/* Imagen de Hernán Apuntando a la Derecha */}
                            <img
                                src="/images/franco-pointing.png"
                                alt="Hernán Asesor de Special Cars señalando testimonios"
                                style={{
                                    width: '100%',
                                    maxWidth: 360,
                                    height: 'auto',
                                    display: 'block',
                                    position: 'relative',
                                    zIndex: 2,
                                    filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.35))'
                                }}
                            />

                            {/* Badge Flotante sobre Franco */}
                            <div style={{
                                position: 'absolute',
                                bottom: 12,
                                left: 10,
                                zIndex: 3,
                                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                                border: '1px solid rgba(234, 88, 12, 0.4)',
                                backdropFilter: 'blur(8px)',
                                color: '#FFFFFF',
                                padding: '8px 14px',
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
                            }}>
                                <ThumbsUp size={15} style={{ color: '#EA580C' }} />
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: 11.5, fontWeight: 800 }}>100% Satisfacción</div>
                                    <div style={{ fontSize: 10, color: '#94A3B8' }}>Garantía Special Cars</div>
                                </div>
                            </div>
                        </div>

                        {/* Controles de Navegación del Carrusel en Desktop/Tablet */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
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

                    {/* COLUMNA DERECHA: Carrusel de Testimonios Deslizables */}
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
                                            padding: '28px 24px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                            position: 'relative',
                                            minHeight: 260
                                        }}
                                    >
                                        {/* Comillas de Fondo */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 20,
                                            right: 22,
                                            color: 'rgba(234, 88, 12, 0.18)',
                                            pointerEvents: 'none'
                                        }}>
                                            <Quote size={42} />
                                        </div>

                                        <div>
                                            {/* Estrellas y Fecha */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                                <div style={{ display: 'flex', gap: 3, color: '#FBBF24' }}>
                                                    {[...Array(t.stars)].map((_, i) => (
                                                        <Star key={i} size={15} fill="#FBBF24" stroke="#FBBF24" />
                                                    ))}
                                                </div>
                                                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>
                                                    {t.timeAgo}
                                                </span>
                                            </div>

                                            {/* Texto del Testimonio */}
                                            <p style={{
                                                fontSize: 14.5,
                                                lineHeight: 1.65,
                                                color: '#E2E8F0',
                                                marginBottom: 24,
                                                fontStyle: 'italic'
                                            }}>
                                                &ldquo;{t.text}&rdquo;
                                            </p>
                                        </div>

                                        {/* Footer con Info del Cliente y Vehículo */}
                                        <div style={{ borderTop: '1px solid #334155', paddingTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{
                                                width: 46,
                                                height: 46,
                                                borderRadius: '50%',
                                                background: avatarGradients[idx % avatarGradients.length],
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 800,
                                                fontSize: 16,
                                                color: '#FFFFFF',
                                                flexShrink: 0,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.35)'
                                            }}>
                                                {getInitials(t.name)}
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ fontWeight: 800, fontSize: 15, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {t.name}
                                                    </span>
                                                    {t.verified && (
                                                        <CheckCircle size={15} style={{ color: '#22C55E', flexShrink: 0 }} title="Comprador Verificado" />
                                                    )}
                                                </div>
                                                <div style={{ fontSize: 12.5, color: '#94A3B8', marginTop: 2 }}>
                                                    {t.location} • <strong style={{ color: '#FB923C' }}>{t.vehicle}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Indicadores / Dots de Progreso */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 18 }}>
                            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setIsAutoPlaying(false);
                                        setCurrentIndex(i);
                                    }}
                                    aria-label={`Ir al grupo de testimonios ${i + 1}`}
                                    style={{
                                        width: i === currentIndex ? 28 : 8,
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
                </div>
            </div>
        </section>
    );
}
