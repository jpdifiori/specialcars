'use client';

import { useState, useEffect } from 'react';
import { SellerVehicle, createSellerReservation, getSellerClients, createSellerClient } from '@/lib/actions/seller';
import { Client } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';
import { X, Check, BookmarkCheck, User, Plus, AlertCircle, Loader2 } from 'lucide-react';

interface SellerQuickReservationModalProps {
    isOpen: boolean;
    vehicle: SellerVehicle | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function SellerQuickReservationModal({
    isOpen,
    vehicle,
    onClose,
    onSuccess
}: SellerQuickReservationModalProps) {
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [amount, setAmount] = useState('1000000');
    const [expiryHours, setExpiryHours] = useState('48');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modo creación rápida de cliente si no existe en la lista
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [newClientFirstName, setNewClientFirstName] = useState('');
    const [newClientLastName, setNewClientLastName] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadClients();
            setError(null);
            setIsCreatingClient(false);
        }
    }, [isOpen]);

    const loadClients = async () => {
        setLoadingClients(true);
        try {
            const list = await getSellerClients();
            setClients(list);
            if (list.length > 0 && !selectedClientId) {
                setSelectedClientId(list[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingClients(false);
        }
    };

    if (!isOpen || !vehicle) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            let clientId = selectedClientId;

            // Si está creando un cliente nuevo sobre la marcha
            if (isCreatingClient) {
                if (!newClientFirstName.trim() || !newClientLastName.trim() || !newClientPhone.trim()) {
                    setError('Por favor completá nombre, apellido y teléfono del cliente.');
                    setSubmitting(false);
                    return;
                }

                const newClientRes = await createSellerClient({
                    first_name: newClientFirstName.trim(),
                    last_name: newClientLastName.trim(),
                    phone: newClientPhone.trim()
                });

                if (!newClientRes.success || !newClientRes.client) {
                    setError(newClientRes.error || 'No se pudo registrar el nuevo cliente.');
                    setSubmitting(false);
                    return;
                }

                clientId = newClientRes.client.id;
            }

            if (!clientId) {
                setError('Seleccioná o registrá un cliente para la seña.');
                setSubmitting(false);
                return;
            }

            const numAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
            if (!numAmount || numAmount <= 0) {
                setError('El importe de seña debe ser mayor a 0.');
                setSubmitting(false);
                return;
            }

            // Calcular fecha de vencimiento
            const hours = parseInt(expiryHours, 10) || 48;
            const expiryDate = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

            const res = await createSellerReservation({
                client_id: clientId,
                vehicle_id: vehicle.id,
                amount: numAmount,
                expiry_date: expiryDate,
                notes: notes.trim() || undefined
            });

            if (!res.success) {
                setError(res.error || 'No se pudo registrar la seña.');
                return;
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al procesar la seña.');
        } finally {
            setSubmitting(false);
        }
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
                alignItems: 'flex-end', // Bottom-sheet en mobile
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
                    maxWidth: 540,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: 20,
                    boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                backgroundColor: '#EA580C',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF'
                            }}
                        >
                            <BookmarkCheck size={18} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                                Tomar Seña / Bloqueo
                            </h3>
                            <div style={{ fontSize: 12, color: '#94A3B8' }}>
                                {vehicle.brand} {vehicle.model} ({vehicle.year}) • {formatARS(vehicle.sale_price)}
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

                {error && (
                    <div
                        style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 8,
                            padding: '10px 12px',
                            color: '#FCA5A5',
                            fontSize: 12.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 14
                        }}
                    >
                        <AlertCircle size={15} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* CLIENTE */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <label style={{ fontSize: 12.5, fontWeight: 700, color: '#CBD5E1' }}>
                                Cliente Interesado
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsCreatingClient(!isCreatingClient)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#FB923C',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3
                                }}
                            >
                                <Plus size={13} />
                                <span>{isCreatingClient ? 'Elegir existente' : 'Nuevo cliente'}</span>
                            </button>
                        </div>

                        {isCreatingClient ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <input
                                        type="text"
                                        placeholder="Nombre *"
                                        value={newClientFirstName}
                                        onChange={(e) => setNewClientFirstName(e.target.value)}
                                        required
                                        style={{
                                            backgroundColor: '#0B0E14',
                                            border: '1px solid #334155',
                                            borderRadius: 6,
                                            padding: '8px 10px',
                                            color: '#FFFFFF',
                                            fontSize: 13
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Apellido *"
                                        value={newClientLastName}
                                        onChange={(e) => setNewClientLastName(e.target.value)}
                                        required
                                        style={{
                                            backgroundColor: '#0B0E14',
                                            border: '1px solid #334155',
                                            borderRadius: 6,
                                            padding: '8px 10px',
                                            color: '#FFFFFF',
                                            fontSize: 13
                                        }}
                                    />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="Celular / WhatsApp (ej: 2262551122) *"
                                    value={newClientPhone}
                                    onChange={(e) => setNewClientPhone(e.target.value)}
                                    required
                                    style={{
                                        backgroundColor: '#0B0E14',
                                        border: '1px solid #334155',
                                        borderRadius: 6,
                                        padding: '8px 10px',
                                        color: '#FFFFFF',
                                        fontSize: 13
                                    }}
                                />
                            </div>
                        ) : (
                            <select
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                style={{
                                    width: '100%',
                                    backgroundColor: '#0B0E14',
                                    border: '1px solid #334155',
                                    borderRadius: 8,
                                    padding: '10px 12px',
                                    color: '#FFFFFF',
                                    fontSize: 13.5
                                }}
                            >
                                {loadingClients && <option>Cargando clientes...</option>}
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.first_name} {c.last_name} ({c.phone || 'Sin tel'})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* MONTO DE SEÑA */}
                    <div>
                        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                            Importe de Seña (ARS)
                        </label>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                            {['500000', '1000000', '2000000'].map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setAmount(preset)}
                                    style={{
                                        flex: 1,
                                        padding: '6px 8px',
                                        borderRadius: 6,
                                        border: amount === preset ? '1px solid #EA580C' : '1px solid rgba(255, 255, 255, 0.1)',
                                        backgroundColor: amount === preset ? 'rgba(234, 88, 12, 0.2)' : '#0B0E14',
                                        color: amount === preset ? '#FB923C' : '#94A3B8',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {formatARS(preset)}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Monto en ARS"
                            required
                            style={{
                                width: '100%',
                                backgroundColor: '#0B0E14',
                                border: '1px solid #334155',
                                borderRadius: 8,
                                padding: '10px 12px',
                                color: '#F59E0B',
                                fontSize: 16,
                                fontWeight: 800,
                                fontFamily: 'var(--font-mono)'
                            }}
                        />
                    </div>

                    {/* VENCIMIENTO */}
                    <div>
                        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                            Plazo de Reserva
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                            {[
                                { label: '24 hs', val: '24' },
                                { label: '48 hs (Estándar)', val: '48' },
                                { label: '72 hs', val: '72' }
                            ].map((opt) => (
                                <button
                                    key={opt.val}
                                    type="button"
                                    onClick={() => setExpiryHours(opt.val)}
                                    style={{
                                        padding: '8px 6px',
                                        borderRadius: 6,
                                        border: expiryHours === opt.val ? '1px solid #EA580C' : '1px solid rgba(255, 255, 255, 0.1)',
                                        backgroundColor: expiryHours === opt.val ? 'rgba(234, 88, 12, 0.2)' : '#0B0E14',
                                        color: expiryHours === opt.val ? '#FB923C' : '#94A3B8',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* NOTAS */}
                    <div>
                        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                            Observaciones (opcional)
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: Seña en efectivo en salón, abona resto el viernes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            style={{
                                width: '100%',
                                backgroundColor: '#0B0E14',
                                border: '1px solid #334155',
                                borderRadius: 8,
                                padding: '9px 12px',
                                color: '#FFFFFF',
                                fontSize: 13
                            }}
                        />
                    </div>

                    {/* BOTÓN CONFIRMAR */}
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            width: '100%',
                            backgroundColor: '#EA580C',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '13px',
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 800,
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            marginTop: 6,
                            boxShadow: '0 4px 16px rgba(234, 88, 12, 0.4)'
                        }}
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Bloqueando vehículo...</span>
                            </>
                        ) : (
                            <>
                                <Check size={17} strokeWidth={2.5} />
                                <span>Confirmar Seña y Bloquear Auto</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
