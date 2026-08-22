'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Client, Vehicle, MatchResult } from '@/lib/types';
import { getClients } from '@/lib/actions/clients';
import { getAdminVehicles } from '@/lib/actions/vehicles';
import { createWantedVehicle } from '@/lib/actions/wanted-vehicles';
import { formatARS, parseARS } from '@/lib/utils/currency';
import { calculateMatchScore } from '@/lib/utils/matching';
import { 
    SearchCheck, 
    Car, 
    User, 
    ArrowLeft, 
    Save, 
    Flame, 
    Check, 
    AlertCircle, 
    Plus, 
    Search, 
    CheckCircle2, 
    HelpCircle,
    SlidersHorizontal,
    Sparkles,
    ShieldCheck
} from 'lucide-react';

export default function NewWantedVehiclePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedClientId = searchParams?.get('client_id');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Clientes
    const [clients, setClients] = useState<Client[]>([]);
    const [clientSearch, setClientSearch] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isSearchingClient, setIsSearchingClient] = useState(false);

    // Stock para Live Matching
    const [stockVehicles, setStockVehicles] = useState<Vehicle[]>([]);

    // Formulario
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        version: '',
        year_min: '',
        year_max: '',
        max_mileage: '',
        fuel_type: '',
        transmission: '',
        body_type: '',
        preferred_color: '',
        max_budget: '',
        accepts_similar_model: true,
        accepts_different_version: true,
        accepts_nearby_year: true,
        has_trade_in: false,
        trade_in_details: '',
        priority: 'MEDIUM',
        notes: ''
    });

    // Cargar clientes iniciales y stock
    useEffect(() => {
        getClients({ limit: 100 }).then(res => {
            setClients(res.data);
            if (preselectedClientId) {
                const found = res.data.find(c => c.id === preselectedClientId);
                if (found) setSelectedClient(found);
            }
        });

        getAdminVehicles({ limit: 100, status: 'AVAILABLE' }).then(res => {
            setStockVehicles(res.data);
        });
    }, [preselectedClientId]);

    // Búsqueda dinámica de clientes
    const handleClientSearch = async (val: string) => {
        setClientSearch(val);
        if (val.length >= 2) {
            setIsSearchingClient(true);
            const res = await getClients({ search: val, limit: 10 });
            setClients(res.data);
            setIsSearchingClient(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Live Matching Preview
    const currentWantedMock: any = {
        brand: formData.brand,
        model: formData.model,
        version: formData.version,
        year_min: formData.year_min ? Number(formData.year_min) : null,
        year_max: formData.year_max ? Number(formData.year_max) : null,
        max_mileage: formData.max_mileage ? Number(formData.max_mileage) : null,
        transmission: formData.transmission || null,
        body_type: formData.body_type || null,
        max_budget: parseARS(formData.max_budget),
        accepts_similar_model: formData.accepts_similar_model,
        accepts_different_version: formData.accepts_different_version,
        accepts_nearby_year: formData.accepts_nearby_year,
        has_trade_in: formData.has_trade_in,
        trade_in_details: formData.trade_in_details
    };

    const liveMatches: MatchResult[] = formData.brand.trim() && formData.model.trim()
        ? stockVehicles
            .map(v => calculateMatchScore(v, currentWantedMock))
            .filter(m => m.score >= 50)
            .sort((a, b) => b.score - a.score)
        : [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedClient) {
            setError('Por favor seleccioná o creá un cliente para asociar la búsqueda.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!formData.brand.trim() || !formData.model.trim()) {
            setError('La Marca y el Modelo son obligatorios.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);

        const res = await createWantedVehicle({
            client_id: selectedClient.id,
            brand: formData.brand,
            model: formData.model,
            version: formData.version || null,
            year_min: formData.year_min ? parseInt(formData.year_min) : null,
            year_max: formData.year_max ? parseInt(formData.year_max) : null,
            max_mileage: formData.max_mileage ? parseInt(formData.max_mileage) : null,
            fuel_type: formData.fuel_type || null,
            transmission: formData.transmission || null,
            body_type: formData.body_type || null,
            preferred_color: formData.preferred_color || null,
            max_budget: parseARS(formData.max_budget),
            accepts_similar_model: formData.accepts_similar_model,
            accepts_different_version: formData.accepts_different_version,
            accepts_nearby_year: formData.accepts_nearby_year,
            has_trade_in: formData.has_trade_in,
            trade_in_details: formData.trade_in_details || null,
            priority: formData.priority,
            notes: formData.notes || null
        });

        if (res.success && res.data) {
            router.push(`/admin/vehiculos-buscados/${res.data.id}`);
        } else {
            setError(res.error || 'Ocurrió un error al registrar la búsqueda.');
            setLoading(false);
        }
    };

    return (
        <div className="admin-page-container">
            {/* Header */}
            <div className="admin-header-actions" style={{ marginBottom: 24 }}>
                <div>
                    <Link
                        href="/admin/vehiculos-buscados"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: '#64748B',
                            fontSize: 13,
                            fontWeight: 700,
                            textDecoration: 'none',
                            marginBottom: 8
                        }}
                    >
                        <ArrowLeft size={16} />
                        <span>Volver a Vehículos Buscados</span>
                    </Link>
                    <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A' }}>
                        Nuevo Pedido de Búsqueda
                    </h1>
                    <p style={{ color: '#64748B', fontSize: 13.5, marginTop: 2 }}>
                        Ingresá los requisitos del comprador. El motor buscará coincidencias en stock actual y alertará en nuevos ingresos.
                    </p>
                </div>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 12,
                    padding: '14px 18px',
                    color: '#991B1B',
                    fontSize: 13.5,
                    fontWeight: 700,
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }}>
                    
                    {/* COLUMNA PRINCIPAL DEL FORMULARIO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        
                        {/* 1. SELECCIÓN DE CLIENTE */}
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 16,
                            padding: 24,
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        backgroundColor: '#FFF7ED',
                                        color: '#EA580C',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 800,
                                        fontSize: 14
                                    }}>1</div>
                                    <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                                        Cliente Interesado *
                                    </h3>
                                </div>

                                <Link
                                    href="/admin/clientes/nuevo"
                                    target="_blank"
                                    style={{
                                        fontSize: 12.5,
                                        fontWeight: 800,
                                        color: '#EA580C',
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4
                                    }}
                                >
                                    <Plus size={14} />
                                    <span>Crear Cliente Nuevo</span>
                                </Link>
                            </div>

                            {selectedClient ? (
                                <div style={{
                                    backgroundColor: '#F8FAFC',
                                    border: '1.5px solid #CBD5E1',
                                    borderRadius: 12,
                                    padding: '14px 18px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>
                                            {selectedClient.first_name} {selectedClient.last_name}
                                        </div>
                                        <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
                                            {selectedClient.phone || selectedClient.whatsapp || 'Sin teléfono'} • {selectedClient.city || 'Ciudad no indicada'}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedClient(null)}
                                        style={{
                                            border: '1px solid #CBD5E1',
                                            backgroundColor: '#FFFFFF',
                                            color: '#64748B',
                                            padding: '6px 12px',
                                            borderRadius: 8,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cambiar
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        backgroundColor: '#F8FAFC',
                                        border: '1px solid #CBD5E1',
                                        borderRadius: 10,
                                        padding: '10px 14px',
                                        marginBottom: 10
                                    }}>
                                        <Search size={16} style={{ color: '#64748B' }} />
                                        <input
                                            type="text"
                                            value={clientSearch}
                                            onChange={(e) => handleClientSearch(e.target.value)}
                                            placeholder="Buscar cliente por nombre, apellido, teléfono..."
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                outline: 'none',
                                                fontSize: 13.5,
                                                color: '#0F172A',
                                                width: '100%'
                                            }}
                                        />
                                    </div>

                                    <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 10 }}>
                                        {clients.map(c => (
                                            <div
                                                key={c.id}
                                                onClick={() => setSelectedClient(c)}
                                                style={{
                                                    padding: '10px 14px',
                                                    borderBottom: '1px solid #F1F5F9',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.15s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <div>
                                                    <span style={{ fontWeight: 800, color: '#0F172A', fontSize: 13.5 }}>{c.first_name} {c.last_name}</span>
                                                    <span style={{ fontSize: 12, color: '#64748B', marginLeft: 8 }}>{c.phone || c.email || ''}</span>
                                                </div>
                                                <span style={{ fontSize: 12, color: '#EA580C', fontWeight: 700 }}>Seleccionar</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. REQUISITOS DEL VEHÍCULO */}
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 16,
                            padding: 24,
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: '#FFF7ED',
                                    color: '#EA580C',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: 14
                                }}>2</div>
                                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                                    Vehículo Deseado
                                </h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Marca Deseada *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.brand}
                                        onChange={(e) => updateField('brand', e.target.value)}
                                        placeholder="Ej: Volkswagen, Toyota, Ford..."
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: 10,
                                            border: '1.5px solid #CBD5E1',
                                            fontSize: 13.5,
                                            fontWeight: 600,
                                            color: '#0F172A'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Modelo *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.model}
                                        onChange={(e) => updateField('model', e.target.value)}
                                        placeholder="Ej: Amarok V6, Hilux, Taos, Cruze..."
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: 10,
                                            border: '1.5px solid #CBD5E1',
                                            fontSize: 13.5,
                                            fontWeight: 600,
                                            color: '#0F172A'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Versión (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.version}
                                        onChange={(e) => updateField('version', e.target.value)}
                                        placeholder="Ej: Highline, SRV, Titanium..."
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: 10,
                                            border: '1.5px solid #CBD5E1',
                                            fontSize: 13.5,
                                            fontWeight: 600,
                                            color: '#0F172A'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Presupuesto Máximo (ARS)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.max_budget}
                                        onChange={(e) => updateField('max_budget', formatARS(e.target.value))}
                                        placeholder="Ej: $ 45.000.000 (0 = sin tope)"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: 10,
                                            border: '1.5px solid #CBD5E1',
                                            fontSize: 13.5,
                                            fontWeight: 700,
                                            color: '#059669'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Año Mínimo
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.year_min}
                                        onChange={(e) => updateField('year_min', e.target.value)}
                                        placeholder="Ej: 2021"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: 10,
                                            border: '1.5px solid #CBD5E1',
                                            fontSize: 13.5,
                                            color: '#0F172A'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Año Máximo
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.year_max}
                                        onChange={(e) => updateField('year_max', e.target.value)}
                                        placeholder="Ej: 2024"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: 10,
                                            border: '1.5px solid #CBD5E1',
                                            fontSize: 13.5,
                                            color: '#0F172A'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Kilómetros Máximos
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.max_mileage}
                                        onChange={(e) => updateField('max_mileage', e.target.value)}
                                        placeholder="Ej: 80000 (0 = sin límite)"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: 10,
                                            border: '1.5px solid #CBD5E1',
                                            fontSize: 13.5,
                                            color: '#0F172A'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Transmisión
                                    </label>
                                    <select
                                        value={formData.transmission}
                                        onChange={(e) => updateField('transmission', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: 10,
                                            border: '1.5px solid #CBD5E1',
                                            fontSize: 13.5,
                                            color: '#0F172A'
                                        }}
                                    >
                                        <option value="">Indistinta (Manual o Automática)</option>
                                        <option value="MANUAL">Manual</option>
                                        <option value="AUTOMATIC">Automática</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Combustible
                                    </label>
                                    <select
                                        value={formData.fuel_type}
                                        onChange={(e) => updateField('fuel_type', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: 10,
                                            border: '1.5px solid #CBD5E1',
                                            fontSize: 13.5,
                                            color: '#0F172A'
                                        }}
                                    >
                                        <option value="">Indistinto</option>
                                        <option value="NAFTA">Nafta</option>
                                        <option value="DIESEL">Diesel</option>
                                        <option value="GNC">GNC</option>
                                        <option value="HYBRID">Híbrido</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Carrocería
                                    </label>
                                    <select
                                        value={formData.body_type}
                                        onChange={(e) => updateField('body_type', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: 10,
                                            border: '1.5px solid #CBD5E1',
                                            fontSize: 13.5,
                                            color: '#0F172A'
                                        }}
                                    >
                                        <option value="">Indistinta</option>
                                        <option value="PICKUP">Pickup / Camioneta</option>
                                        <option value="SUV">SUV</option>
                                        <option value="AUTO">Sedán / Hatchback</option>
                                        <option value="UTILITY">Utilitario</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 3. TOLERANCIA Y PERMUTA (CLAVES DEL MATCHING) */}
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 16,
                            padding: 24,
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: '#FFF7ED',
                                    color: '#EA580C',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: 14
                                }}>3</div>
                                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                                    Criterios de Tolerancia Comercial & Permuta
                                </h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.accepts_similar_model}
                                        onChange={(e) => updateField('accepts_similar_model', e.target.checked)}
                                        style={{ width: 18, height: 18, accentColor: '#EA580C' }}
                                    />
                                    <div>
                                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                                            ¿Acepta vehículo similar? (Recomendado)
                                        </div>
                                        <div style={{ fontSize: 12, color: '#64748B' }}>
                                            Si busca Amarok V6, también considerará Hilux o Ranger del mismo segmento. Si se desmarca, exige modelo 100% estricto.
                                        </div>
                                    </div>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.accepts_nearby_year}
                                        onChange={(e) => updateField('accepts_nearby_year', e.target.checked)}
                                        style={{ width: 18, height: 18, accentColor: '#EA580C' }}
                                    />
                                    <div>
                                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                                            ¿Acepta año cercano? (+/- 1 o 2 años de tolerancia)
                                        </div>
                                        <div style={{ fontSize: 12, color: '#64748B' }}>
                                            Permite mostrar unidades impecables que se pasen por poco del rango de años deseado.
                                        </div>
                                    </div>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.accepts_different_version}
                                        onChange={(e) => updateField('accepts_different_version', e.target.checked)}
                                        style={{ width: 18, height: 18, accentColor: '#EA580C' }}
                                    />
                                    <div>
                                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                                            ¿Acepta otra versión del mismo modelo?
                                        </div>
                                        <div style={{ fontSize: 12, color: '#64748B' }}>
                                            Por ejemplo, si busca versión Highline, tolera versiones Extreme o Comfortline.
                                        </div>
                                    </div>
                                </label>

                                <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '8px 0' }} />

                                {/* Permuta */}
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 10 }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.has_trade_in}
                                            onChange={(e) => updateField('has_trade_in', e.target.checked)}
                                            style={{ width: 18, height: 18, accentColor: '#2563EB' }}
                                        />
                                        <div>
                                            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1E40AF' }}>
                                                ¿Entrega vehículo en parte de pago (Permuta)?
                                            </div>
                                            <div style={{ fontSize: 12, color: '#64748B' }}>
                                                Marcá esta opción si el cliente necesita entregar su usado para concretar la operación.
                                            </div>
                                        </div>
                                    </label>

                                    {formData.has_trade_in && (
                                        <div style={{ marginLeft: 28 }}>
                                            <input
                                                type="text"
                                                value={formData.trade_in_details}
                                                onChange={(e) => updateField('trade_in_details', e.target.value)}
                                                placeholder="Ej: Ford EcoSport Titanium 2017 95.000km, titular al día"
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 14px',
                                                    borderRadius: 10,
                                                    border: '1.5px solid #93C5FD',
                                                    fontSize: 13.5,
                                                    backgroundColor: '#EFF6FF',
                                                    color: '#1E3A8A'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 4. PRIORIDAD Y NOTAS */}
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 16,
                            padding: 24,
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Prioridad Comercial
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => updateField('priority', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: 10,
                                            border: '1.5px solid #CBD5E1',
                                            fontSize: 13.5,
                                            fontWeight: 700,
                                            color: formData.priority === 'HIGH' ? '#EA580C' : '#0F172A'
                                        }}
                                    >
                                        <option value="HIGH">Alta 🔥 (Compra urgente / dinero listo)</option>
                                        <option value="MEDIUM">Media (Evaluando opciones)</option>
                                        <option value="LOW">Baja (Sin apuro)</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Notas de Seguimiento
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.notes}
                                        onChange={(e) => updateField('notes', e.target.value)}
                                        placeholder="Comentarios adicionales, disponibilidad horaria, etc."
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: 10,
                                            border: '1.5px solid #CBD5E1',
                                            fontSize: 13.5,
                                            color: '#0F172A'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botones de Envío */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                            <Link
                                href="/admin/vehiculos-buscados"
                                style={{
                                    padding: '12px 20px',
                                    borderRadius: 10,
                                    border: '1px solid #CBD5E1',
                                    backgroundColor: '#FFFFFF',
                                    color: '#64748B',
                                    fontWeight: 700,
                                    fontSize: 14,
                                    textDecoration: 'none'
                                }}
                            >
                                Cancelar
                            </Link>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    backgroundColor: '#EA580C',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '12px 28px',
                                    borderRadius: 10,
                                    fontWeight: 800,
                                    fontSize: 14,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                <Save size={18} />
                                <span>{loading ? 'Guardando...' : 'Guardar y Activar Match'}</span>
                            </button>
                        </div>
                    </div>

                    {/* COLUMNA LATERAL: COINCIDENCIAS EN VIVO CON STOCK */}
                    <div style={{
                        position: 'sticky',
                        top: 24,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        border: '1.5px solid #E2E8F0',
                        padding: 20,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <Sparkles size={18} style={{ color: '#EA580C' }} />
                            <h3 style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                                Coincidencias en Stock Actual
                            </h3>
                        </div>

                        {liveMatches.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ fontSize: 12.5, color: '#059669', fontWeight: 800 }}>
                                    ¡Hay {liveMatches.length} vehículo(s) en stock compatibles!
                                </div>

                                {liveMatches.slice(0, 4).map((m, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            backgroundColor: '#F8FAFC',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: 10,
                                            padding: 10,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 4
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 800, fontSize: 13, color: '#0F172A' }}>
                                                {m.vehicle?.brand} {m.vehicle?.model} ({m.vehicle?.year})
                                            </span>
                                            <span style={{
                                                backgroundColor: m.score >= 80 ? '#EA580C' : '#64748B',
                                                color: '#FFFFFF',
                                                fontSize: 10.5,
                                                fontWeight: 800,
                                                padding: '1px 6px',
                                                borderRadius: 8
                                            }}>
                                                {m.score}%
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
                                            {formatARS(m.vehicle?.sale_price)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : formData.brand.trim() ? (
                            <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>
                                No hay vehículos en stock que coincidan con estos criterios actualmente. Al ingresar un auto nuevo, el sistema alertará automáticamente.
                            </div>
                        ) : (
                            <div style={{ fontSize: 12.5, color: '#94A3B8', fontStyle: 'italic', lineHeight: 1.5 }}>
                                Completá la marca y modelo para previsualizar si ya tenés un vehículo en stock que le pueda interesar.
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
