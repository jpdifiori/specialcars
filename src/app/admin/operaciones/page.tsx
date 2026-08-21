'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOperations } from '@/lib/actions/operations';
import { Operation } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { 
    ArrowLeftRight, 
    Plus, 
    Search, 
    Eye, 
    User, 
    Car, 
    CheckCircle2, 
    DollarSign
} from 'lucide-react';

export default function AdminOperationsPage() {
    const [operations, setOperations] = useState<Operation[]>([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('ALL');
    const [search, setSearch] = useState('');

    const loadOperations = async () => {
        setLoading(true);
        try {
            const res = await getOperations({ type, search, limit: 50 });
            setOperations(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOperations();
    }, [type]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadOperations();
    };

    const getTypeBadge = (opType: string) => {
        switch (opType) {
            case 'SALE_WITH_TRADE_IN':
                return <span className="badge badge-trade-in">Venta con Permuta</span>;
            case 'SALE':
                return <span className="badge badge-available">Venta Simple</span>;
            case 'CONSIGNMENT':
                return <span className="badge badge-consignment">Venta Consignación</span>;
            case 'PURCHASE':
                return <span className="badge" style={{ background: '#1e293b', color: '#cbd5e1' }}>Compra Directa</span>;
            default:
                return <span className="badge">{opType}</span>;
        }
    };

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Operaciones Comerciales</h1>
                    <p className="admin-page-desc">Registro de ventas, permutas, compras y trazabilidad de ingresos y egresos de vehículos.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link href="/admin/operaciones/nueva" className="btn-primary">
                        <Plus size={16} />
                        <span>Nueva Operación</span>
                    </Link>
                </div>
            </div>

            <div className="table-container">
                <div className="table-toolbar">
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, maxWidth: 360 }}>
                        <input
                            type="text"
                            className="admin-input"
                            style={{ flex: 1 }}
                            placeholder="Buscar código OP-XXXXXX..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn-secondary">
                            <Search size={15} />
                        </button>
                    </form>

                    <div className="table-filters">
                        <select 
                            className="admin-select"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="ALL">Todos los tipos</option>
                            <option value="SALE">Ventas Simples</option>
                            <option value="SALE_WITH_TRADE_IN">Ventas con Permuta</option>
                            <option value="CONSIGNMENT">Ventas de Consignación</option>
                            <option value="PURCHASE">Compras Directas</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                        Cargando operaciones...
                    </div>
                ) : operations.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
                        <ArrowLeftRight size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}>No hay operaciones registradas</p>
                        <p style={{ fontSize: 13, marginBottom: 16 }}>Iniciá una venta simple o venta con permuta para comenzar.</p>
                        <Link href="/admin/operaciones/nueva" className="btn-primary">
                            <Plus size={15} />
                            <span>Crear primera operación</span>
                        </Link>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Tipo</th>
                                <th>Cliente</th>
                                <th>Vehículo Vendido</th>
                                <th>Vehículo Recibido (Permuta)</th>
                                <th>Monto Total (ARS)</th>
                                <th>Fecha</th>
                                <th style={{ textAlign: 'right' }}>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {operations.map((op) => {
                                const soldVeh = op.vehicles?.find(v => v.role === 'SOLD')?.vehicle;
                                const tradeInVeh = op.vehicles?.find(v => v.role === 'RECEIVED_TRADE_IN')?.vehicle;

                                return (
                                    <tr key={op.id}>
                                        <td>
                                            <Link href={`/admin/operaciones/${op.id}`} style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#60a5fa' }}>
                                                {op.operation_code}
                                            </Link>
                                        </td>
                                        <td>
                                            {getTypeBadge(op.type)}
                                        </td>
                                        <td>
                                            {op.client ? (
                                                <Link href={`/admin/clientes/${op.client.id}`} style={{ fontWeight: 600, color: '#f8fafc' }}>
                                                    {op.client.first_name} {op.client.last_name}
                                                </Link>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            {soldVeh ? (
                                                <div>
                                                    <Link href={`/admin/vehiculos/${soldVeh.id}`} style={{ color: '#e2e8f0', fontWeight: 500 }}>
                                                        {soldVeh.brand} {soldVeh.model} ({soldVeh.year})
                                                    </Link>
                                                    <div style={{ fontSize: 11, color: '#64748b' }}>{soldVeh.stock_code}</div>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            {tradeInVeh ? (
                                                <div>
                                                    <Link href={`/admin/vehiculos/${tradeInVeh.id}`} style={{ color: '#60a5fa', fontWeight: 500 }}>
                                                        {tradeInVeh.brand} {tradeInVeh.model} ({tradeInVeh.year})
                                                    </Link>
                                                    <div style={{ fontSize: 11, color: '#34d399' }}>Toma: {formatARS(op.trade_in_value)}</div>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#64748b', fontSize: 12 }}>Sin permuta</span>
                                            )}
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                                            {formatARS(op.agreed_price)}
                                        </td>
                                        <td style={{ color: '#94a3b8', fontSize: 12 }}>
                                            {formatDate(op.operation_date)}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <Link 
                                                href={`/admin/operaciones/${op.id}`}
                                                className="btn-secondary"
                                                style={{ padding: '6px 12px', fontSize: 12 }}
                                            >
                                                <Eye size={14} />
                                                <span>Ver</span>
                                            </Link>
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
