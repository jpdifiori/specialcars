'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getGiveawaysAdmin, updateGiveawayStatusAction, deleteGiveawayAction } from '@/lib/actions/giveaways';
import { Giveaway, GiveawayStatus } from '@/lib/types';
import { 
    Gift, 
    Plus, 
    Calendar, 
    Users, 
    Trophy, 
    Edit, 
    Trash2, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    XCircle,
    Eye,
    Sparkles
} from 'lucide-react';

export default function AdminGiveawaysPage() {
    const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');

    const loadGiveaways = async () => {
        setLoading(true);
        try {
            const data = await getGiveawaysAdmin();
            setGiveaways(data);
        } catch (err) {
            console.error('Error cargando sorteos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGiveaways();
    }, []);

    const handleStatusChange = async (id: string, newStatus: GiveawayStatus) => {
        try {
            await updateGiveawayStatusAction(id, newStatus);
            loadGiveaways();
        } catch (err) {
            console.error('Error al cambiar estado:', err);
            alert('Error al actualizar el estado del sorteo.');
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`¿Seguro que deseas eliminar el sorteo "${title}"?`)) return;
        try {
            await deleteGiveawayAction(id);
            loadGiveaways();
        } catch (err) {
            console.error('Error al eliminar sorteo:', err);
            alert('No se pudo eliminar el sorteo.');
        }
    };

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

    const filteredGiveaways = giveaways.filter((g) => {
        if (statusFilter === 'ALL') return true;
        return g.status === statusFilter;
    });

    const activeCount = giveaways.filter(g => g.status === 'active').length;
    const closedCount = giveaways.filter(g => g.status === 'closed').length;
    const totalParticipants = giveaways.reduce((acc, g) => acc + (g.participants_count || 0), 0);

    const getStatusBadge = (status: GiveawayStatus) => {
        switch (status) {
            case 'active':
                return { label: 'Activo', bg: '#DCFCE7', color: '#15803D', border: '#86EFAC' };
            case 'closed':
                return { label: 'Cerrado', bg: '#E0E7FF', color: '#4338CA', border: '#A5B4FC' };
            case 'draft':
                return { label: 'Borrador', bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
            case 'cancelled':
                return { label: 'Cancelado', bg: '#FEE2E2', color: '#B91C1C', border: '#FCA5A5' };
            default:
                return { label: status, bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };
        }
    };

    return (
        <div>
            {/* Header del Admin */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Sorteos y Concursos</h1>
                    <p className="admin-page-desc">
                        Creá sorteos para la landing page, configurá los premios con fotos y seleccioná o sorteá a los ganadores.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link href="/admin/sorteos/nuevo" className="btn-primary">
                        <Plus size={16} />
                        <span>Nuevo Sorteo</span>
                    </Link>
                </div>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
                marginBottom: 24
            }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 10, backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                        <Gift size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B' }}>Total Sorteos</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#0F172A' }}>{giveaways.length}</div>
                    </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 10, backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803D' }}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B' }}>Sorteos Activos</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#15803D' }}>{activeCount}</div>
                    </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 10, backgroundColor: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338CA' }}>
                        <Trophy size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B' }}>Finalizados / Cerrados</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#4338CA' }}>{closedCount}</div>
                    </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 10, backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B' }}>Total Inscriptos</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#0F172A' }}>{totalParticipants}</div>
                    </div>
                </div>
            </div>

            {/* Contenedor de Tabla y Filtros */}
            <div className="table-container">
                <div className="table-toolbar">
                    <div className="table-filters">
                        <select
                            className="admin-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">Todos los estados</option>
                            <option value="active">Activos</option>
                            <option value="draft">Borradores</option>
                            <option value="closed">Cerrados</option>
                            <option value="cancelled">Cancelados</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
                        Cargando sorteos...
                    </div>
                ) : filteredGiveaways.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
                        <Gift size={48} style={{ color: '#CBD5E1', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>
                            No hay sorteos creados
                        </h3>
                        <p style={{ fontSize: 14, color: '#64748B', maxWidth: 460, margin: '0 auto 20px' }}>
                            Creá tu primer sorteo para captar clientes en la landing page y premiar a tu comunidad.
                        </p>
                        <Link href="/admin/sorteos/nuevo" className="btn-primary">
                            <Plus size={16} />
                            <span>Crear Primer Sorteo</span>
                        </Link>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Sorteo</th>
                                <th>Fechas (Vigencia)</th>
                                <th>Premios</th>
                                <th>Inscriptos</th>
                                <th>Ganadores</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGiveaways.map((giveaway) => {
                                const statusBadge = getStatusBadge(giveaway.status);
                                const prizes = giveaway.prizes || [];
                                const winnersCount = prizes.filter(p => !!p.winner_name).length;

                                return (
                                    <tr key={giveaway.id}>
                                        {/* Título */}
                                        <td>
                                            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>
                                                {giveaway.title}
                                            </div>
                                            {giveaway.description && (
                                                <div style={{ fontSize: 12, color: '#64748B', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {giveaway.description}
                                                </div>
                                            )}
                                        </td>

                                        {/* Fechas */}
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#334155' }}>
                                                <Calendar size={14} style={{ color: '#EA580C' }} />
                                                <span>{formatDate(giveaway.start_date)} - {formatDate(giveaway.end_date)}</span>
                                            </div>
                                        </td>

                                        {/* Premios */}
                                        <td>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                {prizes.length === 0 ? (
                                                    <span style={{ fontSize: 12, color: '#94A3B8' }}>Sin premios</span>
                                                ) : (
                                                    prizes.map((p) => (
                                                        <span
                                                            key={p.id}
                                                            title={`${p.position}° Premio: ${p.title}`}
                                                            style={{
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                backgroundColor: '#F1F5F9',
                                                                color: '#334155',
                                                                padding: '2px 8px',
                                                                borderRadius: 6,
                                                                border: '1px solid #E2E8F0'
                                                            }}
                                                        >
                                                            {p.position}° {p.title}
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </td>

                                        {/* Inscriptos */}
                                        <td>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#0F172A', fontSize: 13.5 }}>
                                                <Users size={14} style={{ color: '#0284C7' }} />
                                                <span>{giveaway.participants_count || 0}</span>
                                            </div>
                                        </td>

                                        {/* Ganadores */}
                                        <td>
                                            {winnersCount > 0 ? (
                                                <span style={{
                                                    fontSize: 11.5,
                                                    fontWeight: 800,
                                                    color: '#15803D',
                                                    backgroundColor: '#DCFCE7',
                                                    padding: '3px 8px',
                                                    borderRadius: 12,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 4
                                                }}>
                                                    <Trophy size={13} />
                                                    <span>{winnersCount}/{prizes.length} Asignados</span>
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: 12, color: '#94A3B8' }}>
                                                    Pendiente
                                                </span>
                                            )}
                                        </td>

                                        {/* Estado */}
                                        <td>
                                            <span style={{
                                                fontSize: 11.5,
                                                fontWeight: 800,
                                                padding: '4px 10px',
                                                borderRadius: 20,
                                                backgroundColor: statusBadge.bg,
                                                color: statusBadge.color,
                                                border: `1px solid ${statusBadge.border}`
                                            }}>
                                                {statusBadge.label}
                                            </span>
                                        </td>

                                        {/* Acciones */}
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                                {/* Activar / Cerrar toggle */}
                                                {giveaway.status === 'draft' && (
                                                    <button
                                                        onClick={() => handleStatusChange(giveaway.id, 'active')}
                                                        className="btn-sm"
                                                        style={{ backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC' }}
                                                        title="Activar Sorteo"
                                                    >
                                                        Activar
                                                    </button>
                                                )}

                                                {giveaway.status === 'active' && (
                                                    <button
                                                        onClick={() => handleStatusChange(giveaway.id, 'closed')}
                                                        className="btn-sm"
                                                        style={{ backgroundColor: '#E0E7FF', color: '#4338CA', border: '1px solid #A5B4FC' }}
                                                        title="Cerrar Sorteo"
                                                    >
                                                        Cerrar
                                                    </button>
                                                )}

                                                {/* Ver / Administrar / Sortear */}
                                                <Link
                                                    href={`/admin/sorteos/${giveaway.id}`}
                                                    className="btn-icon"
                                                    title="Gestionar Sorteo, Premios y Ganadores"
                                                >
                                                    <Edit size={16} />
                                                </Link>

                                                {/* Eliminar */}
                                                <button
                                                    onClick={() => handleDelete(giveaway.id, giveaway.title)}
                                                    className="btn-icon"
                                                    style={{ color: '#EF4444' }}
                                                    title="Eliminar Sorteo"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
