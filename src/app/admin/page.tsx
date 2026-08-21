import Link from 'next/link';
import { getDashboardData } from '@/lib/actions/dashboard';
import { formatARS, formatPercent } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { 
    Car, 
    DollarSign, 
    TrendingUp, 
    Clock, 
    AlertTriangle, 
    Plus, 
    ArrowLeftRight, 
    BookmarkCheck, 
    FileSpreadsheet,
    Users,
    ArrowUpRight,
    Sparkles
} from 'lucide-react';

export default async function AdminDashboardPage() {
    const { stats, recentOperations, recentClients, stagnantVehicles } = await getDashboardData();

    return (
        <div>
            {/* Header del Dashboard con Acciones Rápidas */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Dashboard Ejecutivo</h1>
                    <p className="admin-page-desc">Resumen integral en tiempo real del inventario, finanzas y operaciones de Special Cars.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Link href="/admin/vehiculos/nuevo" className="btn-primary">
                        <Plus size={16} />
                        <span>Cargar Vehículo</span>
                    </Link>
                    <Link href="/admin/operaciones/nueva" className="btn-secondary">
                        <ArrowLeftRight size={16} />
                        <span>Nueva Operación</span>
                    </Link>
                    <Link href="/admin/clientes/nuevo" className="btn-secondary">
                        <Users size={16} />
                        <span>Nuevo Cliente</span>
                    </Link>
                </div>
            </div>

            {/* Banners de Alerta si hay problemas en stock */}
            {(stats.alerts.no_photos > 0 || stats.alerts.no_price > 0 || stats.alerts.stagnant_stock > 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {stats.alerts.no_photos > 0 && (
                        <div className="alert-banner warning">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <AlertTriangle size={18} />
                                <span>Hay <strong>{stats.alerts.no_photos} vehículos</strong> sin fotografías cargadas en el inventario.</span>
                            </div>
                            <Link href="/admin/vehiculos?status=AVAILABLE" style={{ fontWeight: 700, textDecoration: 'underline' }}>
                                Ver vehículos
                            </Link>
                        </div>
                    )}

                    {stats.alerts.no_price > 0 && (
                        <div className="alert-banner danger">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <AlertTriangle size={18} />
                                <span>Hay <strong>{stats.alerts.no_price} vehículos</strong> disponibles sin precio de venta asignado.</span>
                            </div>
                            <Link href="/admin/vehiculos?status=AVAILABLE" style={{ fontWeight: 700, textDecoration: 'underline' }}>
                                Asignar precios
                            </Link>
                        </div>
                    )}

                    {stats.alerts.stagnant_stock > 0 && (
                        <div className="alert-banner info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Clock size={18} />
                                <span>Hay <strong>{stats.alerts.stagnant_stock} vehículos</strong> con más de 60 días en stock sin venderse.</span>
                            </div>
                            <Link href="/admin/reportes" style={{ fontWeight: 700, textDecoration: 'underline' }}>
                                Ver análisis de antigüedad
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* KPIs FINANCIEROS (ARS EXCLUSIVAMENTE) */}
            <div style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 12 }}>
                    Finanzas & Valuación de Stock (ARS)
                </h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-title">Capital Invertido Propio</span>
                            <div className="stat-icon-box">
                                <DollarSign size={18} />
                            </div>
                        </div>
                        <div className="stat-value">{formatARS(stats.finance.capital_invested)}</div>
                        <div className="stat-sub">Stock propio + Permutas + Gastos</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-title">Valor Potencial de Venta</span>
                            <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
                                <TrendingUp size={18} />
                            </div>
                        </div>
                        <div className="stat-value" style={{ color: '#34d399' }}>{formatARS(stats.finance.potential_sale_value)}</div>
                        <div className="stat-sub">Total inventario activo</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-title">Ganancia Potencial</span>
                            <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>
                                <Sparkles size={18} />
                            </div>
                        </div>
                        <div className="stat-value" style={{ color: '#fbbf24' }}>{formatARS(stats.finance.potential_profit)}</div>
                        <div className="stat-sub">
                            Margen promedio: <strong className="stat-tag-positive">{formatPercent(stats.finance.margin_percentage)}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-title">Ventas del Mes</span>
                            <div className="stat-icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#c084fc' }}>
                                <Car size={18} />
                            </div>
                        </div>
                        <div className="stat-value">{formatARS(stats.finance.month_sales_total)}</div>
                        <div className="stat-sub">
                            <strong>{stats.finance.month_units_sold} unidades</strong> vendidas este mes
                        </div>
                    </div>
                </div>
            </div>

            {/* KPIs DE STOCK E INVENTARIO */}
            <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 12 }}>
                    Estado del Inventario
                </h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-title">Disponibles</div>
                        <div className="stat-value" style={{ color: '#34d399', marginTop: 8 }}>{stats.stock.available}</div>
                        <div className="stat-sub">Listos para la venta</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Reservados</div>
                        <div className="stat-value" style={{ color: '#fbbf24', marginTop: 8 }}>{stats.stock.reserved}</div>
                        <div className="stat-sub">Con seña activa</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">En Preparación</div>
                        <div className="stat-value" style={{ color: '#c084fc', marginTop: 8 }}>{stats.stock.in_preparation}</div>
                        <div className="stat-sub">Mecánica / Detailing / Fotos</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Consignados</div>
                        <div className="stat-value" style={{ color: '#f472b6', marginTop: 8 }}>{stats.stock.consigned}</div>
                        <div className="stat-sub">Vehículos de terceros</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Recibidos en Permuta</div>
                        <div className="stat-value" style={{ color: '#60a5fa', marginTop: 8 }}>{stats.stock.trade_in}</div>
                        <div className="stat-sub">Tomados como parte de pago</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Vendidos Históricos</div>
                        <div className="stat-value" style={{ color: '#94a3b8', marginTop: 8 }}>{stats.stock.sold}</div>
                        <div className="stat-sub">En base de datos</div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN DOBLE: ÚLTIMAS OPERACIONES Y CLIENTES RECIENTES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
                {/* Últimas Operaciones */}
                <div className="table-container">
                    <div className="table-toolbar">
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>Últimas Operaciones</h3>
                        <Link href="/admin/operaciones" style={{ fontSize: 13, color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>Ver todas</span>
                            <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    {recentOperations.length === 0 ? (
                        <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                            Aún no se han registrado operaciones.
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Tipo</th>
                                    <th>Cliente</th>
                                    <th>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOperations.map((op) => (
                                    <tr key={op.id}>
                                        <td>
                                            <Link href={`/admin/operaciones/${op.id}`} style={{ fontWeight: 700, color: '#60a5fa' }}>
                                                {op.operation_code}
                                            </Link>
                                        </td>
                                        <td>
                                            <span className="badge" style={{
                                                backgroundColor: op.type === 'SALE_WITH_TRADE_IN' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                color: op.type === 'SALE_WITH_TRADE_IN' ? '#60a5fa' : '#34d399'
                                            }}>
                                                {op.type === 'SALE_WITH_TRADE_IN' ? 'Permuta' : (op.type === 'SALE' ? 'Venta' : op.type)}
                                            </span>
                                        </td>
                                        <td>
                                            {op.client ? `${op.client.first_name} ${op.client.last_name}` : '-'}
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f8fafc' }}>
                                            {formatARS(op.agreed_price)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Últimos Clientes */}
                <div className="table-container">
                    <div className="table-toolbar">
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>Últimos Clientes Cargados</h3>
                        <Link href="/admin/clientes" style={{ fontSize: 13, color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>Ver todos</span>
                            <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    {recentClients.length === 0 ? (
                        <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                            Aún no hay clientes registrados.
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Teléfono / WhatsApp</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentClients.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <Link href={`/admin/clientes/${c.id}`} style={{ fontWeight: 600, color: '#f8fafc' }}>
                                                {c.first_name} {c.last_name}
                                            </Link>
                                        </td>
                                        <td style={{ color: '#94a3b8' }}>
                                            {c.phone || c.email || '-'}
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: 12 }}>
                                            {formatDate(c.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
