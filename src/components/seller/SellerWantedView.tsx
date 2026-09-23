'use client';

import { useState } from 'react';
import { WantedVehicle, Client } from '@/lib/types';
import { createSellerWantedVehicle, getSellerClients, createSellerClient } from '@/lib/actions/seller';
import { formatARS } from '@/lib/utils/currency';
import { buildWhatsAppUrl } from '@/lib/utils/phone';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
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
    Loader2 
} from 'lucide-react';

export function SellerWantedView({ 
    initialWanted,
    initialClients
}: { 
    initialWanted: WantedVehicle[];
    initialClients: Client[];
}) {
    const [wantedList, setWantedList] = useState<WantedVehicle[]>(initialWanted);
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Modal nuevo pedido
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
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filteredWanted = wantedList.filter((w) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase().trim();
        const clientName = `${w.client?.first_name || ''} ${w.client?.last_name || ''}`.toLowerCase();
        const brandModel = `${w.brand} ${w.model}`.toLowerCase();
        return clientName.includes(q) || brandModel.includes(q);
    });

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
            setIsModalOpen(false);
            setBrand('');
            setModel('');
            setMinYear('');
            setMaxYear('');
            setBudget('');
            setTransmission('');
            setFuelType('');
            setNotes('');
        } catch (err: any) {
            setError(err.message || 'Error al guardar búsqueda.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            {/* ENCABEZADO */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: -0.5 }}>
                        Autos Buscados
                    </h1>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>
                        {filteredWanted.length} pedidos activos de clientes
                    </div>
                </div>

                <button
                    onClick={() => {
                        setError(null);
                        setIsModalOpen(true);
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

            {/* LISTA */}
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
                        No hay pedidos de búsqueda registrados
                    </p>
                    <p style={{ fontSize: 13, margin: '0 0 16px 0' }}>
                        Cuando un cliente busque un auto que no esté en stock, cargalo acá para avisarle cuando ingrese.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            backgroundColor: '#EA580C',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 16px',
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        + Cargar Pedido de Auto
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filteredWanted.map((w) => (
                        <div
                            key={w.id}
                            style={{
                                backgroundColor: '#111622',
                                borderRadius: 14,
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                padding: 14,
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>
                                        {w.brand} {w.model}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                                        Cliente: <strong style={{ color: '#E2E8F0' }}>{w.client ? `${w.client.first_name} ${w.client.last_name}` : 'Anónimo'}</strong>
                                    </div>
                                </div>

                                {w.client?.phone && (
                                    <a
                                        href={buildWhatsAppUrl(
                                            w.client.phone,
                                            `Hola ${w.client.first_name}, te escribo de Special Cars por el ${w.brand} ${w.model} que estás buscando. ¿Cómo estás?`
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            backgroundColor: '#25D366',
                                            borderRadius: '50%',
                                            width: 34,
                                            height: 34,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 6px rgba(37, 211, 102, 0.35)',
                                            textDecoration: 'none',
                                            flexShrink: 0
                                        }}
                                    >
                                        <WhatsAppIcon size={16} color="#FFFFFF" />
                                    </a>
                                )}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 6,
                                    fontSize: 11.5,
                                    color: '#CBD5E1',
                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                    padding: '8px 10px',
                                    borderRadius: 8
                                }}
                            >
                                {(w.year_min || w.year_max) && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <Calendar size={12} style={{ color: '#94A3B8' }} />
                                        <span>{w.year_min || '...'} a {w.year_max || '...'}</span>
                                    </span>
                                )}
                                {w.max_budget > 0 && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#FB923C', fontWeight: 700 }}>
                                        <DollarSign size={12} />
                                        <span>Hasta {formatARS(w.max_budget)}</span>
                                    </span>
                                )}
                                {w.transmission && (
                                    <span>• {w.transmission}</span>
                                )}
                            </div>

                            {w.notes && (
                                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, fontStyle: 'italic' }}>
                                    "{w.notes}"
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL NUEVA BÚSQUEDA */}
            {isModalOpen && (
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
                        if (e.target === e.currentTarget) setIsModalOpen(false);
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
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                                Registrar Pedido de Auto
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', padding: 10, borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreateWanted} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* CLIENTE */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1' }}>Cliente</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsNewClient(!isNewClient)}
                                        style={{ background: 'none', border: 'none', color: '#FB923C', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        {isNewClient ? 'Seleccionar existente' : '+ Nuevo cliente'}
                                    </button>
                                </div>

                                {isNewClient ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, backgroundColor: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                            <input
                                                type="text"
                                                placeholder="Nombre *"
                                                value={clientFirstName}
                                                onChange={(e) => setClientFirstName(e.target.value)}
                                                required
                                                style={{ backgroundColor: '#0B0E14', border: '1px solid #334155', borderRadius: 6, padding: '8px 10px', color: '#FFF', fontSize: 13 }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Apellido *"
                                                value={clientLastName}
                                                onChange={(e) => setClientLastName(e.target.value)}
                                                required
                                                style={{ backgroundColor: '#0B0E14', border: '1px solid #334155', borderRadius: 6, padding: '8px 10px', color: '#FFF', fontSize: 13 }}
                                            />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="Celular / WhatsApp *"
                                            value={clientPhone}
                                            onChange={(e) => setClientPhone(e.target.value)}
                                            required
                                            style={{ backgroundColor: '#0B0E14', border: '1px solid #334155', borderRadius: 6, padding: '8px 10px', color: '#FFF', fontSize: 13 }}
                                        />
                                    </div>
                                ) : (
                                    <select
                                        value={selectedClientId}
                                        onChange={(e) => setSelectedClientId(e.target.value)}
                                        style={{ width: '100%', backgroundColor: '#0B0E14', border: '1px solid #334155', borderRadius: 8, padding: '9px 12px', color: '#FFF', fontSize: 13.5 }}
                                    >
                                        {clients.map((c) => (
                                            <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* MARCA Y MODELO */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>Marca *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Toyota"
                                        required
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        style={{ width: '100%', backgroundColor: '#0B0E14', border: '1px solid #334155', borderRadius: 8, padding: '9px 12px', color: '#FFF', fontSize: 13.5 }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>Modelo *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Hilux"
                                        required
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        style={{ width: '100%', backgroundColor: '#0B0E14', border: '1px solid #334155', borderRadius: 8, padding: '9px 12px', color: '#FFF', fontSize: 13.5 }}
                                    />
                                </div>
                            </div>

                            {/* AÑOS */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>Año Mínimo</label>
                                    <input
                                        type="number"
                                        placeholder="Ej: 2019"
                                        value={minYear}
                                        onChange={(e) => setMinYear(e.target.value)}
                                        style={{ width: '100%', backgroundColor: '#0B0E14', border: '1px solid #334155', borderRadius: 8, padding: '9px 12px', color: '#FFF', fontSize: 13.5 }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>Año Máximo</label>
                                    <input
                                        type="number"
                                        placeholder="Ej: 2024"
                                        value={maxYear}
                                        onChange={(e) => setMaxYear(e.target.value)}
                                        style={{ width: '100%', backgroundColor: '#0B0E14', border: '1px solid #334155', borderRadius: 8, padding: '9px 12px', color: '#FFF', fontSize: 13.5 }}
                                    />
                                </div>
                            </div>

                            {/* PRESUPUESTO */}
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>Presupuesto Máximo (ARS)</label>
                                <input
                                    type="text"
                                    placeholder="Ej: 35000000"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    style={{ width: '100%', backgroundColor: '#0B0E14', border: '1px solid #334155', borderRadius: 8, padding: '9px 12px', color: '#F59E0B', fontSize: 15, fontWeight: 700 }}
                                />
                            </div>

                            {/* NOTAS */}
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>Observaciones</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Prefiere color blanco, entrega usado en parte de pago"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    style={{ width: '100%', backgroundColor: '#0B0E14', border: '1px solid #334155', borderRadius: 8, padding: '9px 12px', color: '#FFF', fontSize: 13 }}
                                />
                            </div>

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
                                    marginTop: 6
                                }}
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                <span>Guardar Pedido</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
