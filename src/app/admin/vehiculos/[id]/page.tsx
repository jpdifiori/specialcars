import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getVehicleById } from '@/lib/actions/vehicles';
import { formatARS, formatPercent } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { VehicleDetailClient } from './VehicleDetailClient';
import { 
    Car, 
    ArrowLeft, 
    Globe, 
    DollarSign, 
    Calendar, 
    Clock, 
    Tag, 
    ArrowLeftRight, 
    User, 
    Sparkles, 
    Edit, 
    CheckCircle2,
    ExternalLink
} from 'lucide-react';

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const vehicle = await getVehicleById(id);

    if (!vehicle) {
        notFound();
    }

    const primaryImg = vehicle.images?.find(img => img.is_primary) || vehicle.images?.[0];

    return (
        <div>
            {/* Header de la Ficha */}
            <div style={{ marginBottom: 20 }}>
                <Link href="/admin/vehiculos" style={{ fontSize: 13, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <ArrowLeft size={14} />
                    <span>Volver a Vehículos</span>
                </Link>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: '#60a5fa' }}>
                                {vehicle.stock_code}
                            </span>
                            {vehicle.plate && (
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: '#1e293b', padding: '2px 8px', borderRadius: 4, color: '#e2e8f0', fontWeight: 600 }}>
                                    {vehicle.plate}
                                </span>
                            )}
                            <span className={`badge ${
                                vehicle.status === 'AVAILABLE' ? 'badge-available' :
                                vehicle.status === 'RESERVED' ? 'badge-reserved' :
                                vehicle.status === 'SOLD' ? 'badge-sold' : 'badge-prep'
                            }`}>
                                {vehicle.status}
                            </span>
                            {vehicle.origin_type === 'TRADE_IN' && (
                                <span className="badge badge-trade-in">Ingresó por Permuta</span>
                            )}
                            {vehicle.origin_type === 'CONSIGNMENT' && (
                                <span className="badge badge-consignment">Consignación</span>
                            )}
                        </div>

                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, color: '#f8fafc', letterSpacing: -0.5 }}>
                            {vehicle.brand} {vehicle.model} {vehicle.version || ''} ({vehicle.year})
                        </h1>
                        <p style={{ fontSize: 13.5, color: '#94a3b8', marginTop: 2 }}>
                            {vehicle.mileage?.toLocaleString('es-AR')} km • {vehicle.fuel_type} • Caja {vehicle.transmission} • {vehicle.body_type}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <Link href={`/admin/vehiculos/${vehicle.id}/editar`} className="btn-secondary">
                            <Edit size={15} />
                            <span>Editar Datos</span>
                        </Link>
                        {vehicle.published && vehicle.slug && (
                            <Link href={`/vehiculos/${vehicle.slug}`} target="_blank" className="btn-primary">
                                <ExternalLink size={15} />
                                <span>Ver en Web Pública</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* SECCIÓN ADN COMERCIAL (LIFECYCLE FINANCIERO VISUAL) */}
            <div className="adn-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={16} style={{ color: '#fbbf24' }} />
                        <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#f8fafc' }}>
                            ADN Comercial & Ciclo Económico
                        </h2>
                    </div>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                        Trazabilidad completa en Pesos Argentinos (ARS)
                    </span>
                </div>

                <div className="adn-flow">
                    {/* 1. Compra / Toma */}
                    <div className="adn-node active">
                        <div className="adn-node-circle">
                            <DollarSign size={20} />
                        </div>
                        <div className="adn-label">
                            {vehicle.origin_type === 'TRADE_IN' ? 'Toma Permuta' : 'Comprado'}
                        </div>
                        <div className="adn-amount">{formatARS(vehicle.purchase_price)}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{formatDate(vehicle.purchase_date)}</div>
                    </div>

                    <div className="adn-arrow">→</div>

                    {/* 2. Gastos */}
                    <div className="adn-node active">
                        <div className="adn-node-circle" style={{ borderColor: '#8b5cf6', color: '#c084fc' }}>
                            +
                        </div>
                        <div className="adn-label">Gastos Invertidos</div>
                        <div className="adn-amount" style={{ color: '#c084fc' }}>{formatARS(vehicle.total_expenses)}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{vehicle.expenses?.length || 0} registros</div>
                    </div>

                    <div className="adn-arrow">→</div>

                    {/* 3. Costo Real */}
                    <div className="adn-node active">
                        <div className="adn-node-circle" style={{ borderColor: '#3b82f6', color: '#60a5fa' }}>
                            =
                        </div>
                        <div className="adn-label">Costo Real Total</div>
                        <div className="adn-amount" style={{ color: '#60a5fa' }}>{formatARS(vehicle.real_cost)}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Compra + Gastos</div>
                    </div>

                    <div className="adn-arrow">→</div>

                    {/* 4. Precio Venta Publicado */}
                    <div className="adn-node active">
                        <div className="adn-node-circle" style={{ borderColor: '#10b981', color: '#34d399' }}>
                            <Tag size={18} />
                        </div>
                        <div className="adn-label">Precio Publicado</div>
                        <div className="adn-amount" style={{ color: '#34d399' }}>{formatARS(vehicle.sale_price)}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                            {vehicle.published ? 'Publicado Online' : 'No Publicado'}
                        </div>
                    </div>

                    <div className="adn-arrow">→</div>

                    {/* 5. Ganancia / ROI */}
                    <div className="adn-node success">
                        <div className="adn-node-circle">
                            <Sparkles size={18} />
                        </div>
                        <div className="adn-label">
                            {vehicle.status === 'SOLD' ? 'Ganancia Real' : 'Ganancia Proyectada'}
                        </div>
                        <div className="adn-amount" style={{ color: '#fbbf24' }}>
                            {formatARS(vehicle.potential_profit)}
                        </div>
                        <div style={{ fontSize: 11, color: '#34d399', fontWeight: 700 }}>
                            ROI: {formatPercent(vehicle.profitability_pct)}
                        </div>
                    </div>
                </div>

                {/* Info adicional si ingresó por permuta */}
                {vehicle.origin_type === 'TRADE_IN' && vehicle.previous_client && (
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#94a3b8' }}>
                        <ArrowLeftRight size={16} style={{ color: '#60a5fa' }} />
                        <span>
                            Vehículo entregado por el cliente <strong>{vehicle.previous_client.first_name} {vehicle.previous_client.last_name}</strong> como parte de pago por un valor reconocido de <strong>{formatARS(vehicle.purchase_price)}</strong>.
                        </span>
                        {vehicle.origin_operation && (
                            <Link href={`/admin/operaciones/${vehicle.origin_operation.id}`} style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'underline' }}>
                                Ver Operación {vehicle.origin_operation.operation_code}
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* COMPONENTE CLIENT INTERACTIVO (TABS: FOTOS, GASTOS, INFORMACIÓN, TRAZABILIDAD) */}
            <VehicleDetailClient vehicle={vehicle} />
        </div>
    );
}
