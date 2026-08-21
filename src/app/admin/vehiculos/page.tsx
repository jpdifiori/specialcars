'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminVehicles } from '@/lib/actions/vehicles';
import { Vehicle } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';
import { 
    Car,
    Plus, 
    Search, 
    Filter, 
    Eye, 
    Edit, 
    LayoutGrid, 
    List, 
    Globe, 
    Clock, 
    CheckCircle2, 
    Image as ImageIcon
} from 'lucide-react';

export default function AdminVehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    
    // Filtros
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('ALL');
    const [originType, setOriginType] = useState('ALL');
    const [published, setPublished] = useState('ALL');

    const loadVehicles = async () => {
        setLoading(true);
        try {
            const res = await getAdminVehicles({
                search,
                status,
                origin_type: originType,
                published: published === 'ALL' ? undefined : published === 'true',
                limit: 50
            });
            setVehicles(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVehicles();
    }, [status, originType, published]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadVehicles();
    };

    const getStatusBadge = (vehStatus: string) => {
        switch (vehStatus) {
            case 'AVAILABLE':
                return <span className="badge badge-available">Disponible</span>;
            case 'RESERVED':
                return <span className="badge badge-reserved">Reservado</span>;
            case 'IN_PREPARATION':
                return <span className="badge badge-prep">En Prep.</span>;
            case 'SOLD':
                return <span className="badge badge-sold">Vendido</span>;
            default:
                return <span className="badge">{vehStatus}</span>;
        }
    };

    const getOriginBadge = (origin: string) => {
        switch (origin) {
            case 'TRADE_IN':
                return <span className="badge badge-trade-in">Permuta</span>;
            case 'CONSIGNMENT':
                return <span className="badge badge-consignment">Consignación</span>;
            default:
                return <span className="badge" style={{ background: '#1e293b', color: '#000000' }}>Propio</span>;
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Inventario de Vehículos</h1>
                    <p className="admin-page-desc">Administrá todo el stock, precios en ARS, fotografías, estados y publicación web.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link href="/admin/vehiculos/nuevo" className="btn-primary">
                        <Plus size={16} />
                        <span>Cargar Vehículo</span>
                    </Link>
                </div>
            </div>

            {/* Toolbar y Filtros */}
            <div className="table-container" style={{ marginBottom: 20 }}>
                <div className="table-toolbar">
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260, maxWidth: 460 }}>
                        <input
                            type="text"
                            className="admin-input"
                            style={{ flex: 1 }}
                            placeholder="Buscar por patente, marca, modelo, código, VIN..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn-secondary" style={{ padding: '0 14px' }}>
                            <Search size={15} />
                        </button>
                    </form>

                    <div className="table-filters">
                        <select 
                            className="admin-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="ALL">Todos los estados</option>
                            <option value="AVAILABLE">Disponibles</option>
                            <option value="RESERVED">Reservados</option>
                            <option value="IN_PREPARATION">En Preparación</option>
                            <option value="SOLD">Vendidos</option>
                            <option value="DRAFT">Borradores</option>
                        </select>

                        <select 
                            className="admin-select"
                            value={originType}
                            onChange={(e) => setOriginType(e.target.value)}
                        >
                            <option value="ALL">Todos los orígenes</option>
                            <option value="DIRECT_PURCHASE">Compra Directa</option>
                            <option value="TRADE_IN">Permuta</option>
                            <option value="CONSIGNMENT">Consignación</option>
                        </select>

                        <select 
                            className="admin-select"
                            value={published}
                            onChange={(e) => setPublished(e.target.value)}
                        >
                            <option value="ALL">Publicación Web: Todos</option>
                            <option value="true">Publicados en Web</option>
                            <option value="false">No Publicados</option>
                        </select>

                        {/* Toggle Vista */}
                        <div style={{ display: 'flex', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 6, overflow: 'hidden' }}>
                            <button
                                onClick={() => setViewMode('table')}
                                style={{ padding: '8px 12px', background: viewMode === 'table' ? '#EA580C' : 'transparent', color: viewMode === 'table' ? '#fff' : '#000' }}
                                title="Vista Tabla"
                            >
                                <List size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('cards')}
                                style={{ padding: '8px 12px', background: viewMode === 'cards' ? '#EA580C' : 'transparent', color: viewMode === 'cards' ? '#fff' : '#000' }}
                                title="Vista Cards"
                            >
                                <LayoutGrid size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading state */}
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#000000' }}>
                        Cargando inventario...
                    </div>
                ) : vehicles.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: '#000000' }}>
                        <Car size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#000000', marginBottom: 4 }}>No se encontraron vehículos</p>
                        <p style={{ fontSize: 13, marginBottom: 16 }}>No hay vehículos que coincidan con los filtros seleccionados.</p>
                        <Link href="/admin/vehiculos/nuevo" className="btn-primary">
                            <Plus size={15} />
                            <span>Cargar primer vehículo</span>
                        </Link>
                    </div>
                ) : viewMode === 'table' ? (
                    /* VISTA TABLA */
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Código / Foto</th>
                                <th>Vehículo</th>
                                <th>Patente</th>
                                <th>Origen</th>
                                <th>Estado</th>
                                <th>Precio Venta (ARS)</th>
                                <th>Costo Real (ARS)</th>
                                <th>Web</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((v) => {
                                const primaryImg = v.images?.find((img) => img.is_primary) || v.images?.[0];
                                return (
                                    <tr key={v.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 44,
                                                    height: 34,
                                                    borderRadius: 6,
                                                    backgroundColor: '#F1F5F9',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '1px solid #E2E8F0'
                                                }}>
                                                    {primaryImg?.url ? (
                                                        <img src={primaryImg.url} alt={v.brand} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <ImageIcon size={14} style={{ color: '#94A3B8' }} />
                                                    )}
                                                </div>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#EA580C', fontSize: 12 }}>
                                                    {v.stock_code}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <Link href={`/admin/vehiculos/${v.id}`} style={{ fontWeight: 600, color: '#000000' }}>
                                                {v.brand} {v.model} {v.version || ''}
                                            </Link>
                                            <div style={{ fontSize: 12, color: '#000000' }}>
                                                Año {v.year} • {v.mileage?.toLocaleString('es-AR')} km
                                            </div>
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                            {v.plate || '-'}
                                        </td>
                                        <td>
                                            {getOriginBadge(v.origin_type)}
                                        </td>
                                        <td>
                                            {getStatusBadge(v.status)}
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                                            {formatARS(v.sale_price)}
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', color: '#000000' }}>
                                            {formatARS(v.real_cost)}
                                        </td>
                                        <td>
                                            {v.published ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#34d399', fontSize: 12, fontWeight: 600 }}>
                                                    <Globe size={13} />
                                                    <span>Online</span>
                                                </span>
                                            ) : (
                                                <span style={{ color: '#000000', fontSize: 12 }}>Off</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                <Link 
                                                    href={`/admin/vehiculos/${v.id}`}
                                                    className="btn-secondary"
                                                    style={{ padding: '6px 10px', fontSize: 12 }}
                                                    title="Ver Ficha 360°"
                                                >
                                                    <Eye size={14} />
                                                </Link>
                                                <Link 
                                                    href={`/admin/vehiculos/${v.id}/editar`}
                                                    className="btn-secondary"
                                                    style={{ padding: '6px 10px', fontSize: 12 }}
                                                    title="Editar"
                                                >
                                                    <Edit size={14} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    /* VISTA CARDS */
                    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
                        {vehicles.map((v) => {
                            const primaryImg = v.images?.find((img) => img.is_primary) || v.images?.[0];
                            return (
                                <div key={v.id} style={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <div style={{ position: 'relative', width: '100%', height: 160, backgroundColor: '#F1F5F9' }}>
                                        {primaryImg?.url ? (
                                            <img src={primaryImg.url} alt={v.brand} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1' }}>
                                                <ImageIcon size={28} />
                                            </div>
                                        )}
                                        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                                            {getStatusBadge(v.status)}
                                            {getOriginBadge(v.origin_type)}
                                        </div>
                                    </div>
                                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div style={{ fontSize: 11, color: '#EA580C', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                            {v.stock_code} {v.plate ? `• ${v.plate}` : ''}
                                        </div>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#000000', margin: '4px 0' }}>
                                            {v.brand} {v.model}
                                        </h3>
                                        <div style={{ fontSize: 12, color: '#334155', marginBottom: 12 }}>
                                            {v.version || ''} • {v.year} • {v.mileage?.toLocaleString('es-AR')} km
                                        </div>
                                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
                                            <div>
                                                <div style={{ fontSize: 11, color: '#334155', fontWeight: 600 }}>Precio de Venta</div>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#059669', fontSize: 16 }}>
                                                    {formatARS(v.sale_price)}
                                                </div>
                                            </div>
                                            <Link href={`/admin/vehiculos/${v.id}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                                                Ver Ficha
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
