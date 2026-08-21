import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getOperationById } from '@/lib/actions/operations';
import { formatARS } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { 
    ArrowLeft, 
    ArrowLeftRight, 
    User, 
    Car, 
    DollarSign, 
    CheckCircle2, 
    Calendar,
    FileText
} from 'lucide-react';

export default async function OperationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const op = await getOperationById(id);

    if (!op) {
        notFound();
    }

    const soldVeh = op.vehicles?.find(v => v.role === 'SOLD')?.vehicle;
    const tradeInVeh = op.vehicles?.find(v => v.role === 'RECEIVED_TRADE_IN')?.vehicle;
    const consignedVeh = op.vehicles?.find(v => v.role === 'CONSIGNED')?.vehicle;

    return (
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <Link href="/admin/operaciones" style={{ fontSize: 13, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <ArrowLeft size={14} />
                    <span>Volver a Operaciones</span>
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 800, color: '#60a5fa' }}>
                                {op.operation_code}
                            </span>
                            <span className="badge badge-available">
                                {op.status}
                            </span>
                            <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                                {op.type === 'SALE_WITH_TRADE_IN' ? 'Venta con Permuta' : op.type}
                            </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#94a3b8' }}>
                            Fecha de Operación: {formatDate(op.operation_date)}
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Monto Total Acordado</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 900, color: '#34d399' }}>
                            {formatARS(op.agreed_price)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de Datos: Cliente y Vehículos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
                {/* Cliente */}
                <div className="table-container" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <User size={18} style={{ color: '#3b82f6' }} />
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>Cliente Comprador</h3>
                    </div>

                    {op.client && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5 }}>
                            <div style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>
                                <Link href={`/admin/clientes/${op.client.id}`} style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                                    {op.client.first_name} {op.client.last_name}
                                </Link>
                            </div>
                            {op.client.dni && <div style={{ color: '#94a3b8' }}>DNI: {op.client.dni}</div>}
                            {op.client.phone && <div style={{ color: '#cbd5e1' }}>Tel: {op.client.phone}</div>}
                            {op.client.email && <div style={{ color: '#94a3b8' }}>Email: {op.client.email}</div>}
                        </div>
                    )}
                </div>

                {/* Vehículo Vendido */}
                {soldVeh && (
                    <div className="table-container" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <Car size={18} style={{ color: '#34d399' }} />
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>Vehículo Vendido</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5 }}>
                            <Link href={`/admin/vehiculos/${soldVeh.id}`} style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>
                                {soldVeh.brand} {soldVeh.model} {soldVeh.version || ''} ({soldVeh.year})
                            </Link>
                            <div style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                                Código: {soldVeh.stock_code} {soldVeh.plate ? `• Patente: ${soldVeh.plate}` : ''}
                            </div>
                            <div style={{ color: '#94a3b8', marginTop: 4 }}>
                                Estado actual en inventario: <strong style={{ color: '#94a3b8' }}>VENDIDO</strong>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Vehículo Recibido en Permuta (si aplica) */}
            {tradeInVeh && (
                <div className="table-container" style={{ padding: 24, marginBottom: 24, border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <ArrowLeftRight size={18} style={{ color: '#60a5fa' }} />
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#60a5fa' }}>Vehículo Recibido en Permuta</h3>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <Link href={`/admin/vehiculos/${tradeInVeh.id}`} style={{ fontWeight: 700, color: '#fff', fontSize: 16 }}>
                                {tradeInVeh.brand} {tradeInVeh.model} {tradeInVeh.version || ''} ({tradeInVeh.year})
                            </Link>
                            <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
                                Ingresó como <strong style={{ color: '#60a5fa' }}>{tradeInVeh.stock_code}</strong> • En Preparación para reventa
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>Valor de Toma Reconocido</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: '#fbbf24' }}>
                                {formatARS(op.trade_in_value)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Desglose de Componentes de Pago */}
            <div className="table-container" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>
                    Componentes de Pago Registrados
                </h3>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Medio de Pago</th>
                            <th>Referencia / Comprobante</th>
                            <th>Fecha</th>
                            <th>Importe (ARS)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {op.payments?.map((p) => (
                            <tr key={p.id}>
                                <td>
                                    <span className="badge" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>
                                        {p.payment_type === 'TRADE_IN' ? 'TOMA DE PERMUTA' : p.payment_type}
                                    </span>
                                </td>
                                <td style={{ color: '#cbd5e1' }}>
                                    {p.reference || '-'}
                                </td>
                                <td style={{ color: '#94a3b8', fontSize: 12 }}>
                                    {formatDate(p.payment_date)}
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                                    {formatARS(p.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Observaciones */}
            {op.notes && (
                <div className="table-container" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>Observaciones</h3>
                    <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6 }}>{op.notes}</p>
                </div>
            )}
        </div>
    );
}
