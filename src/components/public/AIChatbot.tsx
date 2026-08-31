'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
    MessageSquare, 
    X, 
    Send, 
    Sparkles, 
    RotateCcw, 
    Bot, 
    User, 
    ChevronDown, 
    ExternalLink,
    Car,
    MapPin,
    ArrowRight,
    MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { sendMessageToAssistant } from '@/lib/actions/chat';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

const QUICK_QUESTIONS = [
    { label: '🚗 Autos disponibles', text: '¿Qué autos tienen disponibles en stock hoy?' },
    { label: '💰 Financiación y Permutas', text: '¿Qué opciones de financiación y toma de permuta tienen?' },
    { label: '📍 Ubicación y Horarios', text: '¿Dónde están ubicados y qué horarios de atención tienen?' },
    { label: '💬 Contactar a un vendedor', text: 'Quiero contactar a un vendedor por WhatsApp para más información' }
];

function isWhatsAppDerivation(text: string): boolean {
    const lower = text.toLowerCase();
    return (
        lower.includes('wa.me') ||
        lower.includes('whatsapp') ||
        lower.includes('financiaci') ||
        lower.includes('permuta') ||
        lower.includes('forma de pago') ||
        lower.includes('vendedor') ||
        lower.includes('asesor') ||
        lower.includes('cotiz') ||
        lower.includes('seña') ||
        lower.includes('reservar')
    );
}

export function AIChatbot({ 
    whatsappNumber = '5492262574254',
    agencyAddress = 'Calle 48 2350'
}: { 
    whatsappNumber?: string;
    agencyAddress?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: `¡Hola! 👋 Soy **Hernán**, de **Special Cars**. ¿Cómo estás?\n\nContame, ¿en qué te puedo ayudar?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [showBubbleTip, setShowBubbleTip] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setHasUnread(false);
            setShowBubbleTip(false);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 200);
        }
    }, [isOpen, messages]);

    // Ocultar el bubble tip después de exactamente 3 segundos en desktop y mobile
    useEffect(() => {
        const timer = setTimeout(() => setShowBubbleTip(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleSend = async (textToSend?: string) => {
        const userText = (textToSend || input).trim();
        if (!userText || isLoading) return;

        const userMsg: Message = {
            id: String(Date.now()),
            role: 'user',
            content: userText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setInput('');
        setIsLoading(true);

        try {
            const apiMessages = newHistory
                .filter(m => m.id !== 'welcome')
                .map(m => ({ role: m.role, content: m.content }));

            const res = await sendMessageToAssistant(apiMessages);

            const botMsg: Message = {
                id: String(Date.now() + 1),
                role: 'assistant',
                content: res.reply,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error('Error sending chat message:', err);
            setMessages(prev => [
                ...prev,
                {
                    id: String(Date.now() + 1),
                    role: 'assistant',
                    content: 'Ocurrió un error al procesar tu consulta. Podés escribirnos por WhatsApp al [+54 9 2262 57-4254](https://wa.me/' + whatsappNumber + ').',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setMessages([
            {
                id: 'welcome',
                role: 'assistant',
                content: `¡Hola! 👋 Soy **Hernán**, de **Special Cars**. ¿Cómo estás?\n\nContame, ¿en qué te puedo ayudar?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
        setInput('');
    };

    // Renderizador básico y seguro de markdown (negritas, viñetas, enlaces)
    const renderFormattedContent = (content: string) => {
        const lines = content.split('\n');
        return lines.map((line, idx) => {
            // Reemplazo de links markdown [Texto](url)
            const parts: React.ReactNode[] = [];
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            let lastIndex = 0;
            let match;

            while ((match = linkRegex.exec(line)) !== null) {
                if (match.index > lastIndex) {
                    parts.push(parseBoldText(line.substring(lastIndex, match.index), `${idx}-${lastIndex}`));
                }
                const linkText = match[1];
                const linkUrl = match[2];
                const isExternal = linkUrl.startsWith('http');

                parts.push(
                    isExternal ? (
                        <a
                            key={`${idx}-${match.index}`}
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#EA580C',
                                fontWeight: 700,
                                textDecoration: 'underline',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3
                            }}
                        >
                            <span>{linkText}</span>
                            <ExternalLink size={11} />
                        </a>
                    ) : (
                        <Link
                            key={`${idx}-${match.index}`}
                            href={linkUrl}
                            onClick={() => setIsOpen(false)}
                            style={{
                                color: '#EA580C',
                                fontWeight: 700,
                                textDecoration: 'underline',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3
                            }}
                        >
                            <span>{linkText}</span>
                            <ArrowRight size={11} />
                        </Link>
                    )
                );
                lastIndex = match.index + match[0].length;
            }

            if (lastIndex < line.length) {
                parts.push(parseBoldText(line.substring(lastIndex), `${idx}-${lastIndex}`));
            }

            return (
                <div key={idx} style={{ minHeight: line.trim() === '' ? 8 : undefined, marginBottom: 4 }}>
                    {parts}
                </div>
            );
        });
    };

    const parseBoldText = (text: string, keyPrefix: string): React.ReactNode => {
        const segments = text.split(/(\*\*[^*]+\*\*)/g);
        return segments.map((seg, i) => {
            if (seg.startsWith('**') && seg.endsWith('**')) {
                return <strong key={`${keyPrefix}-${i}`} style={{ color: '#0F172A', fontWeight: 700 }}>{seg.slice(2, -2)}</strong>;
            }
            return <span key={`${keyPrefix}-${i}`}>{seg}</span>;
        });
    };

    return (
        <>
            {/* TOOLTIP GLOBO DE DIÁLOGO / PROMPT DE CHAT */}
            {!isOpen && showBubbleTip && (
                <div
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); setShowBubbleTip(false); }}
                    style={{
                        position: 'fixed',
                        bottom: 'calc(104px + env(safe-area-inset-bottom, 0px))',
                        right: 'calc(20px + env(safe-area-inset-right, 0px))',
                        zIndex: 99998,
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        padding: '10px 18px',
                        borderRadius: 16,
                        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.2)',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        cursor: 'pointer',
                        maxWidth: 'calc(100vw - 48px)',
                        width: 'max-content',
                        animation: 'fadeIn 0.3s ease-out',
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent'
                    }}
                >
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid #EA580C',
                        backgroundColor: '#FFFFFF',
                        flexShrink: 0
                    }}>
                        <img 
                            src="/images/franco-avatar.jpg" 
                            alt="Hernán" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    </div>
                    <div style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                            ¡Hola! 👋 Soy Hernán
                        </div>
                        <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 600, lineHeight: 1.2, marginTop: 3 }}>
                            ¿Te asesoro con algún vehículo?
                        </div>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowBubbleTip(false); }} 
                        aria-label="Cerrar sugerencia"
                        style={{
                            marginLeft: 10,
                            color: '#94A3B8',
                            padding: 4,
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '50%'
                        }}
                    >
                        <X size={14} />
                    </button>
                    {/* Flechita del globo */}
                    <div className="speech-bubble-tail" />
                </div>
            )}

            {/* BOTÓN FLOTANTE TRIGGER (65px, Fondo Blanco, Borde Naranja, Efecto de Chat) */}
            <div 
                className="floating-chatbot-container"
                style={{ 
                    position: 'fixed', 
                    bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))', 
                    right: 'calc(20px + env(safe-area-inset-right, 0px))', 
                    zIndex: 99999,
                    touchAction: 'manipulation'
                }}
            >
                {!isOpen && <div className="chat-pulse-ring" />}
                <button
                    type="button"
                    onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        setIsOpen(prev => !prev); 
                    }}
                    onTouchEnd={(e) => {
                        e.stopPropagation();
                    }}
                    className="floating-chatbot-btn"
                    style={{
                        width: 65,
                        height: 65,
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        color: '#FFFFFF',
                        border: '3px solid #EA580C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 8px 25px rgba(234, 88, 12, 0.35), 0 4px 12px rgba(0,0,0,0.12)',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        padding: 0,
                        position: 'relative',
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent',
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                    }}
                    aria-label={isOpen ? 'Cerrar Asistente' : 'Hablar con Hernán (Asesor Virtual IA)'}
                    title={isOpen ? 'Cerrar Asistente' : 'Hablar con Hernán (Asesor Virtual IA)'}
                >
                    {isOpen ? (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            backgroundColor: '#0F172A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none'
                        }}>
                            <ChevronDown size={30} style={{ color: '#FFFFFF' }} />
                        </div>
                    ) : (
                        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', pointerEvents: 'none' }}>
                            <img 
                                src="/images/franco-avatar.jpg" 
                                alt="Hernán Asesor" 
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover', 
                                    display: 'block',
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none'
                                }} 
                            />
                        </div>
                    )}
                </button>
            </div>

            {/* VENTANA DEL CHATBOT */}
            {isOpen && (
                <div className="chatbot-window-container">
                    {/* CABECERA */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                        padding: '16px 20px',
                        paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                border: '2px solid #EA580C',
                                overflow: 'hidden',
                                flexShrink: 0,
                                position: 'relative'
                            }}>
                                <img 
                                    src="/images/franco-avatar.jpg" 
                                    alt="Hernán" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: -0.2 }}>Hernán</span>
                                    <span style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        backgroundColor: 'rgba(234, 88, 12, 0.25)',
                                        color: '#F97316',
                                        padding: '1px 6px',
                                        borderRadius: 10
                                    }}>Asesor</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#94A3B8' }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22C55E', display: 'inline-block' }} />
                                    <span>En línea • Special Cars</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                                type="button"
                                onClick={handleReset}
                                title="Reiniciar conversación"
                                style={{
                                    color: '#94A3B8',
                                    padding: '8px 10px',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    background: 'transparent',
                                    border: 'none',
                                    touchAction: 'manipulation',
                                    WebkitTapHighlightColor: 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <RotateCcw size={17} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                title="Cerrar"
                                style={{
                                    color: '#94A3B8',
                                    padding: '8px 10px',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    background: 'transparent',
                                    border: 'none',
                                    touchAction: 'manipulation',
                                    WebkitTapHighlightColor: 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* CUERPO DE MENSAJES */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px 18px',
                        backgroundColor: '#F8FAFC',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14
                    }}>
                        {messages.map((m) => {
                            const isUser = m.role === 'user';
                            return (
                                <div
                                    key={m.id}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isUser ? 'flex-end' : 'flex-start',
                                        maxWidth: '100%'
                                    }}
                                >
                                    <div style={{
                                        maxWidth: '85%',
                                        padding: '12px 16px',
                                        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        backgroundColor: isUser ? '#EA580C' : '#FFFFFF',
                                        color: isUser ? '#FFFFFF' : '#1E293B',
                                        fontSize: 13.5,
                                        lineHeight: 1.55,
                                        boxShadow: isUser 
                                            ? '0 4px 14px rgba(234, 88, 12, 0.25)' 
                                            : '0 2px 8px rgba(0,0,0,0.06)',
                                        border: isUser ? 'none' : '1px solid #E2E8F0',
                                        wordBreak: 'break-word'
                                    }}>
                                        {isUser ? m.content : renderFormattedContent(m.content)}
                                    </div>

                                    {/* Botón WhatsApp destacado para derivaciones comerciales */}
                                    {!isUser && isWhatsAppDerivation(m.content) && (
                                        <a
                                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, estoy en su sitio web y necesito mas información')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                marginTop: 8,
                                                maxWidth: '85%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 8,
                                                backgroundColor: '#25D366',
                                                color: '#FFFFFF',
                                                padding: '10px 16px',
                                                borderRadius: 12,
                                                fontSize: 13,
                                                fontWeight: 700,
                                                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                                                textDecoration: 'none',
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.backgroundColor = '#22C55E'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.backgroundColor = '#25D366'; }}
                                        >
                                            <MessageCircle size={18} />
                                            <span>Enviar mensaje al vendedor</span>
                                        </a>
                                    )}

                                    <span style={{ fontSize: 10, color: '#94A3B8', marginTop: 3, padding: '0 4px' }}>
                                        {m.timestamp}
                                    </span>
                                </div>
                            );
                        })}

                        {/* Indicador de escritura animado */}
                        {isLoading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: '#FFFFFF', padding: '10px 16px', borderRadius: '18px 18px 18px 4px', border: '1px solid #E2E8F0' }}>
                                <img 
                                    src="/images/franco-avatar.jpg" 
                                    alt="Hernán" 
                                    style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} 
                                />
                                <span style={{ fontSize: 12, color: '#64748B' }}>Hernán está escribiendo...</span>
                                <div style={{ display: 'flex', gap: 3, marginLeft: 2 }}>
                                    <span className="dot-pulse" style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#EA580C' }} />
                                    <span className="dot-pulse" style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#EA580C', animationDelay: '0.2s' }} />
                                    <span className="dot-pulse" style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#EA580C', animationDelay: '0.4s' }} />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* BOTONES DE PREGUNTAS RÁPIDAS */}
                    {messages.length <= 2 && (
                        <div style={{
                            padding: '10px 14px',
                            backgroundColor: '#FFFFFF',
                            borderTop: '1px solid #F1F5F9',
                            display: 'flex',
                            gap: 6,
                            overflowX: 'auto',
                            whiteSpace: 'nowrap'
                        }}>
                            {QUICK_QUESTIONS.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(q.text)}
                                    disabled={isLoading}
                                    style={{
                                        fontSize: 11.5,
                                        fontWeight: 600,
                                        color: '#334155',
                                        backgroundColor: '#F1F5F9',
                                        border: '1px solid #E2E8F0',
                                        padding: '6px 12px',
                                        borderRadius: 20,
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#EA580C';
                                        e.currentTarget.style.color = '#FFFFFF';
                                        e.currentTarget.style.borderColor = '#EA580C';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#F1F5F9';
                                        e.currentTarget.style.color = '#334155';
                                        e.currentTarget.style.borderColor = '#E2E8F0';
                                    }}
                                >
                                    {q.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* INPUT INFERIOR */}
                    <div style={{
                        padding: '12px 14px',
                        backgroundColor: '#FFFFFF',
                        borderTop: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexShrink: 0
                    }}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Escribile a Hernán tu consulta..."
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                fontSize: 16,
                                borderRadius: 12,
                                border: '1px solid #CBD5E1',
                                outline: 'none',
                                color: '#0F172A',
                                backgroundColor: '#F8FAFC'
                            }}
                        />

                        <button
                            type="button"
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 12,
                                backgroundColor: input.trim() && !isLoading ? '#EA580C' : '#E2E8F0',
                                color: '#FFFFFF',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                                transition: 'all 0.2s',
                                flexShrink: 0,
                                touchAction: 'manipulation',
                                WebkitTapHighlightColor: 'transparent'
                            }}
                        >
                            <Send size={18} style={{ transform: 'translateX(1px)' }} />
                        </button>
                    </div>

                    <div style={{
                        fontSize: 10,
                        color: '#94A3B8',
                        textAlign: 'center',
                        padding: '4px 8px calc(8px + env(safe-area-inset-bottom, 0px))',
                        backgroundColor: '#FFFFFF',
                        flexShrink: 0
                    }}>
                        Potenciado por DeepSeek IA • Special Cars
                    </div>
                </div>
            )}
        </>
    );
}
