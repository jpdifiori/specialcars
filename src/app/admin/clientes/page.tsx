'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getClients } from '@/lib/actions/clients';
import { Client } from '@/lib/types';
import { formatDate } from '@/lib/utils/dates';
import { 
    Users, 
    Plus, 
    Search, 
    User, 
    Phone, 
    Mail, 
    Eye, 
    Clock, 
    CheckCircle2
} from 'lucide-react';

export default function AdminClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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
                </div>

                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#000000' }}>
                        Cargando clientes...
                    </div>
                ) : clients.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: '#000000' }}>
                        <Users size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}>No se encontraron clientes</p>
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
                            {clients.map((c) => (
                                <tr key={c.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: '50%',
                                                backgroundColor: '#171f2e',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#60a5fa',
                                                fontWeight: 700,
                                                fontSize: 13
                                            }}>
                                                {c.first_name[0]}{c.last_name[0]}
                                            </div>
                                            <div>
                                                <Link href={`/admin/clientes/${c.id}`} style={{ fontWeight: 600, color: '#f8fafc' }}>
                                                    {c.first_name} {c.last_name}
                                                </Link>
                                                {c.notes && (
                                                    <div style={{ fontSize: 11, color: '#000000', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {c.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                                        {c.dni ? `DNI: ${c.dni}` : (c.cuit_cuil ? `CUIT: ${c.cuit_cuil}` : '-')}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {c.phone && (
                                                <span style={{ fontSize: 13, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Phone size={12} style={{ color: '#10b981' }} />
                                                    <span>{c.phone}</span>
                                                </span>
                                            )}
                                            {c.email && (
                                                <span style={{ fontSize: 12, color: '#000000', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Mail size={12} />
                                                    <span>{c.email}</span>
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ color: '#000000' }}>
                                        {c.city || c.province ? `${c.city || ''} ${c.province ? `(${c.province})` : ''}` : '-'}
                                    </td>
                                    <td style={{ color: '#000000', fontSize: 12 }}>
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
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
