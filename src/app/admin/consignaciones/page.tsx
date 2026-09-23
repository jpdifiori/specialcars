'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getConsignments } from '@/lib/actions/consignments';
import { Consignment } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { buildWhatsAppUrl } from '@/lib/utils/phone';
import { 
    FileSpreadsheet, 
    Plus, 
    Car, 
    User, 
    DollarSign, 
    CheckCircle2, 
    Clock, 
    AlertTriangle,
    Phone,
    MessageCircle
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
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#000000', marginBottom: 4 }}>No hay consignaciones</p>
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
                            {consignments.map((c) => {
                                const statusLabels: Record<string, { label: string; bg: string; color: string; border: string }> = {
                                    ACTIVE: { label: 'Activa', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
                                    SOLD: { label: 'Vendida', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
                                    RESERVED: { label: 'Reservada', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
                                    EXPIRED: { label: 'Vencida', bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' },
                                    WITHDRAWN: { label: 'Retirada', bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' }
                                };
                                const st = statusLabels[c.status] || { label: c.status, bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };

                                return (
                                    <tr key={c.id}>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#EA580C' }}>
                                            {c.consignment_code}
                                        </td>
                                        <td>
                                            {c.vehicle ? (
                                                <div>
                                                    <Link href={`/admin/vehiculos/${c.vehicle.id}`} style={{ fontWeight: 800, color: '#0F172A', textDecoration: 'none' }}>
                                                        {c.vehicle.brand} {c.vehicle.model}
                                                    </Link>
                                                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                                                        Año: {c.vehicle.year} {c.vehicle.plate ? `• Patente: ${c.vehicle.plate}` : ''}
                                                    </div>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            {c.client ? (
                                                <div>
                                                    <Link href={`/admin/clientes/${c.client.id}`} style={{ fontWeight: 700, color: '#0F172A', textDecoration: 'none' }}>
                                                        {c.client.first_name} {c.client.last_name}
                                                    </Link>
                                                    {c.client.phone && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginTop: 3 }}>
                                                            <span style={{ color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                                <Phone size={12} style={{ color: '#64748B' }} />
                                                                <span>{c.client.phone}</span>
                                                            </span>
                                                            <a
                                                                href={buildWhatsAppUrl(
                                                                    c.client.phone,
                                                                    `Hola${c.client.first_name ? ' ' + c.client.first_name : ''}, te escribo de Special Cars respecto a la consignación de tu vehículo (${c.vehicle ? c.vehicle.brand + ' ' + c.vehicle.model : ''}). ¿Cómo estás?`
                                                                )}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="Abrir chat en WhatsApp Web"
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: 18,
                                                                    height: 18,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: '#25D366',
                                                                    color: '#FFFFFF',
                                                                    boxShadow: '0 1px 3px rgba(37, 211, 102, 0.35)',
                                                                    textDecoration: 'none',
                                                                    flexShrink: 0
                                                                }}
                                                            >
                                                                <MessageCircle size={11} strokeWidth={2.4} />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', color: '#334155', fontWeight: 600 }}>
                                            {formatARS(c.requested_price)}
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#16A34A' }}>
                                            {formatARS(c.listing_price)}
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#D97706' }}>
                                            {formatARS(c.commission_amount || (c.listing_price - c.requested_price))}
                                        </td>
                                        <td>
                                            <span style={{
                                                fontSize: 11,
                                                fontWeight: 800,
                                                padding: '3px 9px',
                                                borderRadius: 12,
                                                backgroundColor: st.bg,
                                                color: st.color,
                                                border: `1px solid ${st.border}`,
                                                display: 'inline-block'
                                            }}>
                                                {st.label}
                                            </span>
                                        </td>
                                        <td style={{ color: '#475569', fontSize: 12, fontWeight: 500 }}>
                                            {formatDate(c.start_date)}
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
