'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getClients } from '@/lib/actions/clients';
import { getAdminVehicles } from '@/lib/actions/vehicles';
import { createConsignment } from '@/lib/actions/consignments';
import { Client, Vehicle } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';
import { ArrowLeft, Save, AlertCircle, Plus } from 'lucide-react';

export default function NewConsignmentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [clients, setClients] = useState<Client[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    const [clientId, setClientId] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [requestedPrice, setRequestedPrice] = useState<number>(0);
    const [listingPrice, setListingPrice] = useState<number>(0);
    const [expiryDate, setExpiryDate] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const load = async () => {
            const [cliRes, vehRes] = await Promise.all([
                getClients({ limit: 100 }),
                getAdminVehicles({ limit: 100 })
            ]);
            setClients(cliRes.data);
            setVehicles(vehRes.data);
        };
        load();
    }, []);

    const estimatedCommission = listingPrice > requestedPrice ? listingPrice - requestedPrice : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId || !vehicleId || requestedPrice <= 0 || listingPrice <= 0) {
            setError('Por favor completá cliente, vehículo y los precios.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await createConsignment({
                client_id: clientId,
                vehicle_id: vehicleId,
                requested_price: requestedPrice,
                listing_price: listingPrice,
                expiry_date: expiryDate || undefined,
                notes: notes || undefined
            });

            if (!res.success) {
                setError(res.error || 'Error creando consignación');
                setLoading(false);
                return;
            }

            router.push('/admin/consignaciones');
        } catch (err: any) {
            setError(err.message || 'Error inesperado');
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ marginBottom: 20 }}>
                <Link href="/admin/consignaciones" style={{ fontSize: 13, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <ArrowLeft size={14} />
                    <span>Volver a Consignaciones</span>
                </Link>
                <h1 className="admin-page-title">Nueva Consignación</h1>
                <p className="admin-page-desc">Registrá un vehículo que un cliente deja para que la agencia lo comercialice.</p>
            </div>

            {error && (
                <div className="alert-banner danger" style={{ marginBottom: 20 }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="table-container" style={{ padding: 32 }}>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Cliente Propietario *</label>
                        <select
                            className="form-select"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            required
                        >
                            <option value="">-- Seleccionar Cliente --</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.first_name} {c.last_name} {c.dni ? `(DNI: ${c.dni})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Vehículo en Inventario *</label>
                        <select
                            className="form-select"
                            value={vehicleId}
                            onChange={(e) => {
                                setVehicleId(e.target.value);
                                const veh = vehicles.find(v => v.id === e.target.value);
                                if (veh) {
                                    setListingPrice(veh.sale_price);
                                    setRequestedPrice(veh.purchase_price || veh.sale_price * 0.9);
                                }
                            }}
                            required
                        >
                            <option value="">-- Seleccionar Vehículo --</option>
                            {vehicles.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.stock_code} — {v.brand} {v.model} ({v.year}) {v.plate ? `[${v.plate}]` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Precio Solicitado por el Dueño ($ ARS) *</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="Monto a pagar al dueño al venderse"
                            value={requestedPrice || ''}
                            onChange={(e) => setRequestedPrice(parseInt(e.target.value, 10) || 0)}
                            required
                        />
                        <span className="form-help">Dueño recibe: {formatARS(requestedPrice)}</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Precio de Publicación en Web ($ ARS) *</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="Precio final de oferta al público"
                            value={listingPrice || ''}
                            onChange={(e) => setListingPrice(parseInt(e.target.value, 10) || 0)}
                            required
                        />
                        <span className="form-help" style={{ color: '#34d399', fontWeight: 600 }}>
                            Publicación: {formatARS(listingPrice)}
                        </span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Fecha de Vencimiento de la Consignación</label>
                        <input
                            type="date"
                            className="form-input"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Cálculo de Comisión */}
                <div style={{
                    backgroundColor: '#151b2a',
                    borderRadius: 10,
                    padding: 20,
                    margin: '20px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <div>
                        <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Comisión Proyectada de la Agencia</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, color: '#fbbf24' }}>
                            {formatARS(estimatedCommission)}
                        </div>
                    </div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>
                        Precio Web - Precio Propietario
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label">Observaciones</label>
                    <textarea
                        className="form-textarea"
                        rows={3}
                        placeholder="Condiciones de custodia, porcentaje pactado, llaves y documentación entregada..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button type="button" onClick={() => router.back()} className="btn-secondary">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                        <Save size={16} />
                        <span>{loading ? 'Guardando...' : 'Crear Consignación'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
