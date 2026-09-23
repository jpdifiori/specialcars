'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { WantedVehicle, MatchResult } from '@/lib/types';
import { getSellerWantedMatches } from '@/lib/actions/seller';
import { formatARS } from '@/lib/utils/currency';
import { buildWhatsAppUrl } from '@/lib/utils/phone';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { X, Sparkles, CheckCircle2, Car, ExternalLink, Loader2, Phone } from 'lucide-react';

interface SellerMatchesModalProps {
    isOpen: boolean;
    wanted: WantedVehicle | null;
    onClose: () => void;
}

export function SellerMatchesModal({ isOpen, wanted, onClose }: SellerMatchesModalProps) {
    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState<MatchResult[]>([]);

    useEffect(() => {
        if (isOpen && wanted) {
            loadMatches(wanted.id);
        } else {
            setMatches([]);
        }
    }, [isOpen, wanted]);

    const loadMatches = async (wantedId: string) => {
        setLoading(true);
        try {
            const results = await getSellerWantedMatches(wantedId);
            setMatches(results || []);
        } catch (err) {
            console.error('Error loading matches:', err);
            setMatches([]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !wanted) return null;

    const handleSendMatchOffer = (m: MatchResult) => {
        if (!wanted.client?.phone || !m.vehicle) return;

        const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://specialcars.com.ar';
        const publicUrl = `${siteUrl}/vehiculos/${m.vehicle.slug || m.vehicle.id}`;

        const lines = [
            `Hola ${wanted.client.first_name || ''}, te escribo de *Special Cars* por el vehículo que estás buscando (${wanted.brand} ${wanted.model}).`,
            ``,
            `¡Tenemos una opción en la agencia que puede interesarte!`,
            `🚗 *${m.vehicle.brand} ${m.vehicle.model}* ${m.vehicle.version || ''} (${m.vehicle.year})`,
            `📍 *Kilometraje:* ${m.vehicle.mileage ? m.vehicle.mileage.toLocaleString('es-AR') + ' km' : '0 km'}`,
            `💰 *Precio de Venta:* ${formatARS(m.vehicle.sale_price)}`,
            ``,
            `📸 *Mirá las fotos acá:*`,
            publicUrl,
            ``,
            `¿Te gustaría pasar a verlo por el salón o que te pase más detalles?`
        ];

        const text = lines.join('\n');
        const url = buildWhatsAppUrl(wanted.client.whatsapp || wanted.client.phone, text);
        window.open(url, '_blank');
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                zIndex: 200,
                padding: '0 0 max(env(safe-area-inset-bottom), 0px) 0'
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                style={{
                    backgroundColor: '#111622',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    width: '100%',
                    maxWidth: 580,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: 20,
                    boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)'
                }}
            >
                {/* ENCABEZADO */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: 10,
                                backgroundColor: 'rgba(234, 88, 12, 0.2)',
                                border: '1px solid rgba(234, 88, 12, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FB923C'
                            }}
                        >
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                                Coincidencias en Stock
                            </h3>
                            <div style={{ fontSize: 12, color: '#94A3B8' }}>
                                Para: <strong style={{ color: '#FFFFFF' }}>{wanted.client?.first_name} {wanted.client?.last_name}</strong> • Busca {wanted.brand} {wanted.model}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            padding: 6,
                            cursor: 'pointer'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* CONTENIDO */}
                {loading ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: '#94A3B8' }}>
                        <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 10px', color: '#EA580C' }} />
                        <p style={{ fontSize: 13, margin: 0 }}>Analizando compatibilidad con el stock...</p>
                    </div>
                ) : matches.length === 0 ? (
                    <div
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: 14,
                            padding: '30px 20px',
                            textAlign: 'center'
                        }}
                    >
                        <Car size={36} style={{ margin: '0 auto 10px', color: '#64748B', opacity: 0.5 }} />
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                            Sin coincidencias directas en stock
                        </h4>
                        <p style={{ fontSize: 12.5, color: '#94A3B8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                            No tenemos un {wanted.brand} {wanted.model} disponible en este momento. Podés contactar al cliente por WhatsApp para confirmarle que estamos buscando su unidad.
                        </p>

                        {wanted.client?.phone && (
                            <a
                                href={buildWhatsAppUrl(
                                    wanted.client.whatsapp || wanted.client.phone,
                                    `Hola ${wanted.client.first_name}, te escribo de Special Cars por la ${wanted.brand} ${wanted.model} que estás buscando. ¿Cómo estás? Te comento que estamos activamente buscando opciones para vos.`
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    backgroundColor: '#25D366',
                                    color: '#FFFFFF',
                                    borderRadius: 10,
                                    padding: '10px 16px',
                                    fontSize: 13,
                                    fontWeight: 800,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    textDecoration: 'none'
                                }}
                            >
                                <WhatsAppIcon size={16} color="#FFFFFF" />
                                <span>Avisarle al Cliente por WhatsApp</span>
                            </a>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <CheckCircle2 size={14} />
                            <span>Se encontraron {matches.length} {matches.length === 1 ? 'unidad compatible' : 'unidades compatibles'}</span>
                        </div>

                        {matches.map((m) => {
                            if (!m.vehicle) return null;
                            const veh = m.vehicle;
                            const mainImg = veh.images?.find((img) => img.is_primary)?.url || veh.images?.[0]?.url;

                            return (
                                <div
                                    key={veh.id}
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: 14,
                                        padding: 12,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 10
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        {/* Foto */}
                                        <div
                                            style={{
                                                position: 'relative',
                                                width: 80,
                                                height: 70,
                                                borderRadius: 8,
                                                overflow: 'hidden',
                                                backgroundColor: '#05070B',
                                                flexShrink: 0
                                            }}
                                        >
                                            {mainImg ? (
                                                <Image src={mainImg} alt="Auto" fill sizes="80px" style={{ objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                                                    <Car size={24} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>
                                                    {veh.brand} {veh.model}
                                                </div>
                                                <span
                                                    style={{
                                                        fontSize: 10.5,
                                                        fontWeight: 900,
                                                        padding: '2px 6px',
                                                        borderRadius: 6,
                                                        backgroundColor: m.score >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                                        color: m.score >= 80 ? '#34D399' : '#FBBF24',
                                                        border: m.score >= 80 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)'
                                                    }}
                                                >
                                                    {m.score}% Match
                                                </span>
                                            </div>

                                            <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 2 }}>
                                                {veh.year} • {veh.mileage ? `${(veh.mileage / 1000).toFixed(0)}k km` : '0 km'}
                                            </div>

                                            <div style={{ fontSize: 15, fontWeight: 900, color: '#FB923C', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                                                {formatARS(veh.sale_price)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Puntos destacados de compatibilidad */}
                                    {m.highlights && m.highlights.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {m.highlights.map((h, idx) => (
                                                <span
                                                    key={idx}
                                                    style={{
                                                        fontSize: 11,
                                                        color: '#94A3B8',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                        padding: '2px 6px',
                                                        borderRadius: 4
                                                    }}
                                                >
                                                    ✓ {h}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* BOTÓN OFRECER POR WHATSAPP */}
                                    <button
                                        onClick={() => handleSendMatchOffer(m)}
                                        style={{
                                            backgroundColor: '#25D366',
                                            color: '#FFFFFF',
                                            border: 'none',
                                            borderRadius: 8,
                                            padding: '9px 12px',
                                            fontSize: 12.5,
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 6,
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                                        }}
                                    >
                                        <WhatsAppIcon size={15} color="#FFFFFF" />
                                        <span>Ofrecer este auto por WhatsApp</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
