'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getClients } from '@/lib/actions/clients';
import { Client } from '@/lib/types';
import { formatDate } from '@/lib/utils/dates';
import { buildWhatsAppUrl } from '@/lib/utils/phone';
import { 
    Users, 
    Plus, 
    Search, 
    User, 
    Phone, 
    Mail, 
    Eye, 
    Clock, 
    CheckCircle2,
    Globe,
    UserCheck
} from 'lucide-react';

export default function AdminClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [originFilter, setOriginFilter] = useState<'ALL' | 'WEB' | 'ADMIN'>('ALL');

    const loadClients = async () => {
        setLoading(true);
        try {
            const res = await getClients({ search, limit: 50 });
            setClients(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadClients();
    };

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Directorio de Clientes</h1>
                    <p className="admin-page-desc">Registros internos de compradores, vendedores, consignatarios y titulares de permutas.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link href="/admin/clientes/nuevo" className="btn-primary">
                        <Plus size={16} />
                        <span>Nuevo Cliente</span>
                    </Link>
                </div>
            </div>

            <div className="table-container">
                <div className="table-toolbar">
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, maxWidth: 460 }}>
                        <input
                            type="text"
                            className="admin-input"
                            style={{ flex: 1 }}
                            placeholder="Buscar por nombre, apellido, DNI, CUIT, teléfono, email..."
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
                            value={originFilter}
                            onChange={(e) => setOriginFilter(e.target.value as any)}
                        >
                            <option value="ALL">Todos los orígenes</option>
                            <option value="WEB">🌐 Registrados en la Web</option>
                            <option value="ADMIN">👤 Cargados por Admin</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#000000' }}>
                        Cargando clientes...
                    </div>
                ) : clients.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: '#000000' }}>
                        <Users size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#000000', marginBottom: 4 }}>No se encontraron clientes</p>
                        <p style={{ fontSize: 13, marginBottom: 16 }}>Comenzá cargando los datos de un cliente para asociarlo a ventas o compras.</p>
                        <Link href="/admin/clientes/nuevo" className="btn-primary">
                            <Plus size={15} />
                            <span>Crear primer cliente</span>
                        </Link>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>DNI / CUIT</th>
                                <th>Contacto</th>
                                <th>Ciudad / Provincia</th>
                                <th>Fecha Alta</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients
                                .filter((c) => {
                                    const isWeb = Boolean(c.notes && (c.notes.includes('Landing Page') || c.notes.toLowerCase().includes('automáticamente')));
                                    if (originFilter === 'WEB') return isWeb;
                                    if (originFilter === 'ADMIN') return !isWeb;
                                    return true;
                                })
                                .map((c) => {
                                    const isWeb = Boolean(c.notes && (c.notes.includes('Landing Page') || c.notes.toLowerCase().includes('automáticamente')));
                                    const customNote = isWeb ? null : c.notes;

                                    return (
                                        <tr key={c.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{
                                                        width: 34,
                                                        height: 34,
                                                        borderRadius: '50%',
                                                        backgroundColor: isWeb ? '#EFF6FF' : '#FFF7ED',
                                                        border: `1px solid ${isWeb ? '#BFDBFE' : '#FFEDD5'}`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: isWeb ? '#2563EB' : '#EA580C',
                                                        fontWeight: 700,
                                                        fontSize: 13
                                                    }}>
                                                        {c.first_name[0]}{c.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                            <Link href={`/admin/clientes/${c.id}`} style={{ fontWeight: 700, color: '#0F172A' }}>
                                                                {c.first_name} {c.last_name}
                                                            </Link>
                                                            {isWeb ? (
                                                                <span style={{
                                                                    fontSize: 10,
                                                                    fontWeight: 800,
                                                                    backgroundColor: '#EFF6FF',
                                                                    color: '#1D4ED8',
                                                                    border: '1px solid #BFDBFE',
                                                                    padding: '1px 6px',
                                                                    borderRadius: 10,
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: 3
                                                                }}>
                                                                    <Globe size={10} />
                                                                    <span>Web / Landing</span>
                                                                </span>
                                                            ) : (
                                                                <span style={{
                                                                    fontSize: 10,
                                                                    fontWeight: 700,
                                                                    backgroundColor: '#F1F5F9',
                                                                    color: '#475569',
                                                                    border: '1px solid #CBD5E1',
                                                                    padding: '1px 6px',
                                                                    borderRadius: 10,
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: 3
                                                                }}>
                                                                    <UserCheck size={10} />
                                                                    <span>Admin</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        {customNote && (
                                                            <div style={{ fontSize: 11, color: '#64748B', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                                                                {customNote}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A', fontSize: 13 }}>
                                        {c.dni ? `DNI: ${c.dni}` : (c.cuit_cuil ? `CUIT: ${c.cuit_cuil}` : <span style={{ color: '#94A3B8' }}>—</span>)}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {c.phone && (
                                                <a
                                                    href={buildWhatsAppUrl(c.phone)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        fontSize: 13,
                                                        color: '#0F172A',
                                                        fontWeight: 700,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        textDecoration: 'none'
                                                    }}
                                                    title="Escribir por WhatsApp"
                                                >
                                                    <Phone size={13} style={{ color: '#16A34A', flexShrink: 0 }} />
                                                    <span>{c.phone}</span>
                                                </a>
                                            )}
                                            {c.email && (
                                                <a
                                                    href={`mailto:${c.email}`}
                                                    style={{
                                                        fontSize: 12,
                                                        color: '#334155',
                                                        fontWeight: 500,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    <Mail size={13} style={{ color: '#64748B', flexShrink: 0 }} />
                                                    <span>{c.email}</span>
                                                </a>
                                            )}
                                            {!c.phone && !c.email && (
                                                <span style={{ color: '#94A3B8', fontSize: 12 }}>Sin contacto</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ color: '#0F172A', fontSize: 13, fontWeight: 600 }}>
                                        {c.city || c.province ? `${c.city || ''} ${c.province ? `(${c.province})` : ''}` : <span style={{ color: '#94A3B8' }}>—</span>}
                                    </td>
                                    <td style={{ color: '#334155', fontSize: 12.5, fontWeight: 700 }}>
                                        {formatDate(c.created_at)}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <Link 
                                            href={`/admin/clientes/${c.id}`}
                                            className="btn-secondary"
                                            style={{ padding: '6px 12px', fontSize: 12 }}
                                        >
                                            <Eye size={14} />
                                            <span>Ficha 360°</span>
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
