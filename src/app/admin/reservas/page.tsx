'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getReservations, cancelReservation } from '@/lib/actions/reservations';
import { Reservation } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { 
    BookmarkCheck, 
    Plus, 
    Car, 
    User, 
    DollarSign, 
    CheckCircle2, 
    XCircle,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('ALL');

    const loadReservations = async () => {
        setLoading(true);
        try {
            const res = await getReservations({ status, limit: 50 });
            setReservations(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReservations();
    }, [status]);

    const handleCancel = async (id: string) => {
        if (!confirm('¿Seguro que deseas cancelar esta reserva? El vehículo volverá a estar disponible para la venta.')) return;
        await cancelReservation(id);
        loadReservations();
    };

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Reservas de Vehículos</h1>
                    <p className="admin-page-desc">Control de señas activas, vencimientos y bloqueo de vehículos en inventario.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link href="/admin/reservas/nueva" className="btn-primary">
                        <Plus size={16} />
                        <span>Nueva Reserva</span>
                    </Link>
                </div>
            </div>

            <div className="table-container">
                <div className="table-toolbar">
                    <div className="table-filters">
                        <select 
                            className="admin-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="ALL">Todos los estados</option>
                            <option value="ACTIVE">Activas</option>
                            <option value="CONFIRMED">Confirmadas (Venta)</option>
                            <option value="CANCELLED">Canceladas</option>
                            <option value="EXPIRED">Vencidas</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                        Cargando reservas...
                    </div>
                ) : reservations.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
                        <BookmarkCheck size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}>No hay reservas</p>
                        <p style={{ fontSize: 13, marginBottom: 16 }}>Registrá una seña para bloquear un vehículo del inventario.</p>
                        <Link href="/admin/reservas/nueva" className="btn-primary">
                            <Plus size={15} />
                            <span>Crear Reserva</span>
                        </Link>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Vehículo</th>
                                <th>Cliente</th>
                                <th>Seña / Importe (ARS)</th>
                                <th>Fecha Reserva</th>
                                <th>Vencimiento</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((r) => (
                                <tr key={r.id}>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#60a5fa' }}>
                                        {r.reservation_code}
                                    </td>
                                    <td>
                                        {r.vehicle ? (
                                            <Link href={`/admin/vehiculos/${r.vehicle.id}`} style={{ fontWeight: 600, color: '#f8fafc' }}>
                                                {r.vehicle.brand} {r.vehicle.model} ({r.vehicle.year})
                                            </Link>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        {r.client ? (
                                            <Link href={`/admin/clientes/${r.client.id}`} style={{ color: '#cbd5e1' }}>
                                                {r.client.first_name} {r.client.last_name}
                                            </Link>
                                        ) : '-'}
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24' }}>
                                        {formatARS(r.amount)}
                                    </td>
                                    <td style={{ color: '#94a3b8', fontSize: 12 }}>
                                        {formatDate(r.reservation_date)}
                                    </td>
                                    <td style={{ color: r.expiry_date ? '#f8fafc' : '#64748b', fontSize: 12 }}>
                                        {formatDate(r.expiry_date)}
                                    </td>
                                    <td>
                                        <span className={`badge ${r.status === 'ACTIVE' ? 'badge-reserved' : (r.status === 'CONFIRMED' ? 'badge-available' : 'badge-sold')}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {r.status === 'ACTIVE' && (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                                <Link 
                                                    href={`/admin/operaciones/nueva?clientId=${r.client_id}&vehicleId=${r.vehicle_id}`}
                                                    className="btn-primary"
                                                    style={{ padding: '4px 10px', fontSize: 11 }}
                                                >
                                                    Cerrar Venta
                                                </Link>
                                                <button
                                                    onClick={() => handleCancel(r.id)}
                                                    className="btn-danger"
                                                    style={{ padding: '4px 8px', fontSize: 11 }}
                                                    title="Cancelar seña y liberar vehículo"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
