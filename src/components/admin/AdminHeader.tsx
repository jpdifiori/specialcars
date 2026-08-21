'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ExternalLink, Car, User, ArrowLeftRight, X } from 'lucide-react';
import { performGlobalSearch, GlobalSearchResult } from '@/lib/actions/search';
import { formatARS } from '@/lib/utils/currency';

export function AdminHeader() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GlobalSearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (!query || query.trim().length < 2) {
            setResults(null);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await performGlobalSearch(query);
                setResults(res);
                setIsOpen(true);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [query]);

    // Cerrar dropdown al hacer click afuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (url: string) => {
        setIsOpen(false);
        setQuery('');
        router.push(url);
    };

    return (
        <header className="admin-header">
            {/* Buscador Global */}
            <div className="admin-search-wrapper" ref={dropdownRef}>
                <Search size={16} className="admin-search-icon" />
                <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Buscar patente, VIN, código, marca, cliente, DNI, operación..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results && setIsOpen(true)}
                />
                {query && (
                    <button 
                        onClick={() => { setQuery(''); setIsOpen(false); }}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
                    >
                        <X size={14} />
                    </button>
                )}

                {/* Dropdown de resultados */}
                {isOpen && results && (
                    <div className="admin-search-dropdown">
                        {isLoading && (
                            <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                                Buscando...
                            </div>
                        )}

                        {!isLoading && results.vehicles.length === 0 && results.clients.length === 0 && results.operations.length === 0 && (
                            <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                                No se encontraron resultados para &quot;{query}&quot;
                            </div>
                        )}

                        {/* Vehículos */}
                        {results.vehicles.length > 0 && (
                            <div>
                                <div className="search-section-title">Vehículos</div>
                                {results.vehicles.map((v) => (
                                    <div
                                        key={v.id}
                                        className="search-item"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleSelect(`/admin/vehiculos/${v.id}`)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Car size={14} style={{ color: '#3b82f6' }} />
                                            <span><strong>{v.stock_code}</strong> — {v.title}</span>
                                            {v.plate && <span style={{ color: '#94a3b8', fontSize: 11 }}>({v.plate})</span>}
                                        </div>
                                        <span style={{ color: '#34d399', fontWeight: 600, fontSize: 12 }}>
                                            {formatARS(v.sale_price)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Clientes */}
                        {results.clients.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <div className="search-section-title">Clientes</div>
                                {results.clients.map((c) => (
                                    <div
                                        key={c.id}
                                        className="search-item"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleSelect(`/admin/clientes/${c.id}`)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <User size={14} style={{ color: '#10b981' }} />
                                            <span><strong>{c.name}</strong></span>
                                            {c.dni && <span style={{ color: '#94a3b8', fontSize: 11 }}>DNI: {c.dni}</span>}
                                        </div>
                                        {c.phone && <span style={{ color: '#94a3b8', fontSize: 12 }}>{c.phone}</span>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Operaciones */}
                        {results.operations.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <div className="search-section-title">Operaciones</div>
                                {results.operations.map((o) => (
                                    <div
                                        key={o.id}
                                        className="search-item"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleSelect(`/admin/operaciones/${o.id}`)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <ArrowLeftRight size={14} style={{ color: '#f59e0b' }} />
                                            <span><strong>{o.operation_code}</strong> — {o.client_name}</span>
                                        </div>
                                        <span style={{ color: '#60a5fa', fontWeight: 600, fontSize: 12 }}>
                                            {formatARS(o.agreed_price)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Accesos Rápidos Header */}
            <div className="admin-header-actions">
                <Link
                    href="/"
                    target="_blank"
                    className="admin-public-link"
                >
                    <ExternalLink size={14} />
                    <span>Ver Catálogo Web</span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#60a5fa' }}>
                        JP
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc' }}>Juan Pablo</span>
                        <span style={{ fontSize: 11, color: '#64748b' }}>Administrador</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
