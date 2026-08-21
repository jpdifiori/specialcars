'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatARS, formatPercent } from '@/lib/utils/currency';
import { 
    BarChart3, 
    Car, 
    TrendingUp, 
    DollarSign, 
    Clock, 
    ArrowLeftRight, 
    FileSpreadsheet, 
    Sparkles, 
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';

export function ReportsClientView({ reports }: { reports: any }) {
    const [tab, setTab] = useState<'stock' | 'sales' | 'profit' | 'aging' | 'tradeIn' | 'consignment'>('stock');

    const { stock, sales, profitability, aging, tradeIn, consignment } = reports;

    return (
        <div>
            {/* Tabs de Navegación de Reportes */}
            <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 24, overflowX: 'auto' }}>
                <button
                    onClick={() => setTab('stock')}
                    className={`admin-nav-item ${tab === 'stock' ? 'active' : ''}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '10px 18px' }}
                >
                    <Car size={16} />
                    <span>Reporte de Stock</span>
                </button>

                <button
                    onClick={() => setTab('sales')}
                    className={`admin-nav-item ${tab === 'sales' ? 'active' : ''}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '10px 18px' }}
                >
                    <TrendingUp size={16} />
                    <span>Reporte de Ventas</span>
                </button>

                <button
                    onClick={() => setTab('profit')}
                    className={`admin-nav-item ${tab === 'profit' ? 'active' : ''}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '10px 18px' }}
                >
                    <Sparkles size={16} />
                    <span>Rentabilidad & ROI</span>
                </button>

                <button
                    onClick={() => setTab('aging')}
                    className={`admin-nav-item ${tab === 'aging' ? 'active' : ''}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '10px 18px' }}
                >
                    <Clock size={16} />
                    <span>Antigüedad de Stock</span>
                </button>

                <button
                    onClick={() => setTab('tradeIn')}
                    className={`admin-nav-item ${tab === 'tradeIn' ? 'active' : ''}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '10px 18px' }}
                >
                    <ArrowLeftRight size={16} />
                    <span>Permutas</span>
                </button>

                <button
                    onClick={() => setTab('consignment')}
                    className={`admin-nav-item ${tab === 'consignment' ? 'active' : ''}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '10px 18px' }}
                >
                    <FileSpreadsheet size={16} />
                    <span>Consignaciones</span>
                </button>
            </div>

            {/* TAB 1: REPORTE DE STOCK */}
            {tab === 'stock' && (
                <div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-title">Unidades en Stock</div>
                            <div className="stat-value">{stock.totalUnits}</div>
                            <div className="stat-sub">
                                Propios: <strong>{stock.ownUnits}</strong> • Permutas: <strong>{stock.tradeInUnits}</strong> • Consignados: <strong>{stock.consignedUnits}</strong>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-title">Capital Propio Invertido</div>
                            <div className="stat-value">{formatARS(stock.capitalInvested)}</div>
                            <div className="stat-sub">Compra + Gastos (Excluye consignados)</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-title">Valor Potencial de Venta</div>
                            <div className="stat-value" style={{ color: '#34d399' }}>{formatARS(stock.potentialValue)}</div>
                            <div className="stat-sub">Suma de precios publicados</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-title">Ganancia Potencial Proyectada</div>
                            <div className="stat-value" style={{ color: '#fbbf24' }}>{formatARS(stock.potentialProfit)}</div>
                            <div className="stat-sub">
                                Antigüedad promedio: <strong>{stock.avgDaysInStock} días</strong>
                            </div>
                        </div>
                    </div>

                    <div className="table-container" style={{ padding: 24, marginTop: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>
                            Distribución de Stock por Categoría de Vehículo
                        </h3>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Tipo de Vehículo</th>
                                    <th>Cantidad de Unidades</th>
                                    <th>Valor Total Publicado (ARS)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stock.byCategory.map((cat: any) => (
                                    <tr key={cat.name}>
                                        <td style={{ fontWeight: 600, color: '#fff' }}>{cat.name}</td>
                                        <td>{cat.count} unidades</td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                                            {formatARS(cat.value)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: REPORTE DE VENTAS */}
            {tab === 'sales' && (
                <div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-title">Facturación Histórica Total</div>
                            <div className="stat-value" style={{ color: '#34d399' }}>{formatARS(sales.totalRevenue)}</div>
                            <div className="stat-sub">{sales.totalSales} operaciones cerradas</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-title">Ticket Promedio por Venta</div>
                            <div className="stat-value">{formatARS(sales.avgTicket)}</div>
                            <div className="stat-sub">Por operación concretada</div>
                        </div>
                    </div>

                    <div className="table-container" style={{ padding: 24, marginTop: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>
                            Evolución Mensual de Ventas
                        </h3>
                        {sales.salesByMonth.length === 0 ? (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: 24 }}>No hay registros de ventas mensuales aún.</p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Mes / Año</th>
                                        <th>Unidades Vendidas</th>
                                        <th>Facturación Mensual (ARS)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.salesByMonth.map((m: any) => (
                                        <tr key={m.month}>
                                            <td style={{ fontWeight: 600, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>{m.month}</td>
                                            <td>{m.salesCount} unidades</td>
                                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                                                {formatARS(m.revenue)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: RENTABILIDAD & ROI */}
            {tab === 'profit' && (
                <div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-title">Ganancia Realizada Total</div>
                            <div className="stat-value" style={{ color: '#fbbf24' }}>{formatARS(profitability.totalRealizedProfit)}</div>
                            <div className="stat-sub">Sobre vehículos propios vendidos</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-title">Ganancia Promedio por Auto</div>
                            <div className="stat-value">{formatARS(profitability.avgProfitPerVehicle)}</div>
                            <div className="stat-sub">Por unidad vendida</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-title">ROI Promedio Realizado</div>
                            <div className="stat-value" style={{ color: '#34d399' }}>{formatPercent(profitability.avgROI)}</div>
                            <div className="stat-sub">Retorno sobre el costo real</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginTop: 24 }}>
                        {/* Top Rentables */}
                        <div className="table-container" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#34d399', marginBottom: 14 }}>
                                Top 5 Vehículos Más Rentables
                            </h3>
                            {profitability.topProfitable.length === 0 ? (
                                <p style={{ color: '#64748b', fontSize: 13 }}>Sin ventas registradas.</p>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Vehículo</th>
                                            <th>Ganancia (ARS)</th>
                                            <th>ROI</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {profitability.topProfitable.map((v: any) => (
                                            <tr key={v.id}>
                                                <td>
                                                    <Link href={`/admin/vehiculos/${v.id}`} style={{ color: '#fff', fontWeight: 600 }}>
                                                        {v.title}
                                                    </Link>
                                                </td>
                                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24' }}>
                                                    {formatARS(v.profit)}
                                                </td>
                                                <td style={{ color: '#34d399', fontWeight: 700 }}>
                                                    {v.roi} %
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Rentabilidad por Marca */}
                        <div className="table-container" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#60a5fa', marginBottom: 14 }}>
                                Rentabilidad por Marca
                            </h3>
                            {profitability.profitByBrand.length === 0 ? (
                                <p style={{ color: '#64748b', fontSize: 13 }}>Sin datos aún.</p>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Marca</th>
                                            <th>Vendidos</th>
                                            <th>Ganancia Total (ARS)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {profitability.profitByBrand.map((b: any) => (
                                            <tr key={b.brand}>
                                                <td style={{ fontWeight: 600, color: '#fff' }}>{b.brand}</td>
                                                <td>{b.unitsSold} autos</td>
                                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24' }}>
                                                    {formatARS(b.totalProfit)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: ANTIGÜEDAD DE STOCK (AGING) */}
            {tab === 'aging' && (
                <div>
                    {aging.totalStagnantCapital > 0 && (
                        <div className="alert-banner warning" style={{ marginBottom: 20 }}>
                            <AlertTriangle size={20} />
                            <span>
                                Capital inmovilizado en vehículos con <strong>más de 60 días en stock</strong>: <strong>{formatARS(aging.totalStagnantCapital)}</strong>.
                            </span>
                        </div>
                    )}

                    <div className="table-container" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>
                            Segmentos de Antigüedad en Inventario
                        </h3>

                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Rango de Días</th>
                                    <th>Cantidad de Autos</th>
                                    <th>Capital Inmovilizado (ARS)</th>
                                    <th>Estado de Alerta</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aging.segments.map((seg: any) => (
                                    <tr key={seg.range}>
                                        <td style={{ fontWeight: 700, color: '#fff' }}>{seg.label}</td>
                                        <td style={{ fontWeight: 600 }}>{seg.count} unidades</td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: seg.min >= 61 ? '#f43f5e' : '#34d399' }}>
                                            {formatARS(seg.capital)}
                                        </td>
                                        <td>
                                            {seg.min >= 91 ? (
                                                <span className="badge badge-sold" style={{ color: '#f43f5e' }}>Alerta Crítica</span>
                                            ) : (seg.min >= 61 ? (
                                                <span className="badge badge-reserved">Atención</span>
                                            ) : (
                                                <span className="badge badge-available">Saludable</span>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 5: PERMUTAS */}
            {tab === 'tradeIn' && (
                <div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-title">Total Permutas Recibidas</div>
                            <div className="stat-value">{tradeIn.totalTradeInsReceived}</div>
                            <div className="stat-sub">
                                En Stock: <strong>{tradeIn.currentlyInStock}</strong> • Vendidas: <strong>{tradeIn.currentlySold}</strong>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-title">Valor Total Tomado en Permuta</div>
                            <div className="stat-value" style={{ color: '#60a5fa' }}>{formatARS(tradeIn.totalValueReceived)}</div>
                            <div className="stat-sub">Reconocido como parte de pago</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-title">Ganancia Realizada sobre Permutas</div>
                            <div className="stat-value" style={{ color: '#fbbf24' }}>{formatARS(tradeIn.profitRealizedOnTradeIns)}</div>
                            <div className="stat-sub">ROI Promedio: <strong>{tradeIn.avgROIEarned} %</strong></div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 6: CONSIGNACIONES */}
            {tab === 'consignment' && (
                <div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-title">Consignaciones Activas</div>
                            <div className="stat-value">{consignment.activeCount}</div>
                            <div className="stat-sub">En catálogo de venta</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-title">Valor Publicado Consignado</div>
                            <div className="stat-value" style={{ color: '#34d399' }}>{formatARS(consignment.totalListingValue)}</div>
                            <div className="stat-sub">No suma a capital propio invertido</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-title">Comisiones Ganadas Acumuladas</div>
                            <div className="stat-value" style={{ color: '#fbbf24' }}>{formatARS(consignment.totalCommissionsEarned)}</div>
                            <div className="stat-sub">{consignment.soldCount} consignaciones vendidas</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
