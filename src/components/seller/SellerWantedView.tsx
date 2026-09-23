'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { WantedVehicle, Client, StockDemandItem } from '@/lib/types';
import { createSellerWantedVehicle, getSellerClients, createSellerClient } from '@/lib/actions/seller';
import { updateWantedVehicleStatus } from '@/lib/actions/wanted-vehicles';
import { formatARS } from '@/lib/utils/currency';
import { formatDate, formatRelativeContact } from '@/lib/utils/dates';
import { buildWhatsAppUrl } from '@/lib/utils/phone';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { SellerMatchesModal } from '@/components/seller/SellerMatchesModal';
import { SellerStatusModal } from '@/components/seller/SellerStatusModal';
import { 
    SearchCheck, 
    Plus, 
    X, 
    Car, 
    Calendar, 
    DollarSign, 
    Phone, 
    AlertCircle, 
    Check, 
    Loader2, 
    Globe, 
    Building2, 
    Flame, 
    Eye, 
    Search, 
    ArrowRight, 
    CheckCircle2, 
    TrendingUp,
    RefreshCw,
    MessageSquare,
    SlidersHorizontal,
    Clock,
    XCircle
} from 'lucide-react';

interface SellerWantedViewProps {
    initialWanted: WantedVehicle[];
    initialClients: Client[];
    initialDemand: StockDemandItem[];
}

export function SellerWantedView({ 
    initialWanted,
    initialClients,
    initialDemand
}: SellerWantedViewProps) {
    const [wantedList, setWantedList] = useState<WantedVehicle[]>(initialWanted);
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [stockDemand, setStockDemand] = useState<StockDemandItem[]>(initialDemand);
    
    // Pestaña activa: 'wanted' (Búsquedas de Clientes) o 'demand' (Oportunidades de Stock)
    const [activeTab, setActiveTab] = useState<'wanted' | 'demand'>('wanted');

    // Filtros
    const [search, setSearch] = useState('');
    const [sourceFilter, setSourceFilter] = useState<'ALL' | 'WEB' | 'ADMIN'>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
    const [priorityFilter, setPriorityFilter] = useState('ALL');

    // Modal de Coincidencias de Stock
    const [matchingWanted, setMatchingWanted] = useState<WantedVehicle | null>(null);

    // Modal de Gestión de Estado
    const [statusModalWanted, setStatusModalWanted] = useState<WantedVehicle | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    // Modal nuevo pedido
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState(initialClients[0]?.id || '');
    const [isNewClient, setIsNewClient] = useState(false);
    const [clientFirstName, setClientFirstName] = useState('');
    const [clientLastName, setClientLastName] = useState('');
    const [clientPhone, setClientPhone] = useState('');

    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [minYear, setMinYear] = useState('');
    const [maxYear, setMaxYear] = useState('');
    const [budget, setBudget] = useState('');
    const [transmission, setTransmission] = useState('');
    const [fuelType, setFuelType] = useState('');
    const [hasTradeIn, setHasTradeIn] = useState(false);
    const [tradeInDetails, setTradeInDetails] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Conteo por estados para los chips de filtro
    const counts = useMemo(() => {
        const total = wantedList.length;
        const active = wantedList.filter(w => w.status === 'SEARCHING' || w.status === 'CONTACTED' || w.status === 'FOUND').length;
        const searching = wantedList.filter(w => w.status === 'SEARCHING').length;
        const contacted = wantedList.filter(w => w.status === 'CONTACTED').length;
        const found = wantedList.filter(w => w.status === 'FOUND').length;
        const closed = wantedList.filter(w => w.status === 'CLOSED').length;
        const cancelled = wantedList.filter(w => w.status === 'CANCELLED').length;
        return { total, active, searching, contacted, found, closed, cancelled };
    }, [wantedList]);

    // Actualización de estado en memoria
    const handleStatusUpdated = (updated: WantedVehicle) => {
        setWantedList((prev) => prev.map((w) => (w.id === updated.id ? { ...w, ...updated } : w)));
    };

    // Apertura de WhatsApp con auto-actualización a "Contactado" si estaba en "Buscando"
    const handleWhatsAppClick = (e: React.MouseEvent, w: WantedVehicle, phone: string, initialMsg: string) => {
        e.stopPropagation();
        window.open(buildWhatsAppUrl(phone, initialMsg), '_blank');

        if (w.status === 'SEARCHING') {
            updateWantedVehicleStatus(w.id, 'CONTACTED', {
                touchLastContact: true,
                notes: w.notes 
                    ? `${w.notes}\n[${new Date().toLocaleDateString('es-AR')} - Salón]: Contactado por WhatsApp`.trim() 
                    : '[Salón]: Contactado por WhatsApp'
            }).then((res) => {
                if (res.success && res.data) {
                    handleStatusUpdated(res.data);
                }
            });
        }
    };

    // Filtrado de búsquedas
    const filteredWanted = useMemo(() => {
        return wantedList.filter((w) => {
            if (statusFilter === 'ACTIVE') {
                if (w.status !== 'SEARCHING' && w.status !== 'CONTACTED' && w.status !== 'FOUND') return false;
            } else if (statusFilter !== 'ALL' && w.status !== statusFilter) {
                return false;
            }

            if (sourceFilter !== 'ALL') {
                const isWeb = w.source === 'WEB';
                if (sourceFilter === 'WEB' && !isWeb) return false;
                if (sourceFilter === 'ADMIN' && isWeb) return false;
            }

            if (priorityFilter !== 'ALL' && w.priority !== priorityFilter) return false;

            if (search.trim()) {
                const q = search.toLowerCase().trim();
                const clientName = `${w.client?.first_name || ''} ${w.client?.last_name || ''}`.toLowerCase();
                const brandModel = `${w.brand} ${w.model}`.toLowerCase();
                const code = w.code?.toLowerCase() || '';
                const phone = w.client?.phone?.toLowerCase() || '';
                const trade = w.trade_in_details?.toLowerCase() || '';
                if (!clientName.includes(q) && !brandModel.includes(q) && !code.includes(q) && !phone.includes(q) && !trade.includes(q)) {
                    return false;
                }
            }

            return true;
        });
    }, [wantedList, search, sourceFilter, statusFilter, priorityFilter]);

    const activeCount = counts.active;

    // Crear nueva búsqueda
    const handleCreateWanted = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            let clientId = selectedClientId;

            if (isNewClient) {
                if (!clientFirstName.trim() || !clientLastName.trim() || !clientPhone.trim()) {
                    setError('Completá nombre, apellido y celular del cliente.');
                    setSubmitting(false);
                    return;
                }

                const newClientRes = await createSellerClient({
                    first_name: clientFirstName.trim(),
                    last_name: clientLastName.trim(),
                    phone: clientPhone.trim()
                });

                if (!newClientRes.success || !newClientRes.client) {
                    setError(newClientRes.error || 'No se pudo crear el cliente.');
                    setSubmitting(false);
                    return;
                }

                clientId = newClientRes.client.id;
                setClients((prev) => [newClientRes.client as Client, ...prev]);
            }

            if (!clientId) {
                setError('Seleccioná un cliente.');
                setSubmitting(false);
                return;
            }

            const numBudget = budget ? parseInt(budget.replace(/[^0-9]/g, ''), 10) : undefined;
            const numMinYear = minYear ? parseInt(minYear, 10) : undefined;
            const numMaxYear = maxYear ? parseInt(maxYear, 10) : undefined;

            const res = await createSellerWantedVehicle({
                client_id: clientId,
                brand: brand.trim(),
                model: model.trim(),
                min_year: numMinYear,
                max_year: numMaxYear,
                max_budget_ars: numBudget,
                transmission: transmission || undefined,
                fuel_type: fuelType || undefined,
                notes: notes.trim() || undefined
            });

            if (!res.success || !res.data) {
                setError(res.error || 'No se pudo registrar la búsqueda.');
                return;
            }

            setWantedList((prev) => [res.data as WantedVehicle, ...prev]);
            setIsCreateModalOpen(false);
            setBrand('');
            setModel('');
            setMinYear('');
            setMaxYear('');
            setBudget('');
            setTransmission('');
            setFuelType('');
            setHasTradeIn(false);
            setTradeInDetails('');
            setNotes('');
        } catch (err: any) {
            setError(err.message || 'Error al guardar búsqueda.');
        } finally {
            setSubmitting(false);
        }
    };

    // Renderizado del badge dinámico de estado
    const renderStatusBadge = (w: WantedVehicle) => {
        const openModal = (e: React.MouseEvent) => {
            e.stopPropagation();
            setStatusModalWanted(w);
            setIsStatusModalOpen(true);
        };

        switch (w.status) {
            case 'SEARCHING':
                return (
                    <button
                        type="button"
                        onClick={openModal}
                        title="Tocar para cambiar estado"
                        style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.35)',
                            color: '#60A5FA',
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                        }}
                    >
                        <Search size={11} />
                        <span>Buscando</span>
                    </button>
                );
            case 'CONTACTED':
                return (
                    <button
                        type="button"
                        onClick={openModal}
                        title="Tocar para cambiar estado"
                        style={{
                            backgroundColor: 'rgba(251, 191, 36, 0.15)',
                            border: '1px solid rgba(251, 191, 36, 0.35)',
                            color: '#FBBF24',
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                        }}
                    >
                        <MessageSquare size={11} />
                        <span>Contactado</span>
                    </button>
                );
            case 'FOUND':
                return (
                    <button
                        type="button"
                        onClick={openModal}
                        title="Tocar para cambiar estado"
                        style={{
                            backgroundColor: 'rgba(167, 139, 250, 0.15)',
                            border: '1px solid rgba(167, 139, 250, 0.35)',
                            color: '#C4B5FD',
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                        }}
                    >
                        <Car size={11} />
                        <span>Auto Ofrecido</span>
                    </button>
                );
            case 'CLOSED':
                return (
                    <button
                        type="button"
                        onClick={openModal}
                        title="Tocar para cambiar estado"
                        style={{
                            backgroundColor: 'rgba(52, 211, 153, 0.15)',
                            border: '1px solid rgba(52, 211, 153, 0.35)',
                            color: '#34D399',
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                        }}
                    >
                        <CheckCircle2 size={11} />
                        <span>Cerrado (Compró)</span>
                    </button>
                );
            case 'CANCELLED':
                const reasonLabel = w.cancellation_reason === 'BOUGHT_ELSEWHERE' ? 'Compró afuera'
                    : w.cancellation_reason === 'DECIDED_NOT_TO_CHANGE' ? 'Ya no cambia'
                    : w.cancellation_reason === 'BUDGET_CHANGED' ? 'Cambió ppto'
                    : w.cancellation_reason === 'FOUND_WITH_US' ? 'Compró con nosotros'
                    : 'Descartado';
                return (
                    <button
                        type="button"
                        onClick={openModal}
                        title="Tocar para cambiar estado"
                        style={{
                            backgroundColor: 'rgba(248, 113, 113, 0.12)',
                            border: '1px solid rgba(248, 113, 113, 0.3)',
                            color: '#F87171',
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                        }}
                    >
                        <XCircle size={11} />
                        <span>{reasonLabel}</span>
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            {/* ENCABEZADO */}
            <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                        <div style={{ fontSize: 10.5, fontWeight: 900, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                            Motor de Demanda & Match
                        </div>
                        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: -0.5 }}>
                            Vehículos Buscados
                        </h1>
                    </div>

                    <button
                        onClick={() => {
                            setError(null);
                            setIsCreateModalOpen(true);
                        }}
                        style={{
                            backgroundColor: '#EA580C',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 10,
                            padding: '8px 14px',
                            fontSize: 12.5,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                            boxShadow: '0 3px 10px rgba(234, 88, 12, 0.35)'
                        }}
                    >
                        <Plus size={16} />
                        <span>Nuevo Pedido</span>
                    </button>
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>
                    Clientes que buscan autos desde la web o en salón. Detectá coincidencias y respondeles por WhatsApp.
                </div>
            </div>

            {/* PESTAÑAS PRINCIPALES */}
            <div
                style={{
                    display: 'flex',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: 14,
                    gap: 8
                }}
            >
                <button
                    onClick={() => setActiveTab('wanted')}
                    style={{
                        padding: '10px 14px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'wanted' ? '2px solid #EA580C' : '2px solid transparent',
                        color: activeTab === 'wanted' ? '#FFFFFF' : '#94A3B8',
                        fontSize: 13,
                        fontWeight: activeTab === 'wanted' ? 800 : 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer'
                    }}
                >
                    <SearchCheck size={16} style={{ color: activeTab === 'wanted' ? '#EA580C' : '#94A3B8' }} />
                    <span>Búsquedas de Clientes</span>
                    <span
                        style={{
                            backgroundColor: activeTab === 'wanted' ? '#EA580C' : 'rgba(255, 255, 255, 0.1)',
                            color: '#FFFFFF',
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '1px 7px',
                            borderRadius: 10
                        }}
                    >
                        {activeCount}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('demand')}
                    style={{
                        padding: '10px 14px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'demand' ? '2px solid #EA580C' : '2px solid transparent',
                        color: activeTab === 'demand' ? '#FFFFFF' : '#94A3B8',
                        fontSize: 13,
                        fontWeight: activeTab === 'demand' ? 800 : 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer'
                    }}
                >
                    <Flame size={16} style={{ color: activeTab === 'demand' ? '#EF4444' : '#94A3B8' }} />
                    <span>Demanda de Stock</span>
                </button>
            </div>

            {/* TAB 1: BÚSQUEDAS DE CLIENTES */}
            {activeTab === 'wanted' && (
                <div>
                    {/* BUSCADOR */}
                    <div style={{ position: 'relative', marginBottom: 10 }}>
                        <Search
                            size={16}
                            style={{
                                position: 'absolute',
                                left: 14,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#64748B'
                            }}
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por cliente, marca, modelo, código..."
                            style={{
                                width: '100%',
                                backgroundColor: '#111622',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 12,
                                padding: '10px 40px 10px 40px',
                                color: '#FFFFFF',
                                fontSize: 13.5,
                                outline: 'none'
                            }}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                style={{
                                    position: 'absolute',
                                    right: 12,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#94A3B8',
                                    padding: 4,
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    {/* FILTROS RÁPIDOS */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 6,
                            overflowX: 'auto',
                            paddingBottom: 8,
                            marginBottom: 14,
                            scrollbarWidth: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        {/* Filtro Origen */}
                        {[
                            { label: 'Todos los orígenes', val: 'ALL' },
                            { label: '🌐 Web / Landing', val: 'WEB' },
                            { label: '🏢 Salón', val: 'ADMIN' }
                        ].map((chip) => {
                            const active = sourceFilter === chip.val;
                            return (
                                <button
                                    key={chip.val}
                                    type="button"
                                    onClick={() => setSourceFilter(chip.val as any)}
                                    style={{
                                        whiteSpace: 'nowrap',
                                        padding: '5px 11px',
                                        borderRadius: 20,
                                        fontSize: 11.5,
                                        fontWeight: 700,
                                        border: active ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                                        backgroundColor: active ? 'rgba(56, 189, 248, 0.2)' : '#111622',
                                        color: active ? '#38BDF8' : '#94A3B8',
                                        cursor: 'pointer',
                                        flexShrink: 0
                                    }}
                                >
                                    {chip.label}
                                </button>
                            );
                        })}

                        <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)', alignSelf: 'center', margin: '0 4px', flexShrink: 0 }} />

                        {/* Filtro Estado Dinámico con Conteo */}
                        {[
                            { label: `Activas (${counts.active})`, val: 'ACTIVE', color: '#EA580C' },
                            { label: `🔍 Buscando (${counts.searching})`, val: 'SEARCHING', color: '#60A5FA' },
                            { label: `💬 Contactados (${counts.contacted})`, val: 'CONTACTED', color: '#FBBF24' },
                            { label: `🚗 Ofrecido (${counts.found})`, val: 'FOUND', color: '#A78BFA' },
                            { label: `🏁 Cerrados (${counts.closed})`, val: 'CLOSED', color: '#34D399' },
                            { label: `❌ Descartados (${counts.cancelled})`, val: 'CANCELLED', color: '#F87171' },
                            { label: `Todas (${counts.total})`, val: 'ALL', color: '#94A3B8' }
                        ].map((chip) => {
                            const active = statusFilter === chip.val;
                            return (
                                <button
                                    key={chip.val}
                                    type="button"
                                    onClick={() => setStatusFilter(chip.val)}
                                    style={{
                                        whiteSpace: 'nowrap',
                                        padding: '5px 11px',
                                        borderRadius: 20,
                                        fontSize: 11.5,
                                        fontWeight: 700,
                                        border: active ? `1px solid ${chip.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                                        backgroundColor: active ? chip.color : '#111622',
                                        color: active ? (chip.val === 'CONTACTED' ? '#0B0E14' : '#FFFFFF') : '#94A3B8',
                                        cursor: 'pointer',
                                        flexShrink: 0
                                    }}
                                >
                                    {chip.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* LISTADO DE PEDIDOS DE CLIENTES */}
                    {filteredWanted.length === 0 ? (
                        <div
                            style={{
                                backgroundColor: '#111622',
                                borderRadius: 16,
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                padding: '40px 20px',
                                textAlign: 'center',
                                color: '#94A3B8'
                            }}
                        >
                            <SearchCheck size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                            <p style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                                No se encontraron pedidos con estos filtros
                            </p>
                            <p style={{ fontSize: 13, margin: '0 0 16px 0' }}>
                                Probá cambiando el origen o limpiando la búsqueda.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {filteredWanted.map((w) => {
                                const isWeb = w.source === 'WEB';
                                const clientName = w.client ? `${w.client.first_name} ${w.client.last_name}` : 'Cliente Web';
                                const phone = w.client?.phone || w.client?.whatsapp;

                                // Armar mensaje de WhatsApp predeterminado para el vendedor
                                const yearRangeText = w.year_min && w.year_max
                                    ? `(${w.year_min}-${w.year_max})`
                                    : w.year_max
                                    ? `(hasta ${w.year_max})`
                                    : '';

                                const initialMessage = `Hola ${w.client?.first_name || ''}, te escribo de *Special Cars* por el vehículo que estás buscando (${w.brand} ${w.model} ${yearRangeText}). ¿Cómo estás? Te comento que estamos activamente con tu búsqueda.`;

                                return (
                                    <div
                                        key={w.id}
                                        style={{
                                            backgroundColor: '#111622',
                                            borderRadius: 16,
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            padding: 14,
                                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 10
                                        }}
                                    >
                                        {/* FILA SUPERIOR: CÓDIGO + BADGES DE ORIGEN Y ESTADO */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span
                                                    style={{
                                                        fontFamily: 'var(--font-mono)',
                                                        fontSize: 12,
                                                        fontWeight: 800,
                                                        color: '#FB923C'
                                                    }}
                                                >
                                                    {w.code}
                                                </span>

                                                {/* Badge Origen */}
                                                {isWeb ? (
                                                    <span
                                                        style={{
                                                            backgroundColor: 'rgba(56, 189, 248, 0.15)',
                                                            border: '1px solid rgba(56, 189, 248, 0.35)',
                                                            color: '#38BDF8',
                                                            fontSize: 10.5,
                                                            fontWeight: 800,
                                                            padding: '2px 7px',
                                                            borderRadius: 6,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 4
                                                        }}
                                                    >
                                                        <Globe size={11} />
                                                        <span>Web / Landing</span>
                                                    </span>
                                                ) : (
                                                    <span
                                                        style={{
                                                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                                            border: '1px solid rgba(255, 255, 255, 0.12)',
                                                            color: '#94A3B8',
                                                            fontSize: 10.5,
                                                            fontWeight: 800,
                                                            padding: '2px 7px',
                                                            borderRadius: 6,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 4
                                                        }}
                                                    >
                                                        <Building2 size={11} />
                                                        <span>Salón</span>
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {w.priority === 'HIGH' && (
                                                    <span
                                                        style={{
                                                            color: '#F87171',
                                                            fontSize: 11,
                                                            fontWeight: 800,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 3
                                                        }}
                                                    >
                                                        <Flame size={12} />
                                                        <span>Alta</span>
                                                    </span>
                                                )}

                                                {renderStatusBadge(w)}
                                            </div>
                                        </div>

                                        {/* CLIENTE Y TELÉFONO */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: 10 }}>
                                            <div>
                                                <div style={{ fontSize: 15, fontWeight: 900, color: '#FFFFFF' }}>
                                                    {clientName}
                                                </div>
                                                {phone && (
                                                    <div style={{ fontSize: 12.5, color: '#94A3B8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Phone size={12} style={{ color: '#64748B' }} />
                                                        <span>{phone}</span>
                                                    </div>
                                                )}
                                                {w.last_contact_date && (
                                                    <div style={{ fontSize: 11, color: '#FBBF24', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                                                        <Clock size={11} />
                                                        <span>Último contacto: {formatRelativeContact(w.last_contact_date)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* BOTONES DIRECTOS PARA RESPONDERLE */}
                                            {phone && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                                    <a
                                                        href={`tel:${phone}`}
                                                        title="Llamar al cliente"
                                                        style={{
                                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                            color: '#FFFFFF',
                                                            borderRadius: '50%',
                                                            width: 36,
                                                            height: 36,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        <Phone size={15} />
                                                    </a>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleWhatsAppClick(e, w, phone, initialMessage)}
                                                        title="Responder por WhatsApp (marca como contactado automáticamente)"
                                                        style={{
                                                            backgroundColor: '#25D366',
                                                            borderRadius: '50%',
                                                            width: 36,
                                                            height: 36,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            boxShadow: '0 2px 8px rgba(37, 211, 102, 0.35)',
                                                            border: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <WhatsAppIcon size={18} color="#FFFFFF" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* VEHÍCULO DESEADO */}
                                        <div style={{ padding: '0 2px' }}>
                                            <div style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF' }}>
                                                {w.brand} {w.model}
                                            </div>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4, fontSize: 12, color: '#CBD5E1' }}>
                                                <span>
                                                    Año: <strong>{w.year_min ? w.year_min : 'Cualquiera'} - {w.year_max ? w.year_max : 'Actual'}</strong>
                                                </span>

                                                <span>•</span>

                                                <span>
                                                    Presupuesto: <strong style={{ color: w.max_budget > 0 ? '#FB923C' : '#34D399' }}>
                                                        {w.max_budget > 0 ? formatARS(w.max_budget) : 'Sin tope'}
                                                    </strong>
                                                </span>
                                            </div>
                                        </div>

                                        {/* PERMUTA Y FLEXIBILIDAD */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                                            {/* Permuta */}
                                            {w.has_trade_in ? (
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                                    <span
                                                        style={{
                                                            backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                                            color: '#60A5FA',
                                                            fontSize: 10.5,
                                                            fontWeight: 800,
                                                            padding: '2px 6px',
                                                            borderRadius: 4,
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        Entrega Usado
                                                    </span>
                                                    <span style={{ color: '#E2E8F0', fontStyle: 'italic' }}>
                                                        {w.trade_in_details || 'Detalles no especificados'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div style={{ color: '#64748B', fontSize: 11.5 }}>
                                                    No entrega usado
                                                </div>
                                            )}

                                            {/* Flexibilidad */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, color: '#10B981', fontSize: 11.5, fontWeight: 600 }}>
                                                {w.accepts_similar_model && <span>✓ Acepta similar</span>}
                                                {w.accepts_nearby_year && <span>✓ Año cercano (+/-2)</span>}
                                            </div>
                                        </div>

                                        {/* NOTAS RECIENTES DE SEGUIMIENTO */}
                                        {w.notes && (
                                            <div
                                                style={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                                    borderLeft: '2px solid rgba(251, 146, 60, 0.6)',
                                                    padding: '5px 9px',
                                                    borderRadius: 4,
                                                    fontSize: 11.5,
                                                    color: '#94A3B8',
                                                    fontStyle: 'italic',
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 6
                                                }}
                                            >
                                                <span>📝</span>
                                                <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.35 }}>
                                                    {w.notes.split('\n').filter(Boolean).slice(-1)[0]}
                                                </span>
                                            </div>
                                        )}

                                        {/* ACCIONES DEL VENDEDOR */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 8, marginTop: 4, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                            <button
                                                type="button"
                                                onClick={() => setMatchingWanted(w)}
                                                style={{
                                                    backgroundColor: 'rgba(234, 88, 12, 0.15)',
                                                    border: '1px solid #EA580C',
                                                    color: '#FB923C',
                                                    borderRadius: 10,
                                                    padding: '10px 12px',
                                                    fontSize: 12.5,
                                                    fontWeight: 800,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 6,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Eye size={15} />
                                                <span>Coincidencias</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setStatusModalWanted(w);
                                                    setIsStatusModalOpen(true);
                                                }}
                                                style={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                                    color: '#F1F5F9',
                                                    borderRadius: 10,
                                                    padding: '10px 12px',
                                                    fontSize: 12.5,
                                                    fontWeight: 800,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 6,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <SlidersHorizontal size={14} />
                                                <span>Estado</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: OPORTUNIDADES & DEMANDA DE STOCK */}
            {activeTab === 'demand' && (
                <div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
                        Autos del inventario que tienen clientes registrados buscándolos. Contactalos para ofrecerles la unidad:
                    </div>

                    {stockDemand.filter(d => d.interestedCount > 0).length === 0 ? (
                        <div
                            style={{
                                backgroundColor: '#111622',
                                borderRadius: 16,
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                padding: '40px 20px',
                                textAlign: 'center',
                                color: '#94A3B8'
                            }}
                        >
                            <TrendingUp size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                            <p style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                                No hay demanda cruzada en este momento
                            </p>
                            <p style={{ fontSize: 13, margin: 0 }}>
                                A medida que los clientes dejen pedidos en la web, el sistema detectará coincidencias con el stock automáticamente.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {stockDemand.filter(d => d.interestedCount > 0).map((d) => {
                                const mainImg = d.vehicle.images?.find(i => i.is_primary)?.url || d.vehicle.images?.[0]?.url;

                                return (
                                    <div
                                        key={d.vehicle.id}
                                        style={{
                                            backgroundColor: '#111622',
                                            borderRadius: 16,
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            padding: 14,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <div
                                                style={{
                                                    position: 'relative',
                                                    width: 74,
                                                    height: 64,
                                                    borderRadius: 8,
                                                    overflow: 'hidden',
                                                    backgroundColor: '#05070B',
                                                    flexShrink: 0
                                                }}
                                            >
                                                {mainImg ? (
                                                    <Image src={mainImg} alt="Auto" fill sizes="74px" style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                                        <Car size={24} />
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ fontSize: 15, fontWeight: 900, color: '#FFFFFF' }}>
                                                    {d.vehicle.brand} {d.vehicle.model}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#94A3B8' }}>
                                                    {d.vehicle.year} • {formatARS(d.vehicle.sale_price)}
                                                </div>
                                                <div
                                                    style={{
                                                        marginTop: 4,
                                                        fontSize: 11.5,
                                                        fontWeight: 800,
                                                        color: '#FB923C',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 4
                                                    }}
                                                >
                                                    <Flame size={13} style={{ color: '#EF4444' }} />
                                                    <span>{d.interestedCount} {d.interestedCount === 1 ? 'cliente esperando' : 'clientes esperando'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Top Clientes Interesados */}
                                        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                                                Clientes Compatibles:
                                            </div>

                                            {d.topMatches.map((m, idx) => {
                                                if (!m.wantedVehicle) return null;
                                                const wVeh = m.wantedVehicle;
                                                const phone = wVeh.client?.phone || wVeh.client?.whatsapp;

                                                return (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                                            borderRadius: 8,
                                                            padding: '8px 10px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            gap: 8
                                                        }}
                                                    >
                                                        <div>
                                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>
                                                                {wVeh.client?.first_name} {wVeh.client?.last_name}
                                                            </div>
                                                            <div style={{ fontSize: 11, color: '#94A3B8' }}>
                                                                Busca: {wVeh.brand} {wVeh.model} ({m.score}% coincidencia)
                                                            </div>
                                                        </div>

                                                        {phone && (
                                                            <a
                                                                href={buildWhatsAppUrl(
                                                                    phone,
                                                                    `Hola ${wVeh.client?.first_name || ''}, te escribo de Special Cars por el ${wVeh.brand} ${wVeh.model} que estás buscando. Tenemos disponible un ${d.vehicle.brand} ${d.vehicle.model} (${d.vehicle.year}) en el salón. ¿Te gustaría que te pase las fotos y precio?`
                                                                )}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    backgroundColor: '#25D366',
                                                                    borderRadius: '50%',
                                                                    width: 32,
                                                                    height: 32,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    boxShadow: '0 2px 6px rgba(37, 211, 102, 0.35)',
                                                                    textDecoration: 'none'
                                                                }}
                                                            >
                                                                <WhatsAppIcon size={16} color="#FFFFFF" />
                                                            </a>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL COINCIDENCIAS EN STOCK */}
            <SellerMatchesModal
                isOpen={!!matchingWanted}
                wanted={matchingWanted}
                onClose={() => setMatchingWanted(null)}
            />

            {/* MODAL GESTIONAR ESTADO */}
            <SellerStatusModal
                isOpen={isStatusModalOpen}
                wanted={statusModalWanted}
                onClose={() => {
                    setIsStatusModalOpen(false);
                    setStatusModalWanted(null);
                }}
                onStatusUpdated={handleStatusUpdated}
            />
        </div>
    );
}
