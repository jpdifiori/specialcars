'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vehicle } from '@/lib/types';
import { updateVehicle } from '@/lib/actions/vehicles';
import { formatARS } from '@/lib/utils/currency';
import { Save, AlertCircle, Flame } from 'lucide-react';

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
        hide_price: vehicle.hide_price !== undefined ? vehicle.hide_price : true,
        commercial_title: vehicle.commercial_title || '',
        description: vehicle.description || '',
        equipment: vehicle.equipment || '',
        features: vehicle.features || '',
        is_offer: vehicle.is_offer || false,
        offer_price: vehicle.offer_price || 0,
        offer_start_date: vehicle.offer_start_date ? vehicle.offer_start_date.split('T')[0] : '',
        offer_end_date: vehicle.offer_end_date ? vehicle.offer_end_date.split('T')[0] : '',
        offer_label: vehicle.offer_label || 'OFERTA'
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.is_offer) {
            if (!formData.offer_price || formData.offer_price <= 0) {
                setError('Debes ingresar un precio de oferta válido mayor a $ 0.');
                return;
            }
            if (formData.offer_price >= formData.sale_price) {
                setError(`El precio de oferta ($ ${formData.offer_price.toLocaleString('es-AR')}) debe ser obligatoriamente menor al precio normal ($ ${formData.sale_price.toLocaleString('es-AR')}).`);
                return;
            }
        }

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
                        placeholder="Ej: AF123CD o N/A para 0 KM"
                        style={{ textTransform: 'uppercase' }}
                        value={formData.plate}
                        onChange={(e) => updateField('plate', e.target.value.toUpperCase())}
                    />
                    <span className="form-help">Para 0 KM podés ingresar N/A o dejarlo vacío.</span>
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

            {/* SECCIÓN DE OFERTA */}
            <div style={{
                marginTop: 24,
                padding: '22px 24px',
                backgroundColor: formData.is_offer ? '#FFF7ED' : '#F8FAFC',
                borderRadius: 12,
                border: formData.is_offer ? '2px solid #EA580C' : '1px solid #E2E8F0',
                transition: 'all 0.2s ease-in-out'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            backgroundColor: formData.is_offer ? '#EA580C' : '#E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: formData.is_offer ? '#FFFFFF' : '#64748B'
                        }}>
                            <Flame size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                                Oferta Especial de Vehículo
                            </h3>
                            <p style={{ fontSize: 12.5, color: '#64748B', margin: '2px 0 0' }}>
                                Configurá un precio promocional con cálculo automático de ahorro y vigencia.
                            </p>
                        </div>
                    </div>

                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', backgroundColor: '#FFFFFF', padding: '8px 16px', borderRadius: 8, border: '1px solid #CBD5E1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <input
                            type="checkbox"
                            checked={formData.is_offer}
                            onChange={(e) => updateField('is_offer', e.target.checked)}
                            style={{ width: 18, height: 18, accentColor: '#EA580C', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: formData.is_offer ? '#EA580C' : '#334155' }}>
                            Activar Oferta
                        </span>
                    </label>
                </div>

                {formData.is_offer && (
                    <div style={{ borderTop: '1px solid #FFEDD5', paddingTop: 18, marginTop: 10 }}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Precio Actual Normal ($ ARS)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formatARS(formData.sale_price)}
                                    disabled
                                    style={{ backgroundColor: '#F1F5F9', color: '#64748B', fontWeight: 700 }}
                                />
                                <span className="form-help">Precio de lista base.</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ color: '#EA580C', fontWeight: 800 }}>Precio de Oferta ($ ARS) *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Ej: 24000000"
                                    value={formData.offer_price || ''}
                                    onChange={(e) => updateField('offer_price', parseInt(e.target.value, 10) || 0)}
                                    style={{ borderColor: formData.offer_price && formData.offer_price < formData.sale_price ? '#EA580C' : '#EF4444', fontWeight: 700 }}
                                    required={formData.is_offer}
                                />
                                <span className="form-help" style={{ color: '#EA580C', fontWeight: 600 }}>
                                    {formatARS(formData.offer_price)}
                                </span>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Texto / Etiqueta de Oferta</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: OFERTA, PRECIO ESPECIAL, LIQUIDACIÓN..."
                                    value={formData.offer_label}
                                    onChange={(e) => updateField('offer_label', e.target.value)}
                                />
                                <span className="form-help">Por defecto: &quot;OFERTA&quot;</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Fecha de Inicio (Opcional)</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.offer_start_date}
                                    onChange={(e) => updateField('offer_start_date', e.target.value)}
                                />
                                <span className="form-help">Desde cuándo rige la oferta.</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Fecha de Finalización (Opcional)</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.offer_end_date}
                                    onChange={(e) => updateField('offer_end_date', e.target.value)}
                                />
                                <span className="form-help">Vencimiento automático de la promoción.</span>
                            </div>
                        </div>

                        {/* Panel de Cálculo de Ahorro y Descuento */}
                        {formData.sale_price > 0 && formData.offer_price > 0 && (
                            <div style={{
                                marginTop: 16,
                                padding: 16,
                                borderRadius: 10,
                                backgroundColor: formData.offer_price < formData.sale_price ? '#ECFDF5' : '#FEF2F2',
                                border: `1px solid ${formData.offer_price < formData.sale_price ? '#A7F3D0' : '#FECACA'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 16
                            }}>
                                {formData.offer_price < formData.sale_price ? (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                backgroundColor: '#059669',
                                                color: '#FFFFFF',
                                                fontWeight: 900,
                                                fontSize: 16,
                                                padding: '6px 12px',
                                                borderRadius: 8
                                            }}>
                                                -{Math.round(((formData.sale_price - formData.offer_price) / formData.sale_price) * 100)}% OFF
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 12, color: '#065F46', fontWeight: 700, textTransform: 'uppercase' }}>
                                                    Importe Total de Ahorro
                                                </div>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 800, color: '#065F46' }}>
                                                    {formatARS(formData.sale_price - formData.offer_price)}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 13, color: '#065F46', fontWeight: 600 }}>
                                            ✅ Descuento activo para el público
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#DC2626', fontSize: 13.5, fontWeight: 700 }}>
                                        <AlertCircle size={18} />
                                        <span>El precio de oferta debe ser obligatoriamente menor al precio normal ({formatARS(formData.sale_price)}).</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
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

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', backgroundColor: '#F8FAFC', padding: '12px 16px', borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 12 }}>
                    <input
                        type="checkbox"
                        checked={formData.hide_price}
                        onChange={(e) => updateField('hide_price', e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: '#EA580C', cursor: 'pointer' }}
                    />
                    <div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>
                            Ocultar precio en la web pública (Mostrar &quot;Consultar precio!&quot;)
                        </span>
                        <div style={{ fontSize: 12, color: '#64748B' }}>
                            Al estar activado, en la web pública se mostrará &quot;Consultar precio!&quot; en lugar del valor numérico.
                        </div>
                    </div>
                </label>

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
