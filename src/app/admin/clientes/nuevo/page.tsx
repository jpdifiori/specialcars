'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientRecord, checkDuplicateClient } from '@/lib/actions/clients';
import { ArrowLeft, Save, AlertTriangle, CheckCircle2, User } from 'lucide-react';

export default function NewClientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [duplicateWarning, setDuplicateWarning] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        dni: '',
        cuit_cuil: '',
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        notes: ''
    });

    const updateField = async (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Comprobación de duplicados al perder foco o cambiar campos críticos
        if (field === 'dni' || field === 'cuit_cuil' || field === 'phone' || field === 'email') {
            if (value.trim().length >= 6) {
                const checkRes = await checkDuplicateClient({
                    [field]: value
                });
                if (checkRes.hasDuplicate) {
                    setDuplicateWarning(checkRes.matches);
                } else {
                    setDuplicateWarning([]);
                }
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.first_name.trim() || !formData.last_name.trim()) {
            setError('Nombre y Apellido son campos obligatorios.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await createClientRecord(formData);
            if (!res.success) {
                setError(res.error || 'Error creando cliente.');
                setLoading(false);
                return;
            }

            if (res.client) {
                router.push(`/admin/clientes/${res.client.id}`);
            }
        } catch (err: any) {
            setError(err.message || 'Error inesperado.');
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ marginBottom: 20 }}>
                <Link href="/admin/clientes" style={{ fontSize: 13, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <ArrowLeft size={14} />
                    <span>Volver a Clientes</span>
                </Link>
                <h1 className="admin-page-title">Nuevo Cliente</h1>
                <p className="admin-page-desc">Registrá un cliente para asociarlo a ventas, permutas, consignaciones o compras.</p>
            </div>

            {duplicateWarning.length > 0 && (
                <div className="alert-banner warning" style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <div style={{ fontWeight: 700, marginBottom: 4 }}>Posible cliente duplicado detectado:</div>
                            {duplicateWarning.map((m, idx) => (
                                <div key={idx} style={{ fontSize: 13 }}>
                                    Ya existe un cliente con el mismo <strong>{m.field}</strong>: {m.client.first_name} {m.client.last_name} ({m.client.phone || m.client.email || m.client.dni}).
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="alert-banner danger" style={{ marginBottom: 20 }}>
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="table-container" style={{ padding: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 20 }}>
                    Datos Personales
                </h3>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Nombre *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Juan"
                            value={formData.first_name}
                            onChange={(e) => updateField('first_name', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Apellido *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Pérez"
                            value={formData.last_name}
                            onChange={(e) => updateField('last_name', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">DNI</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: 35123456"
                            value={formData.dni}
                            onChange={(e) => updateField('dni', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">CUIT / CUIL</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: 20-35123456-9"
                            value={formData.cuit_cuil}
                            onChange={(e) => updateField('cuit_cuil', e.target.value)}
                        />
                    </div>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', margin: '24px 0 20px' }}>
                    Contacto & Ubicación
                </h3>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Teléfono</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: 11 4098-0758"
                            value={formData.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">WhatsApp</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: 5491140980758"
                            value={formData.whatsapp}
                            onChange={(e) => updateField('whatsapp', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Ej: cliente@gmail.com"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Dirección</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Av. Corrientes 1234"
                            value={formData.address}
                            onChange={(e) => updateField('address', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Ciudad</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: CABA, San Isidro, Córdoba"
                            value={formData.city}
                            onChange={(e) => updateField('city', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Provincia</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Buenos Aires"
                            value={formData.province}
                            onChange={(e) => updateField('province', e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: 18 }}>
                    <label className="form-label">Notas Internas</label>
                    <textarea
                        className="form-textarea"
                        rows={3}
                        placeholder="Intereses del cliente, preferencias de vehículos, observaciones de contacto..."
                        value={formData.notes}
                        onChange={(e) => updateField('notes', e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
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
                        <span>{loading ? 'Guardando...' : 'Crear Cliente'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
