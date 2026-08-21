'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getZeroKmOperations, updateZeroKmStatus } from '@/lib/actions/zero-km';
import { ZeroKmOperation, ZeroKmStatus } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { 
    Sparkles, 
    Plus, 
    Car, 
    User, 
    DollarSign, 
    Truck, 
    CheckCircle2, 
    Clock 
} from 'lucide-react';

export default function AdminZeroKmPage() {
    const [operations, setOperations] = useState<ZeroKmOperation[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('ALL');

    const loadZeroKm = async () => {
        setLoading(true);
        try {
            const res = await getZeroKmOperations({ status, limit: 50 });
            setOperations(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadZeroKm();
    }, [status]);

    const handleStatusChange = async (id: string, newStatus: ZeroKmStatus) => {
        await updateZeroKmStatus(id, newStatus);
        loadZeroKm();
    };

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Operaciones 0 KM</h1>
                    <p className="admin-page-desc">Pedidos y seguimiento de unidades 0 KM directamente con concesionarios oficiales y proveedores.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link href="/admin/0km/nueva" className="btn-primary">
                        <Plus size={16} />
                        <span>Nueva Operación 0 KM</span>
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
                            <option value="ORDERED">Pedido</option>
                            <option value="CONFIRMED">Confirmado</option>
                            <option value="INVOICED">Facturado</option>
                            <option value="IN_TRANSIT">En Tránsito</option>
                            <option value="DELIVERED">Entregado</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                        Cargando operaciones 0 KM...
                    </div>
                ) : operations.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
                        <Sparkles size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}>No hay operaciones 0 KM</p>
                        <p style={{ fontSize: 13, marginBottom: 16 }}>Registrá pedidos de unidades 0 KM a pedido de clientes.</p>
                        <Link href="/admin/0km/nueva" className="btn-primary">
                            <Plus size={15} />
                            <span>Crear Pedido 0 KM</span>
                        </Link>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Vehículo 0 KM</th>
                                <th>Cliente</th>
                                <th>Proveedor / Concesionario</th>
                                <th>Costo (ARS)</th>
                                <th>Precio Cliente (ARS)</th>
                                <th>Comisión Agencia</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {operations.map((op) => (
                                <tr key={op.id}>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#60a5fa' }}>
                                        {op.operation_code}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#fff' }}>
                                            {op.brand} {op.model} {op.version || ''} ({op.year})
                                        </div>
                                        {op.color && <div style={{ fontSize: 11, color: '#64748b' }}>Color: {op.color}</div>}
                                    </td>
                                    <td>
                                        {op.client ? (
                                            <Link href={`/admin/clientes/${op.client.id}`} style={{ color: '#cbd5e1' }}>
                                                {op.client.first_name} {op.client.last_name}
                                            </Link>
                                        ) : '-'}
                                    </td>
                                    <td style={{ color: '#94a3b8' }}>
                                        {op.provider || '-'}
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                                        {formatARS(op.cost)}
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                                        {formatARS(op.client_price)}
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24' }}>
                                        {formatARS(op.commission)}
                                    </td>
                                    <td>
                                        <select
                                            className="admin-select"
                                            style={{ height: 32, fontSize: 12, padding: '0 8px' }}
                                            value={op.status}
                                            onChange={(e) => handleStatusChange(op.id, e.target.value as any)}
                                        >
                                            <option value="ORDERED">Pedido</option>
                                            <option value="CONFIRMED">Confirmado</option>
                                            <option value="INVOICED">Facturado</option>
                                            <option value="IN_TRANSIT">En Tránsito</option>
                                            <option value="DELIVERED">Entregado</option>
                                        </select>
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
