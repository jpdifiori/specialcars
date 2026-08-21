'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getClients } from '@/lib/actions/clients';
import { getAdminVehicles } from '@/lib/actions/vehicles';
import { createReservation } from '@/lib/actions/reservations';
import { Client, Vehicle } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function NewReservationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [clients, setClients] = useState<Client[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    const [clientId, setClientId] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [expiryDate, setExpiryDate] = useState('');
    const [showBadge, setShowBadge] = useState(true);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const load = async () => {
            const [cliRes, vehRes] = await Promise.all([
                getClients({ limit: 100 }),
                getAdminVehicles({ status: 'AVAILABLE', limit: 100 })
            ]);
            setClients(cliRes.data);
            setVehicles(vehRes.data);
        };
        load();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId || !vehicleId || amount <= 0) {
            setError('Por favor completá cliente, vehículo y monto de la seña.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await createReservation({
                client_id: clientId,
                vehicle_id: vehicleId,
                amount,
                expiry_date: expiryDate || undefined,
                show_reserved_badge: showBadge,
                notes: notes || undefined
            });

            if (!res.success) {
                setError(res.error || 'Error creando reserva');
                setLoading(false);
                return;
            }

            router.push('/admin/reservas');
        } catch (err: any) {
            setError(err.message || 'Error inesperado');
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 20 }}>
                <Link href="/admin/reservas" style={{ fontSize: 13, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <ArrowLeft size={14} />
                    <span>Volver a Reservas</span>
                </Link>
                <h1 className="admin-page-title">Nueva Reserva (Seña)</h1>
                <p className="admin-page-desc">Bloqueá un vehículo en el inventario por seña pactada con un cliente.</p>
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
                        <label className="form-label">Cliente *</label>
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
                        <label className="form-label">Vehículo Disponible *</label>
                        <select
                            className="form-select"
                            value={vehicleId}
                            onChange={(e) => setVehicleId(e.target.value)}
                            required
                        >
                            <option value="">-- Seleccionar Vehículo --</option>
                            {vehicles.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.stock_code} — {v.brand} {v.model} ({v.year}) • {formatARS(v.sale_price)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Importe de la Seña ($ ARS) *</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="Ej: 1000000"
                            value={amount || ''}
                            onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                            required
                        />
                        <span className="form-help" style={{ color: '#fbbf24', fontWeight: 600 }}>
                            Seña: {formatARS(amount)}
                        </span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Fecha de Vencimiento de la Reserva</label>
                        <input
                            type="date"
                            className="form-input"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ margin: '18px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={showBadge}
                            onChange={(e) => setShowBadge(e.target.checked)}
                        />
                        <span style={{ fontSize: 13.5, color: '#f8fafc', fontWeight: 600 }}>
                            Mostrar badge &quot;RESERVADO&quot; en la página web pública
                        </span>
                    </label>
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label">Observaciones</label>
                    <textarea
                        className="form-textarea"
                        rows={3}
                        placeholder="Condiciones pactadas, medio de pago de la seña, plazos para cancelar el saldo..."
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
                        <span>{loading ? 'Guardando...' : 'Crear Reserva'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
