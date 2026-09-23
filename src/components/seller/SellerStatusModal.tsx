'use client';

import { useState, useEffect } from 'react';
import { 
    WantedVehicle, 
    WantedVehicleStatus, 
    WantedVehicleCancellationReason 
} from '@/lib/types';
import { updateWantedVehicleStatus } from '@/lib/actions/wanted-vehicles';
import { 
    X, 
    Check, 
    Loader2, 
    Search, 
    MessageSquare, 
    Car, 
    CheckCircle2, 
    XCircle,
    Clock,
    AlertCircle
} from 'lucide-react';

interface SellerStatusModalProps {
    wanted: WantedVehicle | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdated: (updated: WantedVehicle) => void;
}

const STATUS_CONFIG: {
    status: WantedVehicleStatus;
    label: string;
    sublabel: string;
    icon: typeof Search;
    color: string;
    bgColor: string;
    borderColor: string;
}[] = [
    {
        status: 'SEARCHING',
        label: 'Buscando (Activo)',
        sublabel: 'Búsqueda abierta, sin contactar aún',
        icon: Search,
        color: '#60A5FA',
        bgColor: 'rgba(59, 130, 246, 0.12)',
        borderColor: 'rgba(59, 130, 246, 0.3)'
    },
    {
        status: 'CONTACTED',
        label: 'Contactado',
        sublabel: 'Se le escribió o habló (guarda fecha de hoy)',
        icon: MessageSquare,
        color: '#FBBF24',
        bgColor: 'rgba(251, 191, 36, 0.12)',
        borderColor: 'rgba(251, 191, 36, 0.3)'
    },
    {
        status: 'FOUND',
        label: 'Auto Ofrecido / Negociando',
        sublabel: 'Se le presentó opción o viene al salón',
        icon: Car,
        color: '#A78BFA',
        bgColor: 'rgba(167, 139, 250, 0.12)',
        borderColor: 'rgba(167, 139, 250, 0.3)'
    },
    {
        status: 'CLOSED',
        label: 'Cerrado (Compró)',
        sublabel: 'Operación concretada con éxito',
        icon: CheckCircle2,
        color: '#34D399',
        bgColor: 'rgba(52, 211, 153, 0.12)',
        borderColor: 'rgba(52, 211, 153, 0.3)'
    },
    {
        status: 'CANCELLED',
        label: 'Ya no busca / Descartado',
        sublabel: 'Compró en otro lado, desistió o cambió ppto.',
        icon: XCircle,
        color: '#F87171',
        bgColor: 'rgba(248, 113, 113, 0.12)',
        borderColor: 'rgba(248, 113, 113, 0.3)'
    }
];

const CANCELLATION_REASONS: { id: WantedVehicleCancellationReason; label: string }[] = [
    { id: 'BOUGHT_ELSEWHERE', label: 'Compró en otro lado' },
    { id: 'DECIDED_NOT_TO_CHANGE', label: 'Ya no cambia el auto' },
    { id: 'BUDGET_CHANGED', label: 'Cambió su presupuesto' },
    { id: 'FOUND_WITH_US', label: 'Compró con nosotros' },
    { id: 'OTHER', label: 'Otro motivo' }
];

export function SellerStatusModal({
    wanted,
    isOpen,
    onClose,
    onStatusUpdated
}: SellerStatusModalProps) {
    const [selectedStatus, setSelectedStatus] = useState<WantedVehicleStatus>('SEARCHING');
    const [cancellationReason, setCancellationReason] = useState<WantedVehicleCancellationReason>('BOUGHT_ELSEWHERE');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (wanted) {
            setSelectedStatus(wanted.status);
            setCancellationReason(wanted.cancellation_reason || 'BOUGHT_ELSEWHERE');
            setNote('');
            setError(null);
        }
    }, [wanted]);

    if (!isOpen || !wanted) return null;

    const clientName = wanted.client 
        ? `${wanted.client.first_name} ${wanted.client.last_name}` 
        : 'Cliente';

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        try {
            const isContactedOrAdvancing = selectedStatus === 'CONTACTED' || selectedStatus === 'FOUND';
            const res = await updateWantedVehicleStatus(wanted.id, selectedStatus, {
                cancellation_reason: selectedStatus === 'CANCELLED' ? cancellationReason : null,
                notes: note.trim() ? `${wanted.notes || ''}\n[${new Date().toLocaleDateString('es-AR')} - Salón]: ${note.trim()}`.trim() : wanted.notes,
                touchLastContact: isContactedOrAdvancing || undefined
            });

            if (!res.success) {
                throw new Error(res.error || 'Error al actualizar estado.');
            }

            if (res.data) {
                onStatusUpdated(res.data);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al actualizar estado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                padding: '0 0 max(env(safe-area-inset-bottom), 10px) 0'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: '#111622',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderTopLeftRadius: 22,
                    borderTopRightRadius: 22,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    width: '100%',
                    maxWidth: 520,
                    maxHeight: '92vh',
                    overflowY: 'auto',
                    boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Tirador táctil móvil */}
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4 }}>
                    <div style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                </div>

                {/* HEADER */}
                <div
                    style={{
                        padding: '12px 18px 14px 18px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <div>
                        <div style={{ fontSize: 10.5, fontWeight: 800, color: '#FB923C', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                            Gestionar Estado • {wanted.code}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', marginTop: 2 }}>
                            {wanted.brand} {wanted.model}
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8' }}>
                            Cliente: <strong style={{ color: '#E2E8F0' }}>{clientName}</strong>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: 'none',
                            color: '#94A3B8',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* CONTENIDO */}
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {error && (
                        <div
                            style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: 10,
                                padding: '10px 12px',
                                color: '#F87171',
                                fontSize: 12.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}
                        >
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* SELECTOR DE ESTADOS */}
                    <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                            Nuevo Estado
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {STATUS_CONFIG.map((cfg) => {
                                const isSelected = selectedStatus === cfg.status;
                                const Icon = cfg.icon;

                                return (
                                    <button
                                        key={cfg.status}
                                        type="button"
                                        onClick={() => setSelectedStatus(cfg.status)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '10px 12px',
                                            borderRadius: 12,
                                            border: isSelected ? `2px solid ${cfg.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                                            backgroundColor: isSelected ? cfg.bgColor : 'rgba(255, 255, 255, 0.02)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div
                                                style={{
                                                    width: 34,
                                                    height: 34,
                                                    borderRadius: 10,
                                                    backgroundColor: isSelected ? cfg.color : 'rgba(255, 255, 255, 0.05)',
                                                    color: isSelected ? '#0B0E14' : cfg.color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}
                                            >
                                                <Icon size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13.5, fontWeight: 800, color: isSelected ? '#FFFFFF' : '#CBD5E1' }}>
                                                    {cfg.label}
                                                </div>
                                                <div style={{ fontSize: 11, color: isSelected ? '#E2E8F0' : '#64748B' }}>
                                                    {cfg.sublabel}
                                                </div>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div style={{ color: cfg.color, flexShrink: 0 }}>
                                                <Check size={18} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* SI SELECCIONÓ CANCELADO: MOTIVO */}
                    {selectedStatus === 'CANCELLED' && (
                        <div
                            style={{
                                backgroundColor: 'rgba(248, 113, 113, 0.08)',
                                border: '1px solid rgba(248, 113, 113, 0.25)',
                                borderRadius: 12,
                                padding: 12
                            }}
                        >
                            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#F87171', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                                Motivo de Cierre / Descarte
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {CANCELLATION_REASONS.map((r) => {
                                    const isSel = cancellationReason === r.id;
                                    return (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => setCancellationReason(r.id)}
                                            style={{
                                                padding: '6px 11px',
                                                borderRadius: 18,
                                                fontSize: 11.5,
                                                fontWeight: isSel ? 800 : 600,
                                                border: isSel ? '1px solid #F87171' : '1px solid rgba(255, 255, 255, 0.1)',
                                                backgroundColor: isSel ? '#F87171' : 'rgba(255, 255, 255, 0.04)',
                                                color: isSel ? '#0B0E14' : '#E2E8F0',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {r.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* NOTA DE SEGUIMIENTO */}
                    <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                            Agregar Nota / Comentario (Opcional)
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            placeholder="Ej: Le escribí por WhatsApp y le ofrecí Suran 2014. Viene mañana al salón..."
                            style={{
                                width: '100%',
                                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 10,
                                padding: '9px 12px',
                                color: '#FFFFFF',
                                fontSize: 13,
                                outline: 'none',
                                resize: 'none',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>

                {/* ACCIONES FOOTER */}
                <div
                    style={{
                        padding: '12px 18px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '11px',
                            borderRadius: 12,
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            backgroundColor: 'transparent',
                            color: '#94A3B8',
                            fontSize: 13.5,
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        style={{
                            flex: 2,
                            padding: '11px',
                            borderRadius: 12,
                            border: 'none',
                            backgroundColor: '#EA580C',
                            color: '#FFFFFF',
                            fontSize: 13.5,
                            fontWeight: 800,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)'
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <Check size={16} strokeWidth={3} />
                                <span>Guardar Estado</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
