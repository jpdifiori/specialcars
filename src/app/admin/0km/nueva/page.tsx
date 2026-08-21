'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getClients } from '@/lib/actions/clients';
import { createZeroKmOperation } from '@/lib/actions/zero-km';
import { Client } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function NewZeroKmPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clients, setClients] = useState<Client[]>([]);

    const [formData, setFormData] = useState({
        client_id: '',
        brand: '',
        model: '',
        version: '',
        year: new Date().getFullYear(),
        color: '',
        provider: '',
        cost: 0,
        client_price: 0,
        commission: 0,
        estimated_date: '',
        notes: ''
    });

    useEffect(() => {
        getClients({ limit: 100 }).then(res => setClients(res.data));
    }, []);

    const updateField = (field: string, value: any) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'cost' || field === 'client_price') {
                updated.commission = (Number(updated.client_price) || 0) - (Number(updated.cost) || 0);
            }
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.client_id || !formData.brand || !formData.model) {
            setError('Por favor completá cliente, marca y modelo.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await createZeroKmOperation(formData as any);
            if (!res.success) {
                setError(res.error || 'Error al registrar pedido 0 KM');
                setLoading(false);
                return;
            }

            router.push('/admin/0km');
        } catch (err: any) {
            setError(err.message || 'Error inesperado');
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ marginBottom: 20 }}>
                <Link href="/admin/0km" style={{ fontSize: 13, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <ArrowLeft size={14} />
                    <span>Volver a 0 KM</span>
                </Link>
                <h1 className="admin-page-title">Nuevo Pedido de 0 KM</h1>
                <p className="admin-page-desc">Registrá una operación de unidad 0 KM pactada con el cliente y el concesionario proveedor.</p>
            </div>

            {error && (
                <div className="alert-banner danger" style={{ marginBottom: 20 }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="table-container" style={{ padding: 32 }}>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Cliente Comprador *</label>
                        <select
                            className="form-select"
                            value={formData.client_id}
                            onChange={(e) => updateField('client_id', e.target.value)}
                            required
                        >
                            <option value="">-- Seleccionar Cliente --</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.first_name} {c.last_name} {c.dni ? `(DNI: ${c.dni})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Marca *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Toyota"
                            value={formData.brand}
                            onChange={(e) => updateField('brand', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Modelo *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Corolla Cross"
                            value={formData.model}
                            onChange={(e) => updateField('model', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Versión</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: SEG Hybrid"
                            value={formData.version}
                            onChange={(e) => updateField('version', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Color Solicitado</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Gris Plata"
                            value={formData.color}
                            onChange={(e) => updateField('color', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Concesionario Oficial / Proveedor</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Toyota Kansai / Centro"
                            value={formData.provider}
                            onChange={(e) => updateField('provider', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Costo Proveedor ($ ARS)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.cost || ''}
                            onChange={(e) => updateField('cost', parseInt(e.target.value, 10) || 0)}
                        />
                        <span className="form-help">Costo: {formatARS(formData.cost)}</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Precio al Cliente ($ ARS)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.client_price || ''}
                            onChange={(e) => updateField('client_price', parseInt(e.target.value, 10) || 0)}
                        />
                        <span className="form-help" style={{ color: '#34d399', fontWeight: 600 }}>
                            Cobro cliente: {formatARS(formData.client_price)}
                        </span>
                    </div>
                </div>

                <div style={{
                    backgroundColor: '#151b2a',
                    borderRadius: 10,
                    padding: '16px 20px',
                    margin: '20px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <span style={{ fontSize: 13, color: '#000000' }}>Comisión Proyectada de la Agencia:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: '#fbbf24' }}>
                        {formatARS(formData.commission)}
                    </span>
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label">Observaciones</label>
                    <textarea
                        className="form-textarea"
                        rows={3}
                        placeholder="Plazos de entrega prometidos, número de pedido de fábrica..."
                        value={formData.notes}
                        onChange={(e) => updateField('notes', e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button type="button" onClick={() => router.back()} className="btn-secondary">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                        <Save size={16} />
                        <span>{loading ? 'Guardando...' : 'Crear Pedido 0 KM'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
