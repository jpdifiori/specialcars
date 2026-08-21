'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getConsignments } from '@/lib/actions/consignments';
import { Consignment } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { 
    FileSpreadsheet, 
    Plus, 
    Car, 
    User, 
    DollarSign, 
    CheckCircle2, 
    Clock, 
    AlertTriangle 
} from 'lucide-react';

export default function AdminConsignmentsPage() {
    const [consignments, setConsignments] = useState<Consignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('ALL');

    const loadConsignments = async () => {
        setLoading(true);
        try {
            const res = await getConsignments({ status, limit: 50 });
            setConsignments(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConsignments();
    }, [status]);

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Consignaciones de Vehículos</h1>
                    <p className="admin-page-desc">Gestión de autos de clientes en consignación, cálculo de comisiones y control de vencimientos.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link href="/admin/consignaciones/nueva" className="btn-primary">
                        <Plus size={16} />
                        <span>Nueva Consignación</span>
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
                            <option value="SOLD">Vendidas</option>
                            <option value="RESERVED">Reservadas</option>
                            <option value="EXPIRED">Vencidas</option>
                            <option value="WITHDRAWN">Retiradas</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#000000' }}>
                        Cargando consignaciones...
                    </div>
                ) : consignments.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: '#000000' }}>
                        <FileSpreadsheet size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}>No hay consignaciones</p>
                        <p style={{ fontSize: 13, marginBottom: 16 }}>Registrá un vehículo que un cliente deja para la venta en tu agencia.</p>
                        <Link href="/admin/consignaciones/nueva" className="btn-primary">
                            <Plus size={15} />
                            <span>Crear Consignación</span>
                        </Link>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Vehículo</th>
                                <th>Propietario</th>
                                <th>Precio Solicitado (ARS)</th>
                                <th>Precio Publicado (ARS)</th>
                                <th>Comisión Agencia (ARS)</th>
                                <th>Estado</th>
                                <th>Fecha Inicio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {consignments.map((c) => (
                                <tr key={c.id}>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#60a5fa' }}>
                                        {c.consignment_code}
                                    </td>
                                    <td>
                                        {c.vehicle ? (
                                            <Link href={`/admin/vehiculos/${c.vehicle.id}`} style={{ fontWeight: 600, color: '#f8fafc' }}>
                                                {c.vehicle.brand} {c.vehicle.model} ({c.vehicle.year})
                                            </Link>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        {c.client ? (
                                            <Link href={`/admin/clientes/${c.client.id}`} style={{ color: '#000000' }}>
                                                {c.client.first_name} {c.client.last_name}
                                            </Link>
                                        ) : '-'}
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', color: '#000000' }}>
                                        {formatARS(c.requested_price)}
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                                        {formatARS(c.listing_price)}
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24' }}>
                                        {formatARS(c.commission_amount || (c.listing_price - c.requested_price))}
                                    </td>
                                    <td>
                                        <span className={`badge ${c.status === 'ACTIVE' ? 'badge-available' : (c.status === 'SOLD' ? 'badge-sold' : 'badge-reserved')}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td style={{ color: '#000000', fontSize: 12 }}>
                                        {formatDate(c.start_date)}
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
