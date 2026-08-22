'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WantedVehicle, MatchResult, Vehicle, WantedVehicleStatus, WantedVehicleCancellationReason } from '@/lib/types';
import { updateWantedVehicleStatus, deleteWantedVehicle } from '@/lib/actions/wanted-vehicles';
import { formatARS } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { WhatsAppPreparationModal } from '@/components/admin/WhatsAppPreparationModal';
import { 
    SearchCheck, 
    Car, 
    User, 
    ArrowLeft, 
    Flame, 
    Check, 
    AlertCircle, 
    Phone, 
    MessageCircle, 
    Sparkles, 
    SlidersHorizontal, 
    Trash2, 
    CheckCircle2, 
    Clock, 
    ArrowUpRight, 
    ShieldAlert,
    FileText,
    Globe,
    Building2
} from 'lucide-react';

export function WantedVehicleDetailClient({
    wanted,
    initialMatches
}: {
    wanted: WantedVehicle;
    initialMatches: MatchResult[];
}) {
    const router = useRouter();
    const [currentWanted, setCurrentWanted] = useState<WantedVehicle>(wanted);
    const [matches, setMatches] = useState<MatchResult[]>(initialMatches);

    // Modal de WhatsApp
    const [whatsappModalData, setWhatsappModalData] = useState<{
        isOpen: boolean;
        vehicle: Vehicle | null;
    }>({
        isOpen: false,
        vehicle: null
    });

    // Modal de Cambio de Estado / Cancelación
    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        newStatus: WantedVehicleStatus;
        cancellationReason: WantedVehicleCancellationReason;
        notes: string;
    }>({
        isOpen: false,
        newStatus: wanted.status,
        cancellationReason: (wanted.cancellation_reason as any) || 'BOUGHT_ELSEWHERE',
        notes: ''
    });

    const handleConfirmStatusChange = async () => {
        const res = await updateWantedVehicleStatus(currentWanted.id, statusModal.newStatus, {
            cancellation_reason: statusModal.newStatus === 'CANCELLED' ? statusModal.cancellationReason : null,
            notes: statusModal.notes ? `${currentWanted.notes || ''}\n[${new Date().toLocaleDateString('es-AR')}]: ${statusModal.notes}`.trim() : currentWanted.notes,
            touchLastContact: true
        });

        if (res.success && res.data) {
            setCurrentWanted(res.data);
        }
        setStatusModal(prev => ({ ...prev, isOpen: false }));
        router.refresh();
    };

    const handleDelete = async () => {
        if (!confirm(`¿Eliminar la búsqueda ${currentWanted.code}?`)) return;
        await deleteWantedVehicle(currentWanted.id);
        router.push('/admin/vehiculos-buscados');
    };

    const getStatusBadge = (status: WantedVehicleStatus, reason?: string | null) => {
        switch (status) {
            case 'SEARCHING':
                return <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '4px 10px', borderRadius: 14, fontSize: 12, fontWeight: 800 }}>Buscando</span>;
            case 'CONTACTED':
                return <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A', padding: '4px 10px', borderRadius: 14, fontSize: 12, fontWeight: 800 }}>Contactado</span>;
            case 'FOUND':
                return <span style={{ backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: 14, fontSize: 12, fontWeight: 800 }}>Encontrado</span>;
            case 'CLOSED':
                return <span style={{ backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', padding: '4px 10px', borderRadius: 14, fontSize: 12, fontWeight: 800 }}>Cerrado (Compró)</span>;
            case 'CANCELLED':
                const reasonLabel = reason === 'BOUGHT_ELSEWHERE' ? 'Compró en otro lado' 
                    : reason === 'DECIDED_NOT_TO_CHANGE' ? 'Ya no cambia de auto' 
                    : reason === 'BUDGET_CHANGED' ? 'Cambió presupuesto' 
                    : 'Cancelado';
                return <span style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '4px 10px', borderRadius: 14, fontSize: 12, fontWeight: 800 }}>{reasonLabel}</span>;
            default:
                return null;
        }
    };

    const client = currentWanted.client;

    return (
        <div className="admin-page-container">
            {/* Header */}
            <div className="admin-header-actions" style={{ marginBottom: 24 }}>
                <div>
                    <Link
                        href="/admin/vehiculos-buscados"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: '#64748B',
                            fontSize: 13,
                            fontWeight: 700,
                            textDecoration: 'none',
                            marginBottom: 8
                        }}
                    >
                        <ArrowLeft size={16} />
                        <span>Volver a Vehículos Buscados</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                            {currentWanted.brand} {currentWanted.model} {currentWanted.version || ''}
                        </h1>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#EA580C', fontFamily: 'monospace', backgroundColor: '#FFF7ED', padding: '2px 8px', borderRadius: 6, border: '1px solid #FFEDD5' }}>
                            {currentWanted.code}
                        </span>
                        {getStatusBadge(currentWanted.status, currentWanted.cancellation_reason)}
                        {currentWanted.source === 'WEB' ? (
                            <span style={{
                                backgroundColor: '#EFF6FF',
                                color: '#1D4ED8',
                                border: '1px solid #BFDBFE',
                                padding: '3px 10px',
                                borderRadius: 14,
                                fontSize: 12,
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                            }}>
                                <Globe size={13} /> Solicitud Web (Landing)
                            </span>
                        ) : (
                            <span style={{
                                backgroundColor: '#F1F5F9',
                                color: '#475569',
                                border: '1px solid #CBD5E1',
                                padding: '3px 10px',
                                borderRadius: 14,
                                fontSize: 12,
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                            }}>
                                <Building2 size={13} /> Creado en Agencia
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={() => setStatusModal({
                            isOpen: true,
                            newStatus: currentWanted.status,
                            cancellationReason: (currentWanted.cancellation_reason as any) || 'BOUGHT_ELSEWHERE',
                            notes: ''
                        })}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '10px 16px',
                            borderRadius: 10,
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#FFFFFF',
                            color: '#0F172A',
                            fontSize: 13.5,
                            fontWeight: 800,
                            cursor: 'pointer'
                        }}
                    >
                        <SlidersHorizontal size={16} />
                        <span>Cambiar Estado / Baja</span>
                    </button>

                    <button
                        onClick={handleDelete}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: '1px solid #FEE2E2',
                            backgroundColor: '#FEF2F2',
                            color: '#EF4444',
                            fontSize: 13.5,
                            fontWeight: 800,
                            cursor: 'pointer'
                        }}
                    >
                        <Trash2 size={16} />
                        <span>Eliminar</span>
                    </button>
                </div>
            </div>

            {/* GRID PRINCIPAL */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }}>
                
                {/* COLUMNA IZQUIERDA: COINCIDENCIAS EN STOCK ACTUAL */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        border: '1px solid #E2E8F0',
                        padding: 24,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Flame size={20} style={{ color: '#EA580C' }} />
                                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                                    Coincidencias en Stock Actual ({matches.length})
                                </h2>
                            </div>
                            <span style={{ fontSize: 12, color: '#64748B' }}>
                                Ordenado por mayor compatibilidad
                            </span>
                        </div>

                        {matches.length === 0 ? (
                            <div style={{
                                backgroundColor: '#F8FAFC',
                                border: '1px dashed #CBD5E1',
                                borderRadius: 12,
                                padding: '36px 20px',
                                textAlign: 'center'
                            }}>
                                <Car size={36} style={{ color: '#94A3B8', margin: '0 auto 10px' }} />
                                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                                    Sin unidades en stock compatibles por el momento
                                </h4>
                                <p style={{ fontSize: 13, color: '#64748B', maxWidth: 460, margin: '6px auto 0' }}>
                                    Apenas ingrese un auto que coincida con estos criterios, el sistema lo alertará automáticamente.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {matches.map((m, idx) => {
                                    const v = m.vehicle!;
                                    return (
                                        <div
                                            key={idx}
                                            style={{
                                                backgroundColor: m.score >= 80 ? '#FFF7ED' : '#F8FAFC',
                                                border: m.score >= 80 ? '1.5px solid #FDBA74' : '1px solid #E2E8F0',
                                                borderRadius: 14,
                                                padding: 16,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 12
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    {/* Miniatura */}
                                                    <div style={{
                                                        width: 70,
                                                        height: 52,
                                                        borderRadius: 8,
                                                        overflow: 'hidden',
                                                        backgroundColor: '#E2E8F0',
                                                        flexShrink: 0
                                                    }}>
                                                        {v.images && v.images.length > 0 ? (
                                                            <img
                                                                src={v.images.find(img => img.is_primary)?.url || v.images[0].url}
                                                                alt={v.model}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                                                                <Car size={22} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <Link
                                                                href={`/admin/vehiculos/${v.id}`}
                                                                style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', textDecoration: 'none' }}
                                                            >
                                                                {v.brand} {v.model} {v.version || ''} ({v.year})
                                                            </Link>
                                                            <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace' }}>
                                                                [{v.stock_code}]
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
                                                            {v.mileage === 0 ? '0 KM' : `${v.mileage.toLocaleString('es-AR')} km`} • {v.fuel_type} • {v.transmission}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Score y Precio */}
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                        <span style={{
                                                            backgroundColor: m.score >= 80 ? '#EA580C' : '#475569',
                                                            color: '#FFFFFF',
                                                            fontSize: 12,
                                                            fontWeight: 900,
                                                            padding: '2px 8px',
                                                            borderRadius: 12
                                                        }}>
                                                            {m.score}% Coincidencia
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: 17, fontWeight: 900, color: '#059669' }}>
                                                        {formatARS(v.sale_price)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Puntos destacados del Match */}
                                            {m.highlights.length > 0 && (
                                                <div style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 6,
                                                    padding: '8px 12px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                                    borderRadius: 8,
                                                    border: '1px solid #E2E8F0'
                                                }}>
                                                    {m.highlights.map((h, hIdx) => (
                                                        <span
                                                            key={hIdx}
                                                            style={{
                                                                fontSize: 11.5,
                                                                fontWeight: 700,
                                                                color: '#334155',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: 4
                                                            }}
                                                        >
                                                            <Check size={12} style={{ color: '#059669' }} />
                                                            <span>{h}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Botón Preparar WhatsApp */}
                                            {client && (
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                                                    <button
                                                        onClick={() => setWhatsappModalData({
                                                            isOpen: true,
                                                            vehicle: v
                                                        })}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 8,
                                                            backgroundColor: '#25D366',
                                                            color: '#FFFFFF',
                                                            border: 'none',
                                                            padding: '8px 16px',
                                                            borderRadius: 8,
                                                            fontSize: 13,
                                                            fontWeight: 800,
                                                            cursor: 'pointer',
                                                            boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                                                        }}
                                                    >
                                                        <MessageCircle size={16} />
                                                        <span>Preparar WhatsApp de Ofrecimiento</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: FICHA DEL CLIENTE Y CRITERIOS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    
                    {/* Tarjeta del Cliente */}
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        border: '1px solid #E2E8F0',
                        padding: 20,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                            Comprador Interesado
                        </div>

                        {client ? (
                            <div>
                                <Link
                                    href={`/admin/clientes/${client.id}`}
                                    style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', textDecoration: 'none' }}
                                >
                                    {client.first_name} {client.last_name}
                                </Link>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                                    {client.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
                                            <Phone size={14} style={{ color: '#64748B' }} />
                                            <span>{client.phone}</span>
                                        </div>
                                    )}
                                    {client.email && (
                                        <div style={{ fontSize: 12.5, color: '#64748B' }}>
                                            {client.email}
                                        </div>
                                    )}
                                    {client.city && (
                                        <div style={{ fontSize: 12.5, color: '#64748B' }}>
                                            📍 {client.city}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: '#64748B', fontSize: 13 }}>
                                Sin cliente vinculado
                            </div>
                        )}
                    </div>

                    {/* Resumen de Requisitos */}
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        border: '1px solid #E2E8F0',
                        padding: 20,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                            Criterios del Pedido
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748B' }}>Presupuesto Máx:</span>
                                <span style={{ fontWeight: 800, color: '#059669' }}>
                                    {currentWanted.max_budget > 0 ? formatARS(currentWanted.max_budget) : 'Sin tope'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748B' }}>Rango de Años:</span>
                                <span style={{ fontWeight: 700, color: '#0F172A' }}>
                                    {currentWanted.year_min || '—'} a {currentWanted.year_max || '—'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748B' }}>Kms Máximos:</span>
                                <span style={{ fontWeight: 700, color: '#0F172A' }}>
                                    {currentWanted.max_mileage ? `${currentWanted.max_mileage.toLocaleString('es-AR')} km` : 'Sin límite'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748B' }}>Transmisión:</span>
                                <span style={{ fontWeight: 700, color: '#0F172A' }}>
                                    {currentWanted.transmission || 'Indistinta'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748B' }}>Acepta similar:</span>
                                <span style={{ fontWeight: 700, color: currentWanted.accepts_similar_model ? '#059669' : '#DC2626' }}>
                                    {currentWanted.accepts_similar_model ? 'Sí' : 'No'}
                                </span>
                            </div>

                            {/* Permuta */}
                            {currentWanted.has_trade_in && (
                                <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: 10, marginTop: 6 }}>
                                    <div style={{ fontSize: 11.5, fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase' }}>
                                        Entrega en Permuta:
                                    </div>
                                    <div style={{ fontSize: 12.5, color: '#1E3A8A', marginTop: 2 }}>
                                        {currentWanted.trade_in_details || 'Detalles no especificados'}
                                    </div>
                                </div>
                            )}

                            {/* Notas */}
                            {currentWanted.notes && (
                                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 10, marginTop: 6 }}>
                                    <div style={{ fontSize: 11.5, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                                        Notas:
                                    </div>
                                    <div style={{ fontSize: 12.5, color: '#334155', marginTop: 2, whiteSpace: 'pre-line' }}>
                                        {currentWanted.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE CAMBIO DE ESTADO / CANCELACIÓN */}
            {statusModal.isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16
                }}>
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 18,
                        width: '100%',
                        maxWidth: 480,
                        padding: 24,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                        border: '1px solid #E2E8F0'
                    }}>
                        <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>
                            Gestionar Estado del Pedido ({currentWanted.code})
                        </h3>
                        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 18 }}>
                            {currentWanted.brand} {currentWanted.model}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                    Nuevo Estado
                                </label>
                                <select
                                    value={statusModal.newStatus}
                                    onChange={(e) => setStatusModal(prev => ({ ...prev, newStatus: e.target.value as any }))}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        border: '1px solid #CBD5E1',
                                        fontSize: 13.5,
                                        fontWeight: 700,
                                        color: '#0F172A'
                                    }}
                                >
                                    <option value="SEARCHING">Buscando (Sigue en búsqueda activa)</option>
                                    <option value="CONTACTED">Contactado (Se le enviaron opciones)</option>
                                    <option value="FOUND">Encontrado (Unidad reservada o pactada)</option>
                                    <option value="CLOSED">Cerrado (Compró el auto con nosotros)</option>
                                    <option value="CANCELLED">Cancelado / Dar de Baja (Ya no necesita)</option>
                                </select>
                            </div>

                            {statusModal.newStatus === 'CANCELLED' && (
                                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 14 }}>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#991B1B', marginBottom: 6 }}>
                                        Motivo de la Baja / Cancelación
                                    </label>
                                    <select
                                        value={statusModal.cancellationReason}
                                        onChange={(e) => setStatusModal(prev => ({ ...prev, cancellationReason: e.target.value as any }))}
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            borderRadius: 8,
                                            border: '1px solid #FCA5A5',
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: '#991B1B',
                                            backgroundColor: '#FFFFFF'
                                        }}
                                    >
                                        <option value="BOUGHT_ELSEWHERE">Compró en otra agencia / particular</option>
                                        <option value="DECIDED_NOT_TO_CHANGE">Decidió no cambiar de auto / suspendió compra</option>
                                        <option value="BUDGET_CHANGED">Cambió de presupuesto / no llega con los números</option>
                                        <option value="FOUND_WITH_US">Compró otro auto diferente con nosotros</option>
                                        <option value="OTHER">Otro motivo</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                    Nota de Seguimiento (Opcional)
                                </label>
                                <textarea
                                    value={statusModal.notes}
                                    onChange={(e) => setStatusModal(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Detalles de la llamada o motivo..."
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: 10,
                                        border: '1px solid #CBD5E1',
                                        fontSize: 13,
                                        color: '#0F172A',
                                        resize: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                            <button
                                type="button"
                                onClick={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
                                style={{
                                    padding: '9px 16px',
                                    borderRadius: 8,
                                    border: '1px solid #CBD5E1',
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
                                onClick={handleConfirmStatusChange}
                                style={{
                                    padding: '9px 18px',
                                    borderRadius: 8,
                                    border: 'none',
                                    backgroundColor: '#0F172A',
                                    color: '#FFFFFF',
                                    fontSize: 13,
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                }}
                            >
                                Guardar Cambio
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE WHATSAPP */}
            {whatsappModalData.isOpen && whatsappModalData.vehicle && client && (
                <WhatsAppPreparationModal
                    isOpen={whatsappModalData.isOpen}
                    onClose={() => setWhatsappModalData({ isOpen: false, vehicle: null })}
                    client={client}
                    vehicle={whatsappModalData.vehicle}
                    wantedBrand={currentWanted.brand}
                    wantedModel={currentWanted.model}
                />
            )}
        </div>
    );
}
