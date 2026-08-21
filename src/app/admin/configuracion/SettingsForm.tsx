'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AgencySettings } from '@/lib/types';
import { updateAgencySettings } from '@/lib/actions/settings';
import { Save, CheckCircle2, AlertCircle, Phone, MessageSquare, Mail, MapPin } from 'lucide-react';

export function SettingsForm({ initialSettings }: { initialSettings: AgencySettings }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: initialSettings.name || 'Special Cars',
        description: initialSettings.description || '',
        address: initialSettings.address || '',
        city: initialSettings.city || '',
        province: initialSettings.province || '',
        phone: initialSettings.phone || '',
        whatsapp: initialSettings.whatsapp || '5491140980758',
        email: initialSettings.email || '',
        instagram: initialSettings.instagram || '',
        facebook: initialSettings.facebook || '',
        tiktok: initialSettings.tiktok || '',
        google_maps_url: initialSettings.google_maps_url || '',
        business_hours: initialSettings.business_hours || '',
        legal_info: initialSettings.legal_info || ''
    });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSaved(false);

        try {
            const res = await updateAgencySettings(formData);
            if (!res.success) {
                setError(res.error || 'Error al guardar la configuración');
                setLoading(false);
                return;
            }

            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="table-container" style={{ padding: 32 }}>
            {saved && (
                <div className="alert-banner info" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', marginBottom: 20 }}>
                    <CheckCircle2 size={18} />
                    <span>Configuración actualizada correctamente. Los cambios ya son visibles en la web pública.</span>
                </div>
            )}

            {error && (
                <div className="alert-banner danger" style={{ marginBottom: 20 }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#000000', marginBottom: 20 }}>
                Datos Principales & Branding
            </h3>

            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Nombre de la Agencia *</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Email de Contacto Oficial</label>
                    <input
                        type="email"
                        className="form-input"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Teléfono de Línea / Agencia</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" style={{ color: '#25d366' }}>
                        Número de WhatsApp (con código de país sin +) *
                    </label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Ej: 5491140980758"
                        value={formData.whatsapp}
                        onChange={(e) => updateField('whatsapp', e.target.value)}
                        required
                    />
                    <span className="form-help">Se usa para generar los links directos de consulta comercial.</span>
                </div>
            </div>

            <div className="form-group" style={{ margin: '18px 0' }}>
                <label className="form-label">Descripción / Propuesta de Valor</label>
                <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                />
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#000000', margin: '28px 0 20px' }}>
                Ubicación & Horarios de Atención
            </h3>

            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Dirección (Calle y Número)</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.address}
                        onChange={(e) => updateField('address', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Ciudad / Barrio</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Provincia</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.province}
                        onChange={(e) => updateField('province', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Horarios Comerciales</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Lunes a Viernes de 9 a 19 hs. Sábados de 10 a 14 hs."
                        value={formData.business_hours}
                        onChange={(e) => updateField('business_hours', e.target.value)}
                    />
                </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#000000', margin: '28px 0 20px' }}>
                Redes Sociales & Legal
            </h3>

            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Instagram URL</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="https://instagram.com/specialcars"
                        value={formData.instagram}
                        onChange={(e) => updateField('instagram', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Facebook URL</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="https://facebook.com/specialcars"
                        value={formData.facebook}
                        onChange={(e) => updateField('facebook', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">TikTok URL</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="https://tiktok.com/@specialcars"
                        value={formData.tiktok}
                        onChange={(e) => updateField('tiktok', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Razón Social & CUIT Legal</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Special Cars S.R.L. — CUIT 30-71234567-8"
                        value={formData.legal_info}
                        onChange={(e) => updateField('legal_info', e.target.value)}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button type="submit" disabled={loading} className="btn-primary">
                    <Save size={16} />
                    <span>{loading ? 'Guardando...' : 'Guardar Configuración'}</span>
                </button>
            </div>
        </form>
    );
}
