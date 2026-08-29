'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
    getGiveawayById, 
    updateGiveawayAction, 
    updateGiveawayStatusAction, 
    uploadGiveawayImageAction, 
    getGiveawayParticipantsAction,
    assignGiveawayWinnerAction,
    drawRandomWinnerAction
} from '@/lib/actions/giveaways';
import { Giveaway, GiveawayPrize, GiveawayParticipant, GiveawayStatus } from '@/lib/types';
import { 
    ArrowLeft, 
    Gift, 
    Plus, 
    Trash2, 
    Upload, 
    Save, 
    Calendar, 
    Trophy, 
    Users, 
    Sparkles, 
    Dices, 
    CheckCircle2, 
    AlertCircle, 
    Search, 
    ExternalLink,
    X,
    UserCheck,
    Phone,
    Mail,
    Award
} from 'lucide-react';

export default function AdminGiveawayDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const router = useRouter();

    const [giveaway, setGiveaway] = useState<Giveaway | null>(null);
    const [participants, setParticipants] = useState<GiveawayParticipant[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'prizes' | 'participants' | 'settings'>('prizes');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [terms, setTerms] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState<GiveawayStatus>('draft');
    const [prizes, setPrizes] = useState<any[]>([]);

    // State for random draw animation / confirmation
    const [drawingForPrizeId, setDrawingForPrizeId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Search filter for participants
    const [participantSearch, setParticipantSearch] = useState('');

    // Modal state for manual assignment
    const [manualModalPrize, setManualModalPrize] = useState<GiveawayPrize | null>(null);
    const [selectedParticipantId, setSelectedParticipantId] = useState('');
    const [customWinnerName, setCustomWinnerName] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [gw, parts] = await Promise.all([
                getGiveawayById(id),
                getGiveawayParticipantsAction(id)
            ]);

            if (gw) {
                setGiveaway(gw);
                setTitle(gw.title);
                setDescription(gw.description || '');
                setTerms(gw.terms_and_conditions || '');
                setStartDate(gw.start_date ? gw.start_date.split('T')[0] : '');
                setEndDate(gw.end_date ? gw.end_date.split('T')[0] : '');
                setStatus(gw.status);
                setPrizes(gw.prizes || []);
            }
            setParticipants(parts || []);
        } catch (err) {
            console.error('Error cargando sorteo:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleAddPrize = () => {
        const nextPos = prizes.length + 1;
        setPrizes([
            ...prizes,
            { position: nextPos, title: `${nextPos}° Premio`, description: '' }
        ]);
    };

    const handleRemovePrize = (index: number) => {
        if (prizes.length === 1) {
            alert('Debe haber al menos 1 premio.');
            return;
        }
        const updated = prizes.filter((_, idx) => idx !== index).map((p, idx) => ({
            ...p,
            position: idx + 1
        }));
        setPrizes(updated);
    };

    const handlePrizeChange = (index: number, field: string, value: any) => {
        const updated = [...prizes];
        updated[index] = { ...updated[index], [field]: value };
        setPrizes(updated);
    };

    const handlePrizeImageUpload = async (index: number, file: File) => {
        const updated = [...prizes];
        updated[index].isUploading = true;
        setPrizes([...updated]);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('giveaway_id', id);

            const res = await uploadGiveawayImageAction(formData);
            if (res.success && res.url) {
                updated[index].image_url = res.url;
            } else {
                alert('Error al subir imagen: ' + (res.error || 'Desconocido'));
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err || 'Error desconocido');
            alert('Error: ' + msg);
        } finally {
            updated[index].isUploading = false;
            setPrizes([...updated]);
        }
    };

    const handleSaveGeneral = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFeedback(null);

        try {
            const res = await updateGiveawayAction(id, {
                title,
                description,
                terms_and_conditions: terms,
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(`${endDate}T23:59:59`).toISOString(),
                status,
                prizes: prizes.map(p => ({
                    id: p.id,
                    position: p.position,
                    title: p.title,
                    description: p.description,
                    image_url: p.image_url,
                    winner_participant_id: p.winner_participant_id,
                    winner_name: p.winner_name
                }))
            });

            if (res.success) {
                setFeedback({ type: 'success', text: '¡Sorteo guardado correctamente!' });
                await loadData();
            } else {
                setFeedback({ type: 'error', text: res.error || 'Error al guardar.' });
            }
        } catch (err: any) {
            setFeedback({ type: 'error', text: err.message || 'Error inesperado.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Sortear ganador aleatorio
    const handleDrawRandom = async (prizeId: string, prizeTitle: string) => {
        if (!confirm(`¿Querés sortear aleatoriamente un ganador para "${prizeTitle}" entre los participantes inscriptos?`)) return;

        setDrawingForPrizeId(prizeId);
        setFeedback(null);

        try {
            const res = await drawRandomWinnerAction(id, prizeId);
            if (res.success && res.winnerName) {
                setFeedback({
                    type: 'success',
                    text: `🎉 ¡Ganador elegido para ${prizeTitle}: ${res.winnerName}!`
                });
                await loadData();
            } else {
                setFeedback({ type: 'error', text: res.error || 'No se pudo realizar el sorteo.' });
            }
        } catch (err: any) {
            setFeedback({ type: 'error', text: err.message || 'Error durante el sorteo.' });
        } finally {
            setDrawingForPrizeId(null);
        }
    };

    // Asignar ganador manualmente
    const handleSaveManualWinner = async () => {
        if (!manualModalPrize) return;

        let winnerName = customWinnerName.trim();
        let participantId: string | null = null;

        if (selectedParticipantId) {
            const part = participants.find(p => p.id === selectedParticipantId);
            if (part) {
                winnerName = `${part.first_name} ${part.last_name}`;
                participantId = part.id;
            }
        }

        if (!winnerName) {
            alert('Por favor seleccioná un participante o escribí el nombre del ganador.');
            return;
        }

        try {
            const res = await assignGiveawayWinnerAction({
                giveaway_id: id,
                prize_id: manualModalPrize.id,
                participant_id: participantId,
                winner_name: winnerName
            });

            if (res.success) {
                setManualModalPrize(null);
                setSelectedParticipantId('');
                setCustomWinnerName('');
                setFeedback({ type: 'success', text: `Ganador asignado: ${winnerName}` });
                await loadData();
            } else {
                alert('Error al asignar ganador: ' + res.error);
            }
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
    };

    // Quitar ganador asignado
    const handleRemoveWinner = async (prizeId: string) => {
        if (!confirm('¿Deseas quitar al ganador asignado a este premio?')) return;
        try {
            const res = await assignGiveawayWinnerAction({
                giveaway_id: id,
                prize_id: prizeId,
                participant_id: null,
                winner_name: ''
            });
            if (res.success) {
                setFeedback({ type: 'success', text: 'Ganador removido del premio.' });
                await loadData();
            }
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
    };

    const filteredParticipants = participants.filter(p => {
        if (!participantSearch.trim()) return true;
        const q = participantSearch.toLowerCase();
        return (
            p.first_name.toLowerCase().includes(q) ||
            p.last_name.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.phone.includes(q)
        );
    });

    const formatDate = (isoString: string) => {
        try {
            return new Date(isoString).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return isoString;
        }
    };

    if (loading || !giveaway) {
        return (
            <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748B' }}>
                Cargando sorteo...
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
            {/* Header del Sorteo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href="/admin/sorteos" className="btn-icon">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h1 className="admin-page-title" style={{ margin: 0 }}>
                                {giveaway.title}
                            </h1>
                            <span style={{
                                fontSize: 11,
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                padding: '3px 9px',
                                borderRadius: 12,
                                backgroundColor: giveaway.status === 'active' ? '#DCFCE7' : giveaway.status === 'closed' ? '#E0E7FF' : '#FEF3C7',
                                color: giveaway.status === 'active' ? '#15803D' : giveaway.status === 'closed' ? '#4338CA' : '#B45309'
                            }}>
                                {giveaway.status === 'active' ? 'ACTIVO' : giveaway.status === 'closed' ? 'CERRADO' : 'BORRADOR'}
                            </span>
                        </div>
                        <p className="admin-page-desc" style={{ margin: '4px 0 0 0' }}>
                            Vigencia: {formatDate(giveaway.start_date)} al {formatDate(giveaway.end_date)} • {participants.length} inscriptos
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Link
                        href="/sorteos"
                        target="_blank"
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <ExternalLink size={15} />
                        <span>Ver en Web Pública</span>
                    </Link>

                    {giveaway.status === 'draft' && (
                        <button
                            onClick={async () => {
                                await updateGiveawayStatusAction(id, 'active');
                                await loadData();
                            }}
                            className="btn-primary"
                            style={{ backgroundColor: '#15803D' }}
                        >
                            <CheckCircle2 size={16} />
                            <span>Activar Sorteo</span>
                        </button>
                    )}

                    {giveaway.status === 'active' && (
                        <button
                            onClick={async () => {
                                if (confirm('¿Deseas cerrar este sorteo y publicar los ganadores definitivos?')) {
                                    await updateGiveawayStatusAction(id, 'closed');
                                    await loadData();
                                }
                            }}
                            className="btn-secondary"
                            style={{ backgroundColor: '#4338CA', color: '#FFFFFF', border: 'none' }}
                        >
                            <Trophy size={16} />
                            <span>Cerrar Sorteo</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Mensajes de Feedback */}
            {feedback && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    borderRadius: 10,
                    marginBottom: 20,
                    fontSize: 14,
                    fontWeight: 600,
                    backgroundColor: feedback.type === 'success' ? '#DCFCE7' : '#FEE2E2',
                    border: `1px solid ${feedback.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
                    color: feedback.type === 'success' ? '#15803D' : '#B91C1C'
                }}>
                    {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{feedback.text}</span>
                </div>
            )}

            {/* Pestañas de Navegación */}
            <div style={{
                display: 'flex',
                gap: 8,
                borderBottom: '2px solid #E2E8F0',
                marginBottom: 24
            }}>
                <button
                    onClick={() => setActiveTab('prizes')}
                    style={{
                        padding: '12px 18px',
                        border: 'none',
                        background: 'none',
                        borderBottom: activeTab === 'prizes' ? '3px solid #EA580C' : '3px solid transparent',
                        color: activeTab === 'prizes' ? '#EA580C' : '#64748B',
                        fontWeight: 800,
                        fontSize: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    <Trophy size={16} />
                    <span>Premios y Ganadores ({prizes.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('participants')}
                    style={{
                        padding: '12px 18px',
                        border: 'none',
                        background: 'none',
                        borderBottom: activeTab === 'participants' ? '3px solid #EA580C' : '3px solid transparent',
                        color: activeTab === 'participants' ? '#EA580C' : '#64748B',
                        fontWeight: 800,
                        fontSize: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    <Users size={16} />
                    <span>Inscriptos ({participants.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('settings')}
                    style={{
                        padding: '12px 18px',
                        border: 'none',
                        background: 'none',
                        borderBottom: activeTab === 'settings' ? '3px solid #EA580C' : '3px solid transparent',
                        color: activeTab === 'settings' ? '#EA580C' : '#64748B',
                        fontWeight: 800,
                        fontSize: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    <Gift size={16} />
                    <span>Configuración General</span>
                </button>
            </div>

            {/* TAB 1: PREMIOS Y GANADORES (SORTEO) */}
            {activeTab === 'prizes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#FFF7ED',
                        padding: '16px 20px',
                        borderRadius: 12,
                        border: '1px solid #FFEDD5'
                    }}>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#9A3412', margin: 0 }}>
                                Panel de Sorteo y Asignación de Ganadores
                            </h3>
                            <p style={{ fontSize: 13, color: '#C2410C', margin: '4px 0 0 0' }}>
                                Podés sortear un ganador aleatoriamente entre los {participants.length} inscriptos o asignarlo de forma manual.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddPrize}
                            className="btn-sm"
                            style={{ backgroundColor: '#EA580C', color: '#FFFFFF' }}
                        >
                            <Plus size={14} />
                            <span>Agregar Premio</span>
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {prizes.map((prize, index) => {
                            const isWinnerAssigned = !!prize.winner_name;
                            const isDrawing = drawingForPrizeId === prize.id;

                            return (
                                <div
                                    key={prize.id || index}
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: 14,
                                        border: `2px solid ${isWinnerAssigned ? '#22C55E' : '#E2E8F0'}`,
                                        padding: '24px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
                                    }}
                                >
                                    {/* Cabecera del Premio */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{
                                                fontSize: 13,
                                                fontWeight: 900,
                                                backgroundColor: prize.position === 1 ? '#F59E0B' : prize.position === 2 ? '#64748B' : '#B45309',
                                                color: '#FFFFFF',
                                                padding: '4px 12px',
                                                borderRadius: 20
                                            }}>
                                                {prize.position}° PREMIO
                                            </span>
                                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                                                {prize.title}
                                            </h3>
                                        </div>

                                        {/* Botones de acción del Sorteo */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {!isWinnerAssigned ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        disabled={isDrawing || participants.length === 0}
                                                        onClick={() => handleDrawRandom(prize.id, prize.title)}
                                                        className="btn-primary"
                                                        style={{
                                                            backgroundColor: '#8B5CF6',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 6,
                                                            padding: '8px 14px',
                                                            fontSize: 13
                                                        }}
                                                    >
                                                        <Dices size={16} />
                                                        <span>{isDrawing ? 'Sorteando...' : '🎲 Sortear Aleatorio'}</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setManualModalPrize(prize);
                                                            setSelectedParticipantId('');
                                                            setCustomWinnerName('');
                                                        }}
                                                        className="btn-secondary"
                                                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13 }}
                                                    >
                                                        <UserCheck size={16} />
                                                        <span>Asignar Manual</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveWinner(prize.id)}
                                                    className="btn-sm"
                                                    style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5' }}
                                                >
                                                    <X size={14} />
                                                    <span>Quitar Ganador</span>
                                                </button>
                                            )}

                                            {prizes.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePrize(index)}
                                                    className="btn-icon"
                                                    style={{ color: '#EF4444' }}
                                                    title="Eliminar Premio"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tarjeta de Ganador Asignado */}
                                    {isWinnerAssigned && (
                                        <div style={{
                                            backgroundColor: '#F0FDF4',
                                            border: '2px solid #86EFAC',
                                            borderRadius: 12,
                                            padding: '16px 20px',
                                            marginBottom: 20,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            gap: 12
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#22C55E', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Trophy size={22} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 11, fontWeight: 900, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                        Ganador Oficial del Puesto {prize.position}
                                                    </div>
                                                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                                                        {prize.winner_name}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ fontSize: 12.5, color: '#15803D', fontWeight: 600 }}>
                                                ✓ Listo para publicarse en la web
                                            </div>
                                        </div>
                                    )}

                                    {/* Formulario de edición del premio y foto */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            <div>
                                                <label className="admin-form-label">Nombre del Premio</label>
                                                <input
                                                    type="text"
                                                    value={prize.title}
                                                    onChange={(e) => handlePrizeChange(index, 'title', e.target.value)}
                                                    className="admin-input"
                                                />
                                            </div>

                                            <div>
                                                <label className="admin-form-label">Descripción</label>
                                                <textarea
                                                    rows={2}
                                                    value={prize.description || ''}
                                                    onChange={(e) => handlePrizeChange(index, 'description', e.target.value)}
                                                    className="admin-textarea"
                                                />
                                            </div>
                                        </div>

                                        {/* Foto del Premio */}
                                        <div>
                                            <label className="admin-form-label">Imagen del Premio</label>
                                            <div style={{
                                                border: '2px dashed #CBD5E1',
                                                borderRadius: 12,
                                                padding: '14px',
                                                textAlign: 'center',
                                                backgroundColor: '#F8FAFC',
                                                minHeight: 130,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative'
                                            }}>
                                                {prize.image_url ? (
                                                    <div style={{ position: 'relative', width: '100%', height: 110 }}>
                                                        <Image
                                                            src={prize.image_url}
                                                            alt={prize.title}
                                                            fill
                                                            style={{ objectFit: 'contain' }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePrizeChange(index, 'image_url', undefined)}
                                                            style={{
                                                                position: 'absolute',
                                                                top: -4,
                                                                right: -4,
                                                                backgroundColor: '#EF4444',
                                                                color: '#FFFFFF',
                                                                border: 'none',
                                                                borderRadius: '50%',
                                                                width: 22,
                                                                height: 22,
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <Trash2 size={11} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <Upload size={22} style={{ color: '#94A3B8', margin: '0 auto 6px' }} />
                                                        <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 6px' }}>
                                                            {prize.isUploading ? 'Subiendo imagen...' : 'Cargar foto'}
                                                        </p>
                                                        <label style={{
                                                            display: 'inline-block',
                                                            padding: '4px 12px',
                                                            backgroundColor: '#FFFFFF',
                                                            border: '1px solid #CBD5E1',
                                                            color: '#334155',
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                            borderRadius: 6,
                                                            cursor: 'pointer'
                                                        }}>
                                                            <span>Subir Archivo</span>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) handlePrizeImageUpload(index, file);
                                                                }}
                                                                style={{ display: 'none' }}
                                                            />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                        <button
                            type="button"
                            onClick={handleSaveGeneral}
                            disabled={isSubmitting}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            <Save size={16} />
                            <span>{isSubmitting ? 'Guardando Cambios...' : 'Guardar Cambios de Premios'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 2: PARTICIPANTES / INSCRIPTOS */}
            {activeTab === 'participants' && (
                <div className="table-container">
                    <div className="table-toolbar">
                        <div className="table-search" style={{ width: '100%', maxWidth: 360 }}>
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Buscar inscripto por nombre, email o celular..."
                                value={participantSearch}
                                onChange={(e) => setParticipantSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredParticipants.length === 0 ? (
                        <div style={{ padding: '50px 20px', textAlign: 'center', color: '#64748B' }}>
                            <Users size={40} style={{ color: '#CBD5E1', margin: '0 auto 12px' }} />
                            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                                {participants.length === 0 ? 'Aún no hay participantes inscriptos en este sorteo.' : 'No se encontraron participantes con esa búsqueda.'}
                            </p>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Participante</th>
                                    <th>Email</th>
                                    <th>Celular / WhatsApp</th>
                                    <th>Fecha Registro</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredParticipants.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ fontWeight: 700, color: '#0F172A' }}>
                                                {p.first_name} {p.last_name}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#334155' }}>
                                                <Mail size={14} style={{ color: '#64748B' }} />
                                                <span>{p.email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#334155' }}>
                                                <Phone size={14} style={{ color: '#16A34A' }} />
                                                <a
                                                    href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#16A34A', fontWeight: 600 }}
                                                >
                                                    {p.phone}
                                                </a>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: 12.5, color: '#64748B' }}>
                                                {formatDate(p.created_at)}
                                            </span>
                                        </td>
                                        <td>
                                            {p.is_winner ? (
                                                <span style={{
                                                    fontSize: 11,
                                                    fontWeight: 900,
                                                    backgroundColor: '#DCFCE7',
                                                    color: '#15803D',
                                                    padding: '3px 8px',
                                                    borderRadius: 12,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 4
                                                }}>
                                                    🏆 Ganador ({p.prize_position}° Premio)
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: 12, color: '#64748B' }}>
                                                    Inscripto
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* TAB 3: CONFIGURACIÓN GENERAL */}
            {activeTab === 'settings' && (
                <form onSubmit={handleSaveGeneral}>
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label className="admin-form-label">Título del Sorteo *</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="admin-input"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                            <div>
                                <label className="admin-form-label">Fecha de Inicio *</label>
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="admin-input"
                                />
                            </div>

                            <div>
                                <label className="admin-form-label">Fecha de Cierre *</label>
                                <input
                                    type="date"
                                    required
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="admin-input"
                                />
                            </div>

                            <div>
                                <label className="admin-form-label">Estado</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as GiveawayStatus)}
                                    className="admin-select"
                                >
                                    <option value="draft">Borrador</option>
                                    <option value="active">Activo (Público)</option>
                                    <option value="closed">Cerrado (Ganadores visibles)</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="admin-form-label">Descripción</label>
                            <textarea
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="admin-textarea"
                            />
                        </div>

                        <div>
                            <label className="admin-form-label">Bases y Condiciones</label>
                            <textarea
                                rows={3}
                                value={terms}
                                onChange={(e) => setTerms(e.target.value)}
                                className="admin-textarea"
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                            >
                                <Save size={16} />
                                <span>{isSubmitting ? 'Guardando...' : 'Guardar Configuración'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* MODAL DE ASIGNACIÓN MANUAL DE GANADOR */}
            {manualModalPrize && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: 20
                }}>
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        maxWidth: 520,
                        width: '100%',
                        padding: 24,
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                                Asignar Ganador a {manualModalPrize.position}° Premio
                            </h3>
                            <button
                                onClick={() => setManualModalPrize(null)}
                                className="btn-icon"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label className="admin-form-label">Seleccionar de los Participantes Inscriptos</label>
                                <select
                                    value={selectedParticipantId}
                                    onChange={(e) => {
                                        setSelectedParticipantId(e.target.value);
                                        if (e.target.value) setCustomWinnerName('');
                                    }}
                                    className="admin-select"
                                >
                                    <option value="">-- Elegir participante --</option>
                                    {participants.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.first_name} {p.last_name} ({p.email} - {p.phone})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', fontWeight: 700 }}>
                                — O INGRESAR NOMBRE DIRECTO —
                            </div>

                            <div>
                                <label className="admin-form-label">Nombre y Apellido del Ganador</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Marcelo García"
                                    value={customWinnerName}
                                    onChange={(e) => {
                                        setCustomWinnerName(e.target.value);
                                        if (e.target.value) setSelectedParticipantId('');
                                    }}
                                    className="admin-input"
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                                <button
                                    type="button"
                                    onClick={() => setManualModalPrize(null)}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveManualWinner}
                                    className="btn-primary"
                                >
                                    Confirmar Ganador
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
