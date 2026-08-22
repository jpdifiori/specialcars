'use client';

import { useState, useEffect } from 'react';
import { Vehicle } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';
import { buildWhatsAppMatchMessage } from '@/lib/utils/matching';
import { X, Send, Copy, Check, MessageCircle, Phone, User, ExternalLink, Sparkles } from 'lucide-react';

interface WhatsAppPreparationModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: {
        id: string;
        first_name: string;
        last_name: string;
        phone?: string | null;
        whatsapp?: string | null;
    };
    vehicle: Vehicle;
    wantedBrand?: string;
    wantedModel?: string;
    onMessageSent?: () => void;
}

export function WhatsAppPreparationModal({
    isOpen,
    onClose,
    client,
    vehicle,
    wantedBrand,
    wantedModel,
    onMessageSent
}: WhatsAppPreparationModalProps) {
    const [message, setMessage] = useState('');
    const [copied, setCopied] = useState(false);
    const [recipientNumber, setRecipientNumber] = useState('');

    useEffect(() => {
        if (isOpen && client && vehicle) {
            const rawPhone = client.whatsapp || client.phone || '';
            const cleaned = rawPhone.replace(/[^0-9]/g, '');
            // Si no tiene prefijo de país 549, lo agregamos para Argentina
            const formatted = cleaned.startsWith('549') 
                ? cleaned 
                : cleaned.startsWith('54') 
                    ? `549${cleaned.slice(2)}` 
                    : cleaned.length >= 10 
                        ? `549${cleaned}` 
                        : cleaned;

            setRecipientNumber(formatted);

            const initialText = buildWhatsAppMatchMessage({
                clientFirstName: client.first_name,
                advisorName: 'Hernán',
                wantedBrand: wantedBrand || vehicle.brand,
                wantedModel: wantedModel || vehicle.model,
                vehicle
            });

            setMessage(initialText);
            setCopied(false);
        }
    }, [isOpen, client, vehicle, wantedBrand, wantedModel]);

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            console.error('Error copying text:', err);
        }
    };

    const handleOpenWhatsApp = () => {
        if (!recipientNumber) {
            alert('El cliente no tiene un número de teléfono o WhatsApp válido cargado.');
            return;
        }

        const url = `https://wa.me/${recipientNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        
        if (onMessageSent) {
            onMessageSent();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
        }}>
            <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                width: '100%',
                maxWidth: 640,
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh',
                border: '1px solid #E2E8F0'
            }}>
                {/* Header */}
                <div style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#F8FAFC'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            backgroundColor: '#25D366',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.35)'
                        }}>
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                                Preparar WhatsApp para {client.first_name} {client.last_name}
                            </h3>
                            <div style={{ fontSize: 12, color: '#64748B' }}>
                                Mensaje personalizado firmado por Hernán • Special Cars
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: 6,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
                    
                    {/* Resumen del Vehículo Seleccionado */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#FFF7ED',
                        border: '1px solid #FFEDD5',
                        borderRadius: 12,
                        padding: '12px 16px'
                    }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Unidad en Stock
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A' }}>
                                {vehicle.brand} {vehicle.model} {vehicle.version || ''} ({vehicle.year})
                            </div>
                            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                                {vehicle.mileage === 0 ? '0 KM' : `${vehicle.mileage.toLocaleString('es-AR')} km`} • {vehicle.fuel_type} • {vehicle.transmission}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 18, fontWeight: 900, color: '#EA580C' }}>
                                {formatARS(vehicle.sale_price)}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748B' }}>
                                Código: {vehicle.stock_code}
                            </div>
                        </div>
                    </div>

                    {/* Número de Destino */}
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Número de WhatsApp del Cliente
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                flex: 1,
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #CBD5E1',
                                borderRadius: 10,
                                padding: '10px 14px'
                            }}>
                                <Phone size={16} style={{ color: '#64748B' }} />
                                <input
                                    type="text"
                                    value={recipientNumber}
                                    onChange={(e) => setRecipientNumber(e.target.value)}
                                    placeholder="Ej: 5492262574254"
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        outline: 'none',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: '#0F172A',
                                        width: '100%'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Textarea del Mensaje Editable */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                                Mensaje Prearmado (Podés editarlo antes de abrir WhatsApp)
                            </label>
                            <span style={{ fontSize: 11, color: '#64748B' }}>
                                {message.length} caracteres
                            </span>
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={8}
                            style={{
                                width: '100%',
                                padding: '14px',
                                fontSize: 13.5,
                                lineHeight: 1.6,
                                borderRadius: 12,
                                border: '1.5px solid #CBD5E1',
                                outline: 'none',
                                color: '#0F172A',
                                backgroundColor: '#FFFFFF',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#F8FAFC'
                }}>
                    <button
                        type="button"
                        onClick={handleCopy}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '10px 16px',
                            borderRadius: 10,
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#FFFFFF',
                            color: '#334155',
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {copied ? <Check size={16} style={{ color: '#22C55E' }} /> : <Copy size={16} />}
                        <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
                    </button>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 16px',
                                borderRadius: 10,
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                color: '#64748B',
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            onClick={handleOpenWhatsApp}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 22px',
                                borderRadius: 10,
                                border: 'none',
                                backgroundColor: '#25D366',
                                color: '#FFFFFF',
                                fontSize: 13.5,
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <MessageCircle size={17} />
                            <span>Abrir WhatsApp</span>
                            <ExternalLink size={14} style={{ opacity: 0.8 }} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
