'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WantedVehicle, StockDemandItem, WantedVehicleStatus, WantedVehicleCancellationReason, Vehicle } from '@/lib/types';
import { getWantedVehicles, getStockDemandSummary, updateWantedVehicleStatus, deleteWantedVehicle } from '@/lib/actions/wanted-vehicles';
import { formatARS } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { WhatsAppPreparationModal } from '@/components/admin/WhatsAppPreparationModal';
import { 
    SearchCheck, 
    Plus, 
    Search, 
    Filter, 
    Flame, 
    User, 
    Car, 
    Phone, 
    MessageCircle, 
    ArrowRight, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    AlertTriangle, 
    ChevronRight, 
    ArrowUpRight, 
    BarChart3, 
    TrendingUp,
    RefreshCw,
    Trash2,
    Eye,
    SlidersHorizontal,
    Sparkles,
    ShieldAlert,
    Globe,
    Building2
} from 'lucide-react';

export default function WantedVehiclesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'wanted' | 'demand'>('wanted');
    const [loading, setLoading] = useState(true);
    
    // Lista de Búsquedas
    const [wantedList, setWantedList] = useState<WantedVehicle[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('SEARCHING');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [sourceFilter, setSourceFilter] = useState('ALL');

    // Demanda de Stock
    const [stockDemand, setStockDemand] = useState<StockDemandItem[]>([]);
    const [loadingDemand, setLoadingDemand] = useState(false);

    // Modal de WhatsApp
    const [whatsappModalData, setWhatsappModalData] = useState<{
        isOpen: boolean;
        client: any;
        vehicle: Vehicle;
        wantedBrand?: string;
        wantedModel?: string;
    }>({
        isOpen: false,
        client: null,
        vehicle: null as any
    });

    // Modal de Cambio de Estado / Cancelación
    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        wanted: WantedVehicle | null;
        newStatus: WantedVehicleStatus;
        cancellationReason: WantedVehicleCancellationReason;
        notes: string;
    }>({
        isOpen: false,
        wanted: null,
        newStatus: 'SEARCHING',
        cancellationReason: 'BOUGHT_ELSEWHERE',
        notes: ''
    });

    // Cargar Búsquedas
    const fetchWantedList = async () => {
        setLoading(true);
        const res = await getWantedVehicles({
            search: searchQuery,
            status: statusFilter,
            priority: priorityFilter,
            source: sourceFilter,
            limit: 50
        });
        setWantedList(res.data);
        setTotalCount(res.total);
        setLoading(false);
    };

    // Cargar Demanda de Stock
    const fetchStockDemand = async () => {
        setLoadingDemand(true);
        const res = await getStockDemandSummary();
        setStockDemand(res);
        setLoadingDemand(false);
    };

    useEffect(() => {
        if (activeTab === 'wanted') {
            fetchWantedList();
        } else {
            fetchStockDemand();
        }
    }, [activeTab, statusFilter, priorityFilter, sourceFilter]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchWantedList();
    };

    // Confirmar cambio de estado o cancelación
    const handleConfirmStatusChange = async () => {
        if (!statusModal.wanted) return;

        await updateWantedVehicleStatus(statusModal.wanted.id, statusModal.newStatus, {
            cancellation_reason: statusModal.newStatus === 'CANCELLED' ? statusModal.cancellationReason : null,
            notes: statusModal.notes ? `${statusModal.wanted.notes || ''}\n[${new Date().toLocaleDateString('es-AR')}]: ${statusModal.notes}`.trim() : statusModal.wanted.notes,
            touchLastContact: true
        });

        setStatusModal(prev => ({ ...prev, isOpen: false, wanted: null }));
        fetchWantedList();
        if (activeTab === 'demand') fetchStockDemand();
    };

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`¿Eliminar la búsqueda ${code}?`)) return;
        await deleteWantedVehicle(id);
        fetchWantedList();
    };

    // Helper de badges de estado
    const getStatusBadge = (status: WantedVehicleStatus, reason?: string | null) => {
        switch (status) {
            case 'SEARCHING':
                return <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 800 }}>Buscando</span>;
            case 'CONTACTED':
                return <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 800 }}>Contactado</span>;
            case 'FOUND':
                return <span style={{ backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 800 }}>Encontrado</span>;
            case 'CLOSED':
                return <span style={{ backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 800 }}>Cerrado (Compró)</span>;
            case 'CANCELLED':
                const reasonLabel = reason === 'BOUGHT_ELSEWHERE' ? 'Compró en otro lado' 
                    : reason === 'DECIDED_NOT_TO_CHANGE' ? 'Ya no cambia' 
                    : reason === 'BUDGET_CHANGED' ? 'Cambió ppto' 
                    : 'Cancelado';
                return <span style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 800 }}>{reasonLabel}</span>;
            default:
                return null;
        }
    };

    // Helper de badges de prioridad
    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'HIGH':
                return <span style={{ color: '#EA580C', fontWeight: 800, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Flame size={14} /> Alta</span>;
            case 'MEDIUM':
                return <span style={{ color: '#334155', fontWeight: 700, fontSize: 12 }}>Media</span>;
            case 'LOW':
                return <span style={{ color: '#64748B', fontWeight: 600, fontSize: 12 }}>Baja</span>;
            default:
                return null;
        }
    };

    return (
        <div className="admin-page-container">
            {/* Header del Módulo */}
            <div className="admin-header-actions" style={{ marginBottom: 24 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#EA580C', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        <SearchCheck size={16} />
                        <span>Motor de Demanda & Match Comercial</span>
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', marginTop: 4 }}>
                        Vehículos Buscados
                    </h1>
                    <p style={{ color: '#64748B', fontSize: 13.5, marginTop: 2 }}>
                        Registrá los pedidos de clientes, detectá coincidencias automáticas en stock y contactá por WhatsApp.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <Link
                        href="/admin/vehiculos-buscados/nuevo"
                        className="btn-primary"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            backgroundColor: '#EA580C',
                            color: '#FFFFFF',
                            padding: '10px 18px',
                            borderRadius: 10,
                            fontWeight: 800,
                            fontSize: 13.5,
                            textDecoration: 'none',
                            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
                        }}
                    >
                        <Plus size={18} />
                        <span>Nuevo Pedido</span>
                    </Link>
                </div>
            </div>

            {/* Pestañas de Navegación del Módulo */}
            <div style={{
                display: 'flex',
                gap: 8,
                borderBottom: '2px solid #E2E8F0',
                marginBottom: 24
            }}>
                <button
                    onClick={() => setActiveTab('wanted')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 20px',
                        border: 'none',
                        background: 'transparent',
                        fontWeight: 800,
                        fontSize: 14,
                        color: activeTab === 'wanted' ? '#EA580C' : '#64748B',
                        borderBottom: activeTab === 'wanted' ? '3px solid #EA580C' : '3px solid transparent',
                        cursor: 'pointer',
                        marginBottom: -2,
                        transition: 'all 0.2s'
                    }}
                >
                    <SearchCheck size={18} />
                    <span>Búsquedas de Clientes</span>
                    {totalCount > 0 && (
                        <span style={{
                            backgroundColor: activeTab === 'wanted' ? '#EA580C' : '#E2E8F0',
                            color: activeTab === 'wanted' ? '#FFFFFF' : '#475569',
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 800
                        }}>
                            {totalCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('demand')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 20px',
                        border: 'none',
                        background: 'transparent',
                        fontWeight: 800,
                        fontSize: 14,
                        color: activeTab === 'demand' ? '#EA580C' : '#64748B',
                        borderBottom: activeTab === 'demand' ? '3px solid #EA580C' : '3px solid transparent',
                        cursor: 'pointer',
                        marginBottom: -2,
                        transition: 'all 0.2s'
                    }}
                >
                    <Flame size={18} style={{ color: '#EA580C' }} />
                    <span>Oportunidades & Demanda de Stock</span>
                </button>
            </div>

            {/* CONTENIDO PESTAÑA 1: LISTADO DE BÚSQUEDAS */}
            {activeTab === 'wanted' && (
                <div>
                    {/* Barra de Filtros y Búsqueda */}
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 14,
                        padding: '16px 20px',
                        border: '1px solid #E2E8F0',
                        marginBottom: 20,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 12,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}>
                        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 280 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #CBD5E1',
                                borderRadius: 10,
                                padding: '8px 12px',
                                flex: 1
                            }}>
                                <Search size={16} style={{ color: '#64748B' }} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar por cliente, marca, modelo, código..."
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        outline: 'none',
                                        fontSize: 13.5,
                                        width: '100%',
                                        color: '#0F172A'
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                style={{
                                    backgroundColor: '#0F172A',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '8px 16px',
                                    fontWeight: 700,
                                    fontSize: 13,
                                    cursor: 'pointer'
                                }}
                            >
                                Buscar
                            </button>
                        </form>

                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            {/* Filtro Estado */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                <span style={{ color: '#64748B', fontWeight: 600 }}>Estado:</span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        border: '1px solid #CBD5E1',
                                        backgroundColor: '#FFFFFF',
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: '#0F172A',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="SEARCHING">Buscando (Activas)</option>
                                    <option value="CONTACTED">Contactado</option>
                                    <option value="FOUND">Encontrado</option>
                                    <option value="CLOSED">Cerrado (Éxito)</option>
                                    <option value="CANCELLED">Cancelado / Baja</option>
                                    <option value="ALL">Todos los estados</option>
                                </select>
                            </div>

                            {/* Filtro Prioridad */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                <span style={{ color: '#64748B', fontWeight: 600 }}>Prioridad:</span>
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        border: '1px solid #CBD5E1',
                                        backgroundColor: '#FFFFFF',
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: '#0F172A',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="ALL">Todas</option>
                                    <option value="HIGH">Alta</option>
                                    <option value="MEDIUM">Media</option>
                                    <option value="LOW">Baja</option>
                                </select>
                            </div>

                            {/* Filtro Origen */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                <span style={{ color: '#64748B', fontWeight: 600 }}>Origen:</span>
                                <select
                                    value={sourceFilter}
                                    onChange={(e) => setSourceFilter(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        border: '1px solid #CBD5E1',
                                        backgroundColor: '#FFFFFF',
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: '#0F172A',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="ALL">Todos los orígenes</option>
                                    <option value="WEB">🌐 Solicitudes Web</option>
                                    <option value="ADMIN">🏢 Agencia / Internos</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Búsquedas */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>
                            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
                            <div>Cargando búsquedas de clientes...</div>
                        </div>
                    ) : wantedList.length === 0 ? (
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 16,
                            border: '1px dashed #CBD5E1',
                            padding: '60px 20px',
                            textAlign: 'center'
                        }}>
                            <SearchCheck size={40} style={{ color: '#94A3B8', margin: '0 auto 12px' }} />
                            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A' }}>No se encontraron búsquedas</h3>
                            <p style={{ color: '#64748B', fontSize: 14, maxWidth: 420, margin: '6px auto 18px' }}>
                                No hay pedidos registrados con los filtros seleccionados. Creá una nueva búsqueda para activar el motor de coincidencias.
                            </p>
                            <Link
                                href="/admin/vehiculos-buscados/nuevo"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    backgroundColor: '#EA580C',
                                    color: '#FFFFFF',
                                    padding: '10px 18px',
                                    borderRadius: 10,
                                    fontWeight: 700,
                                    fontSize: 13.5,
                                    textDecoration: 'none'
                                }}
                            >
                                <Plus size={16} />
                                <span>Cargar Primer Pedido</span>
                            </Link>
                        </div>
                    ) : (
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 16,
                            border: '1px solid #E2E8F0',
                            overflow: 'hidden',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 800, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        <th style={{ padding: '14px 18px' }}>Código / Cliente</th>
                                        <th style={{ padding: '14px 18px' }}>Vehículo Deseado</th>
                                        <th style={{ padding: '14px 18px' }}>Presupuesto</th>
                                        <th style={{ padding: '14px 18px' }}>Flexibilidad</th>
                                        <th style={{ padding: '14px 18px' }}>Permuta</th>
                                        <th style={{ padding: '14px 18px' }}>Prioridad</th>
                                        <th style={{ padding: '14px 18px' }}>Estado</th>
                                        <th style={{ padding: '14px 18px', textAlign: 'right' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {wantedList.map((w) => (
                                        <tr 
                                            key={w.id} 
                                            style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            {/* Código y Cliente */}
                                            <td style={{ padding: '16px 18px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C', fontFamily: 'monospace' }}>
                                                        {w.code}
                                                    </span>
                                                    {w.source === 'WEB' ? (
                                                        <span style={{
                                                            backgroundColor: '#EFF6FF',
                                                            color: '#1D4ED8',
                                                            border: '1px solid #BFDBFE',
                                                            padding: '1px 6px',
                                                            borderRadius: 4,
                                                            fontSize: 10,
                                                            fontWeight: 800,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 3
                                                        }}>
                                                            <Globe size={10} /> Web
                                                        </span>
                                                    ) : (
                                                        <span style={{
                                                            backgroundColor: '#F1F5F9',
                                                            color: '#475569',
                                                            border: '1px solid #CBD5E1',
                                                            padding: '1px 6px',
                                                            borderRadius: 4,
                                                            fontSize: 10,
                                                            fontWeight: 700,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 3
                                                        }}>
                                                            <Building2 size={10} /> Agencia
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontWeight: 800, color: '#0F172A', marginTop: 3 }}>
                                                    {w.client ? `${w.client.first_name} ${w.client.last_name}` : 'Cliente no asignado'}
                                                </div>
                                                {w.client?.phone && (
                                                    <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                        <Phone size={12} />
                                                        <span>{w.client.phone}</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Vehículo Deseado */}
                                            <td style={{ padding: '16px 18px' }}>
                                                <div style={{ fontWeight: 900, color: '#0F172A', fontSize: 14 }}>
                                                    {w.brand} {w.model} {w.version || ''}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                                                    Año: {w.year_min || 'Cualquiera'} - {w.year_max || 'Cualquiera'}
                                                    {w.transmission && ` • ${w.transmission}`}
                                                    {w.fuel_type && ` • ${w.fuel_type}`}
                                                </div>
                                            </td>

                                            {/* Presupuesto */}
                                            <td style={{ padding: '16px 18px' }}>
                                                <div style={{ fontWeight: 800, color: '#059669', fontSize: 14 }}>
                                                    {w.max_budget > 0 ? formatARS(w.max_budget) : 'Sin tope'}
                                                </div>
                                                {w.max_mileage ? (
                                                    <div style={{ fontSize: 11.5, color: '#64748B' }}>
                                                        Máx {w.max_mileage.toLocaleString('es-AR')} km
                                                    </div>
                                                ) : null}
                                            </td>

                                            {/* Flags de Flexibilidad */}
                                            <td style={{ padding: '16px 18px', fontSize: 12 }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <span style={{ color: w.accepts_similar_model ? '#059669' : '#94A3B8', fontWeight: 600 }}>
                                                        {w.accepts_similar_model ? '✓ Acepta similar' : '✗ Solo modelo exacto'}
                                                    </span>
                                                    <span style={{ color: w.accepts_nearby_year ? '#059669' : '#94A3B8', fontWeight: 600 }}>
                                                        {w.accepts_nearby_year ? '✓ Año cercano (+/-2)' : '✗ Año estricto'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Permuta */}
                                            <td style={{ padding: '16px 18px' }}>
                                                {w.has_trade_in ? (
                                                    <div>
                                                        <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                                                            Entrega Usado
                                                        </span>
                                                        <div style={{ fontSize: 11.5, color: '#475569', marginTop: 3, maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={w.trade_in_details || ''}>
                                                            {w.trade_in_details || 'Detalles no cargados'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#94A3B8', fontSize: 12 }}>No entrega</span>
                                                )}
                                            </td>

                                            {/* Prioridad */}
                                            <td style={{ padding: '16px 18px' }}>
                                                {getPriorityBadge(w.priority)}
                                            </td>

                                            {/* Estado */}
                                            <td style={{ padding: '16px 18px' }}>
                                                {getStatusBadge(w.status, w.cancellation_reason)}
                                                <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 4 }}>
                                                    {formatDate(w.last_contact_date || w.created_at)}
                                                </div>
                                            </td>

                                            {/* Acciones */}
                                            <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                                                    <Link
                                                        href={`/admin/vehiculos-buscados/${w.id}`}
                                                        title="Ver Coincidencias de Stock"
                                                        style={{
                                                            padding: '6px 10px',
                                                            borderRadius: 8,
                                                            border: '1px solid #CBD5E1',
                                                            backgroundColor: '#FFFFFF',
                                                            color: '#0F172A',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 4,
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        <Eye size={14} />
                                                        <span>Ver Stock</span>
                                                    </Link>

                                                    {/* Botón rápido cambiar estado */}
                                                    <button
                                                        onClick={() => setStatusModal({
                                                            isOpen: true,
                                                            wanted: w,
                                                            newStatus: w.status,
                                                            cancellationReason: (w.cancellation_reason as any) || 'BOUGHT_ELSEWHERE',
                                                            notes: ''
                                                        })}
                                                        title="Cambiar Estado / Dar de Baja"
                                                        style={{
                                                            padding: '6px 8px',
                                                            borderRadius: 8,
                                                            border: '1px solid #CBD5E1',
                                                            backgroundColor: '#F8FAFC',
                                                            color: '#475569',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <SlidersHorizontal size={14} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(w.id, w.code)}
                                                        title="Eliminar Búsqueda"
                                                        style={{
                                                            padding: '6px 8px',
                                                            borderRadius: 8,
                                                            border: '1px solid #FEE2E2',
                                                            backgroundColor: '#FEF2F2',
                                                            color: '#EF4444',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* CONTENIDO PESTAÑA 2: OPORTUNIDADES & DEMANDA DE STOCK */}
            {activeTab === 'demand' && (
                <div>
                    <div style={{
                        backgroundColor: '#FFF7ED',
                        border: '1px solid #FFEDD5',
                        borderRadius: 14,
                        padding: '16px 20px',
                        marginBottom: 24,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12
                    }}>
                        <Flame size={22} style={{ color: '#EA580C', flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 900, color: '#9A3412', margin: 0 }}>
                                Inteligencia de Demanda Comercial
                            </h3>
                            <p style={{ fontSize: 13, color: '#C2410C', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                                Este panel cruza tus vehículos actualmente en stock contra todas las búsquedas activas. Te permite identificar qué autos tienen salida inmediata y ayuda a tomar decisiones de compra y cotización de permutas.
                            </p>
                        </div>
                    </div>

                    {loadingDemand ? (
                        <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>
                            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
                            <div>Calculando matriz de demanda de clientes...</div>
                        </div>
                    ) : stockDemand.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 50, color: '#64748B' }}>
                            No hay vehículos en stock disponibles para cruzar con la demanda.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {stockDemand.map(({ vehicle, interestedCount, highMatchCount, topMatches }) => (
                                <div
                                    key={vehicle.id}
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: 16,
                                        border: highMatchCount > 0 ? '1.5px solid #FDBA74' : '1px solid #E2E8F0',
                                        padding: 20,
                                        boxShadow: highMatchCount > 0 ? '0 4px 20px rgba(234, 88, 12, 0.08)' : '0 2px 8px rgba(0,0,0,0.02)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid #F1F5F9', paddingBottom: 14, marginBottom: 14 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            {/* Miniatura del Auto */}
                                            <div style={{
                                                width: 64,
                                                height: 48,
                                                borderRadius: 8,
                                                overflow: 'hidden',
                                                backgroundColor: '#F1F5F9',
                                                flexShrink: 0
                                            }}>
                                                {vehicle.images && vehicle.images.length > 0 ? (
                                                    <img
                                                        src={vehicle.images.find(img => img.is_primary)?.url || vehicle.images[0].url}
                                                        alt={vehicle.model}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                                                        <Car size={20} />
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Link
                                                        href={`/admin/vehiculos/${vehicle.id}`}
                                                        style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', textDecoration: 'none' }}
                                                    >
                                                        {vehicle.brand} {vehicle.model} {vehicle.version || ''} ({vehicle.year})
                                                    </Link>
                                                    <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace' }}>
                                                        [{vehicle.stock_code}]
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
                                                    {vehicle.mileage === 0 ? '0 KM' : `${vehicle.mileage.toLocaleString('es-AR')} km`} • {vehicle.fuel_type} • {vehicle.transmission} • {formatARS(vehicle.sale_price)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Indicador de Demanda */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                backgroundColor: highMatchCount > 0 ? '#FFF7ED' : interestedCount > 0 ? '#F8FAFC' : '#F1F5F9',
                                                border: highMatchCount > 0 ? '1px solid #FFEDD5' : '1px solid #E2E8F0',
                                                padding: '6px 14px',
                                                borderRadius: 20,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6
                                            }}>
                                                {highMatchCount > 0 ? (
                                                    <>
                                                        <Flame size={16} style={{ color: '#EA580C' }} />
                                                        <span style={{ fontSize: 13, fontWeight: 800, color: '#C2410C' }}>
                                                            {interestedCount} clientes interesados ({highMatchCount} coincidencia alta)
                                                        </span>
                                                    </>
                                                ) : interestedCount > 0 ? (
                                                    <>
                                                        <Sparkles size={16} style={{ color: '#2563EB' }} />
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1E40AF' }}>
                                                            {interestedCount} clientes potenciales
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span style={{ fontSize: 12, color: '#64748B' }}>
                                                        Sin interesados registrados
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Listado de Clientes Coincidentes */}
                                    {topMatches.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                                            {topMatches.map((m, idx) => {
                                                const cl = m.wantedVehicle?.client;
                                                return (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            backgroundColor: m.score >= 80 ? '#F8FAFC' : '#FFFFFF',
                                                            border: m.score >= 80 ? '1px solid #CBD5E1' : '1px solid #E2E8F0',
                                                            borderRadius: 12,
                                                            padding: '12px 14px',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <span style={{
                                                                    backgroundColor: m.score >= 80 ? '#EA580C' : '#64748B',
                                                                    color: '#FFFFFF',
                                                                    fontSize: 11,
                                                                    fontWeight: 800,
                                                                    padding: '1px 6px',
                                                                    borderRadius: 10
                                                                }}>
                                                                    {m.score}%
                                                                </span>
                                                                <span style={{ fontWeight: 800, fontSize: 13.5, color: '#0F172A' }}>
                                                                    {cl ? `${cl.first_name} ${cl.last_name}` : 'Cliente'}
                                                                </span>
                                                            </div>
                                                            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 3 }}>
                                                                Ppto: {m.wantedVehicle?.max_budget ? formatARS(m.wantedVehicle.max_budget) : 'Sin tope'}
                                                                {m.wantedVehicle?.has_trade_in && ' • Tiene permuta'}
                                                            </div>
                                                        </div>

                                                        {/* Botón WhatsApp */}
                                                        {cl && (
                                                            <button
                                                                onClick={() => setWhatsappModalData({
                                                                    isOpen: true,
                                                                    client: cl,
                                                                    vehicle,
                                                                    wantedBrand: m.wantedVehicle?.brand,
                                                                    wantedModel: m.wantedVehicle?.model
                                                                })}
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: 6,
                                                                    backgroundColor: '#25D366',
                                                                    color: '#FFFFFF',
                                                                    border: 'none',
                                                                    padding: '7px 12px',
                                                                    borderRadius: 8,
                                                                    fontSize: 12,
                                                                    fontWeight: 800,
                                                                    cursor: 'pointer',
                                                                    boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)'
                                                                }}
                                                            >
                                                                <MessageCircle size={14} />
                                                                <span>WhatsApp</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: 12.5, color: '#94A3B8', fontStyle: 'italic' }}>
                                            No hay búsquedas de clientes compatibles con esta unidad actualmente.
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL DE CAMBIO DE ESTADO / CANCELACIÓN CON MOTIVOS */}
            {statusModal.isOpen && statusModal.wanted && (
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
                            Gestionar Estado del Pedido ({statusModal.wanted.code})
                        </h3>
                        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 18 }}>
                            {statusModal.wanted.brand} {statusModal.wanted.model} • {statusModal.wanted.client ? `${statusModal.wanted.client.first_name} ${statusModal.wanted.client.last_name}` : ''}
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

                            {/* Si es CANCELLED, seleccionar motivo obligatorio */}
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

            {/* MODAL DE PREPARACIÓN DE WHATSAPP */}
            {whatsappModalData.isOpen && whatsappModalData.client && whatsappModalData.vehicle && (
                <WhatsAppPreparationModal
                    isOpen={whatsappModalData.isOpen}
                    onClose={() => setWhatsappModalData(prev => ({ ...prev, isOpen: false }))}
                    client={whatsappModalData.client}
                    vehicle={whatsappModalData.vehicle}
                    wantedBrand={whatsappModalData.wantedBrand}
                    wantedModel={whatsappModalData.wantedModel}
                />
            )}
        </div>
    );
}
