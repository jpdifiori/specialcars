'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vehicle } from '@/lib/types';
import { updateVehicle } from '@/lib/actions/vehicles';
import { formatARS } from '@/lib/utils/currency';
import { Save, AlertCircle } from 'lucide-react';

export function EditVehicleForm({ vehicle }: { vehicle: Vehicle }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        version: vehicle.version || '',
        year: vehicle.year || new Date().getFullYear(),
        mileage: vehicle.mileage || 0,
        fuel_type: vehicle.fuel_type || 'NAFTA',
        transmission: vehicle.transmission || 'MANUAL',
        body_type: vehicle.body_type || 'AUTO',
        doors: vehicle.doors || 4,
        exterior_color: vehicle.exterior_color || '',
        interior_color: vehicle.interior_color || '',
        plate: vehicle.plate || '',
        vin: vehicle.vin || '',
        engine_number: vehicle.engine_number || '',
        purchase_price: vehicle.purchase_price || 0,
        sale_price: vehicle.sale_price || 0,
        minimum_price: vehicle.minimum_price || 0,
        origin_type: vehicle.origin_type || 'DIRECT_PURCHASE',
        status: vehicle.status || 'AVAILABLE',
        published: vehicle.published,
        featured: vehicle.featured,
        commercial_title: vehicle.commercial_title || '',
        description: vehicle.description || '',
        equipment: vehicle.equipment || '',
        features: vehicle.features || ''
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await updateVehicle(vehicle.id, formData);
            if (!res.success) {
                setError(res.error || 'Error al actualizar vehículo');
                setLoading(false);
                return;
            }

            router.push(`/admin/vehiculos/${vehicle.id}`);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error inesperado');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="table-container" style={{ padding: 28 }}>
            {error && (
                <div className="alert-banner danger" style={{ marginBottom: 20 }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#000000', marginBottom: 16 }}>
                Datos Generales y Técnicos
            </h3>
            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Marca *</label>
                    <input
                        type="text"
                        className="form-input"
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
                        value={formData.version}
                        onChange={(e) => updateField('version', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Año</label>
                    <input
                        type="number"
                        className="form-input"
                        value={formData.year}
                        onChange={(e) => updateField('year', parseInt(e.target.value, 10))}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Kilómetros</label>
                    <input
                        type="number"
                        className="form-input"
                        value={formData.mileage}
                        onChange={(e) => updateField('mileage', parseInt(e.target.value, 10) || 0)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Patente</label>
                    <input
                        type="text"
                        className="form-input"
                        style={{ textTransform: 'uppercase' }}
                        value={formData.plate}
                        onChange={(e) => updateField('plate', e.target.value.toUpperCase())}
                    />
                </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#000000', margin: '24px 0 16px' }}>
                Valores Comerciales (ARS)
            </h3>
            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Valor de Compra / Toma ($ ARS)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={formData.purchase_price}
                        onChange={(e) => updateField('purchase_price', parseInt(e.target.value, 10) || 0)}
                    />
                    <span className="form-help">{formatARS(formData.purchase_price)}</span>
                </div>

                <div className="form-group">
                    <label className="form-label">Precio de Venta ($ ARS) *</label>
                    <input
                        type="number"
                        className="form-input"
                        value={formData.sale_price}
                        onChange={(e) => updateField('sale_price', parseInt(e.target.value, 10) || 0)}
                        required
                    />
                    <span className="form-help" style={{ color: '#059669', fontWeight: 600 }}>{formatARS(formData.sale_price)}</span>
                </div>

                <div className="form-group">
                    <label className="form-label">Precio Mínimo ($ ARS)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={formData.minimum_price}
                        onChange={(e) => updateField('minimum_price', parseInt(e.target.value, 10) || 0)}
                    />
                    <span className="form-help">{formatARS(formData.minimum_price)}</span>
                </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#000000', margin: '24px 0 16px' }}>
                Publicación Web & Descripción
            </h3>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                    <label className="form-label">Título Comercial</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.commercial_title}
                        onChange={(e) => updateField('commercial_title', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Descripción</label>
                    <textarea
                        className="form-textarea"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.published}
                            onChange={(e) => updateField('published', e.target.checked)}
                        />
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#000000' }}>
                            Publicado en Catálogo Web
                        </span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => updateField('featured', e.target.checked)}
                        />
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#D97706' }}>
                            Destacado en Portada
                        </span>
                    </label>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32, paddingTop: 20, borderTop: '1px solid #E2E8F0' }}>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn-secondary"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                >
                    <Save size={16} />
                    <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
            </div>
        </form>
    );
}
