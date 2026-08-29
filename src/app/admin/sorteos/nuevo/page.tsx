'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createGiveawayAction, uploadGiveawayImageAction } from '@/lib/actions/giveaways';
import { GiveawayStatus } from '@/lib/types';
import { 
    ArrowLeft, 
    Gift, 
    Plus, 
    Trash2, 
    Upload, 
    Save, 
    Calendar, 
    Image as ImageIcon,
    Sparkles,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

interface PrizeFormItem {
    position: number;
    title: string;
    description: string;
    image_url?: string;
    isUploading?: boolean;
}

export default function NewGiveawayPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [terms, setTerms] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split('T')[0];
    });
    const [status, setStatus] = useState<GiveawayStatus>('active');
    const [bannerUrl, setBannerUrl] = useState('');
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);

    // Lista inicial de premios (por defecto 1er, 2do y 3er premio)
    const [prizes, setPrizes] = useState<PrizeFormItem[]>([
        { position: 1, title: '1° Premio - Kit de Limpieza y Estética Vehicular', description: 'Set completo de productos de detailing premium' },
        { position: 2, title: '2° Premio - Voucher de Combustible', description: 'Voucher canjeable en estaciones de servicio' },
        { position: 3, title: '3° Premio - Kit de Seguridad y Emergencia', description: 'Matafuego, balizas reglamentarias y botiquín' }
    ]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleAddPrize = () => {
        const nextPosition = prizes.length + 1;
        setPrizes([
            ...prizes,
            { position: nextPosition, title: `${nextPosition}° Premio`, description: '' }
        ]);
    };

    const handleRemovePrize = (index: number) => {
        if (prizes.length === 1) {
            alert('Debe haber al menos 1 premio configurado.');
            return;
        }
        const updated = prizes.filter((_, idx) => idx !== index).map((p, idx) => ({
            ...p,
            position: idx + 1
        }));
        setPrizes(updated);
    };

    const handlePrizeChange = (index: number, field: keyof PrizeFormItem, value: any) => {
        const updated = [...prizes];
        updated[index] = { ...updated[index], [field]: value };
        setPrizes(updated);
    };

    const handlePrizeImageUpload = async (index: number, file: File) => {
        const updated = [...prizes];
        updated[index].isUploading = true;
        setPrizes([...updated]);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('giveaway_id', 'new');

            const res = await uploadGiveawayImageAction(formData);
            if (res.success && res.url) {
                updated[index].image_url = res.url;
            } else {
                alert('Error al subir la imagen: ' + (res.error || 'Desconocido'));
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err || 'Error desconocido');
            alert('Error al procesar la imagen: ' + msg);
        } finally {
            updated[index].isUploading = false;
            setPrizes([...updated]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!title.trim()) {
            setErrorMessage('El título del sorteo es obligatorio.');
            return;
        }

        if (!endDate) {
            setErrorMessage('La fecha de finalización es obligatoria.');
            return;
        }

        const emptyPrizes = prizes.some(p => !p.title.trim());
        if (emptyPrizes) {
            setErrorMessage('Por favor completá el título de todos los premios.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await createGiveawayAction({
                title,
                description,
                terms_and_conditions: terms,
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(`${endDate}T23:59:59`).toISOString(),
                status,
                banner_url: bannerUrl || undefined,
                prizes: prizes.map(p => ({
                    position: p.position,
                    title: p.title,
                    description: p.description,
                    image_url: p.image_url
                }))
            });

            if (res.success && res.data) {
                router.push(`/admin/sorteos/${res.data.id}`);
            } else {
                setErrorMessage(res.error || 'Ocurrió un error al crear el sorteo.');
                setIsSubmitting(false);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err || 'Error inesperado al guardar.');
            setErrorMessage(msg);
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href="/admin/sorteos" className="btn-icon">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="admin-page-title">Crear Nuevo Sorteo</h1>
                        <p className="admin-page-desc">Configurá las fechas, premios e imágenes del sorteo.</p>
                    </div>
                </div>
            </div>

            {errorMessage && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    borderRadius: 10,
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    color: '#B91C1C',
                    marginBottom: 24,
                    fontSize: 14,
                    fontWeight: 600
                }}>
                    <AlertCircle size={18} />
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* SECCIÓN 1: DATOS GENERALES */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0', padding: '24px', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, borderBottom: '1px solid #F1F5F9', paddingBottom: 12 }}>
                        <Gift size={20} style={{ color: '#EA580C' }} />
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                            1. Información General del Sorteo
                        </h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label className="admin-form-label">Título del Sorteo *</label>
                            <input
                                type="text"
                                required
                                placeholder="Ej: Gran Sorteo Especial Primavera 2026"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="admin-input"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                            <div>
                                <label className="admin-form-label">Fecha de Inicio *</label>
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="admin-input"
                                />
                            </div>

                            <div>
                                <label className="admin-form-label">Fecha de Finalización (Cierre) *</label>
                                <input
                                    type="date"
                                    required
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="admin-input"
                                />
                            </div>

                            <div>
                                <label className="admin-form-label">Estado Inicial</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as GiveawayStatus)}
                                    className="admin-select"
                                >
                                    <option value="active">Activo (Visible en web para participar)</option>
                                    <option value="draft">Borrador (Oculto)</option>
                                    <option value="closed">Cerrado / Finalizado</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="admin-form-label">Descripción Comercial</label>
                            <textarea
                                rows={3}
                                placeholder="Detalles de invitación al sorteo para los clientes..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="admin-textarea"
                            />
                        </div>

                        <div>
                            <label className="admin-form-label">Bases y Condiciones (Opcional)</label>
                            <textarea
                                rows={2}
                                placeholder="Requisitos legales, fecha de entrega del premio, etc."
                                value={terms}
                                onChange={(e) => setTerms(e.target.value)}
                                className="admin-textarea"
                            />
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 2: PREMIOS E IMÁGENES */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0', padding: '24px', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid #F1F5F9', paddingBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Sparkles size={20} style={{ color: '#EA580C' }} />
                            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                                2. Premios y Fotos ({prizes.length})
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddPrize}
                            className="btn-sm"
                            style={{ backgroundColor: '#FFF7ED', color: '#EA580C', border: '1px solid #FDBA74', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            <Plus size={14} />
                            <span>Agregar Premio</span>
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {prizes.map((prize, index) => (
                            <div
                                key={index}
                                style={{
                                    border: '1px solid #E2E8F0',
                                    borderRadius: 12,
                                    padding: '18px',
                                    backgroundColor: '#F8FAFC',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                    <span style={{
                                        fontSize: 12,
                                        fontWeight: 900,
                                        backgroundColor: '#EA580C',
                                        color: '#FFFFFF',
                                        padding: '3px 10px',
                                        borderRadius: 20
                                    }}>
                                        {prize.position}° PREMIO (PUESTO {prize.position})
                                    </span>

                                    {prizes.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePrize(index)}
                                            style={{
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                color: '#EF4444',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                fontSize: 12,
                                                fontWeight: 700
                                            }}
                                        >
                                            <Trash2 size={14} />
                                            <span>Eliminar</span>
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                                    {/* Campos de texto */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div>
                                            <label className="admin-form-label">Nombre del Premio *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Ej: Kit de Limpieza + Vouchers"
                                                value={prize.title}
                                                onChange={(e) => handlePrizeChange(index, 'title', e.target.value)}
                                                className="admin-input"
                                            />
                                        </div>

                                        <div>
                                            <label className="admin-form-label">Descripción del Premio</label>
                                            <textarea
                                                rows={2}
                                                placeholder="Detalles de lo que incluye el premio..."
                                                value={prize.description}
                                                onChange={(e) => handlePrizeChange(index, 'description', e.target.value)}
                                                className="admin-textarea"
                                            />
                                        </div>
                                    </div>

                                    {/* Imagen del premio */}
                                    <div>
                                        <label className="admin-form-label">Foto del Premio</label>
                                        <div style={{
                                            border: '2px dashed #CBD5E1',
                                            borderRadius: 12,
                                            padding: '16px',
                                            textAlign: 'center',
                                            backgroundColor: '#FFFFFF',
                                            minHeight: 140,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative'
                                        }}>
                                            {prize.image_url ? (
                                                <div style={{ position: 'relative', width: '100%', height: 120 }}>
                                                    <Image
                                                        src={prize.image_url}
                                                        alt={prize.title}
                                                        fill
                                                        style={{ objectFit: 'contain' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePrizeChange(index, 'image_url', undefined)}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            right: 0,
                                                            backgroundColor: '#EF4444',
                                                            color: '#FFFFFF',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: 24,
                                                            height: 24,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Upload size={24} style={{ color: '#94A3B8', margin: '0 auto 8px' }} />
                                                    <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 8px' }}>
                                                        {prize.isUploading ? 'Subiendo imagen...' : 'Cargar foto del premio'}
                                                    </p>
                                                    <label style={{
                                                        display: 'inline-block',
                                                        padding: '6px 14px',
                                                        backgroundColor: '#F1F5F9',
                                                        color: '#334155',
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        borderRadius: 8,
                                                        cursor: prize.isUploading ? 'not-allowed' : 'pointer'
                                                    }}>
                                                        <span>Examinar</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            disabled={prize.isUploading}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handlePrizeImageUpload(index, file);
                                                            }}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BOTÓN GUARDAR */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <Link href="/admin/sorteos" className="btn-secondary">
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <Save size={16} />
                        <span>{isSubmitting ? 'Guardando Sorteo...' : 'Crear y Publicar Sorteo'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
