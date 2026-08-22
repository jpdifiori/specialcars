'use client';

import { useState } from 'react';
import { 
    POPULAR_CAR_BRANDS, 
    CAR_MODELS_BY_BRAND, 
    CAR_YEAR_OPTIONS, 
    TRANSMISSION_LOV, 
    BODY_TYPE_LOV 
} from '@/lib/constants/car-brands';
import { submitPublicVehicleSearch } from '@/lib/actions/wanted-vehicles';
import { 
    SearchCheck, 
    Car, 
    User, 
    Phone, 
    Mail, 
    Calendar, 
    ArrowLeftRight, 
    Sparkles, 
    CheckCircle2, 
    AlertCircle, 
    MessageCircle, 
    ShieldCheck, 
    Send,
    DollarSign,
    RefreshCw
} from 'lucide-react';

export function VehicleFinderSection({ whatsappNumber = '5492262574254' }: { whatsappNumber?: string }) {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        brand: '',
        customBrand: '',
        model: '',
        customModel: '',
        year_min: '',
        year_max: '',
        body_type: '',
        transmission: '',
        has_trade_in: false,
        trade_in_details: '',
        max_budget: '',
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<{ code: string; brand: string; model: string } | null>(null);

    const activeBrand = formData.brand === 'Otro' ? formData.customBrand : formData.brand;
    const availableModels = formData.brand && CAR_MODELS_BY_BRAND[formData.brand] ? CAR_MODELS_BY_BRAND[formData.brand] : [];
    const activeModel = formData.model === 'Otro' ? formData.customModel : formData.model;

    const handleBrandChange = (val: string) => {
        setFormData(prev => ({
            ...prev,
            brand: val,
            customBrand: val === 'Otro' ? prev.customBrand : '',
            model: '',
            customModel: ''
        }));
    };

    const handleModelChange = (val: string) => {
        setFormData(prev => ({
            ...prev,
            model: val,
            customModel: val === 'Otro' ? prev.customModel : ''
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const finalBrand = formData.brand === 'Otro' ? formData.customBrand.trim() : formData.brand.trim();
        const finalModel = formData.model === 'Otro' ? formData.customModel.trim() : formData.model.trim();

        if (!formData.first_name.trim()) {
            setError('Por favor ingresá tu nombre y apellido.');
            return;
        }

        if (!formData.phone.trim()) {
            setError('Por favor ingresá tu número de teléfono / WhatsApp para poder contactarte.');
            return;
        }

        if (!finalBrand) {
            setError('Por favor seleccioná o indicá la marca del vehículo que buscás.');
            return;
        }

        if (!finalModel) {
            setError('Por favor indicá el modelo que estás buscando.');
            return;
        }

        setIsSubmitting(true);

        try {
            const cleanBudget = formData.max_budget.replace(/[^0-9]/g, '');

            const res = await submitPublicVehicleSearch({
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                email: formData.email,
                brand: finalBrand,
                model: finalModel,
                year_min: formData.year_min ? Number(formData.year_min) : null,
                year_max: formData.year_max ? Number(formData.year_max) : null,
                body_type: formData.body_type || null,
                transmission: formData.transmission || null,
                has_trade_in: formData.has_trade_in,
                trade_in_details: formData.has_trade_in ? formData.trade_in_details : null,
                max_budget: cleanBudget ? Number(cleanBudget) : null,
                notes: formData.notes
            });

            if (res.success && res.code) {
                setSuccessData({
                    code: res.code,
                    brand: finalBrand,
                    model: finalModel
                });
            } else {
                setError(res.error || 'Ocurrió un error al procesar tu solicitud.');
            }
        } catch (err: any) {
            console.error('Error enviando búsqueda:', err);
            setError('Hubo un problema de conexión al enviar el formulario. Intentá nuevamente o contactanos por WhatsApp.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({
            first_name: '',
            last_name: '',
            phone: '',
            email: '',
            brand: '',
            customBrand: '',
            model: '',
            customModel: '',
            year_min: '',
            year_max: '',
            body_type: '',
            transmission: '',
            has_trade_in: false,
            trade_in_details: '',
            max_budget: '',
            notes: ''
        });
        setSuccessData(null);
        setError(null);
    };

    return (
        <section id="buscar-auto" className="finder-section public-section" style={{ backgroundColor: '#0B0F19', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
            {/* Decoración de Fondo / Glow Premium */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 900,
                height: 500,
                background: 'radial-gradient(circle, rgba(234, 88, 12, 0.12) 0%, rgba(15, 23, 42, 0) 70%)',
                pointerEvents: 'none'
            }} />

            <div className="finder-container" style={{ maxWidth: 1040, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header de Sección */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: 'rgba(234, 88, 12, 0.15)',
                        border: '1px solid rgba(234, 88, 12, 0.3)',
                        color: '#FB923C',
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 12.5,
                        fontWeight: 800,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                        marginBottom: 14
                    }}>
                        <Sparkles size={14} />
                        <span>Servicio Personalizado de Búsqueda</span>
                    </div>

                    <h2 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'clamp(28px, 4vw, 40px)',
                        fontWeight: 900,
                        color: '#FFFFFF',
                        lineHeight: 1.15,
                        marginBottom: 12
                    }}>
                        ¿No encontrás el auto que buscás?
                    </h2>

                    <p style={{
                        fontSize: 15,
                        color: '#94A3B8',
                        maxWidth: 680,
                        margin: '0 auto',
                        lineHeight: 1.6
                    }}>
                        Completá qué vehículo necesitás y nuestro equipo lo busca en nuestra red exclusiva. Te avisamos ni bien ingrese una unidad verificada que coincida con tus criterios.
                    </p>
                </div>

                {/* CONTENIDO PRINCIPAL: FORMULARIO O ESTADO DE ÉXITO */}
                {successData ? (
                    /* Tarjeta de Confirmación de Éxito */
                    <div style={{
                        backgroundColor: '#1E293B',
                        border: '1px solid #334155',
                        borderRadius: 20,
                        padding: '48px 32px',
                        textAlign: 'center',
                        maxWidth: 620,
                        margin: '0 auto',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
                    }}>
                        <div style={{
                            width: 72,
                            height: 72,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(34, 197, 94, 0.15)',
                            border: '2px solid #22C55E',
                            color: '#22C55E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <CheckCircle2 size={38} />
                        </div>

                        <span style={{
                            backgroundColor: '#EA580C',
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 900,
                            padding: '3px 10px',
                            borderRadius: 6,
                            fontFamily: 'var(--font-mono)'
                        }}>
                            SOLICITUD {successData.code}
                        </span>

                        <h3 style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF', marginTop: 14, marginBottom: 10 }}>
                            ¡Recibimos tu pedido de búsqueda!
                        </h3>

                        <p style={{ fontSize: 14.5, color: '#CBD5E1', lineHeight: 1.6, marginBottom: 24 }}>
                            Registramos tu interés por un <strong>{successData.brand} {successData.model}</strong>. Nuestro sistema ya activó el rastreo de inventario y un asesor comercial de <strong>Special Cars</strong> te contactará en cuanto tengamos novedades.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                            <a
                                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola! Acabo de registrar la solicitud de búsqueda ${successData.code} en su web para un ${successData.brand} ${successData.model}. Quería confirmar la recepción.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    backgroundColor: '#25D366',
                                    color: '#FFFFFF',
                                    padding: '12px 24px',
                                    borderRadius: 12,
                                    fontWeight: 800,
                                    fontSize: 14.5,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    textDecoration: 'none',
                                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                                    width: '100%',
                                    maxWidth: 360,
                                    justifyContent: 'center'
                                }}
                            >
                                <MessageCircle size={18} />
                                <span>Avisar por WhatsApp Ahora</span>
                            </a>

                            <button
                                type="button"
                                onClick={handleReset}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94A3B8',
                                    fontSize: 13,
                                    cursor: 'pointer',
                                    padding: '8px 16px',
                                    textDecoration: 'underline'
                                }}
                            >
                                Enviar otra solicitud de búsqueda
                            </button>
                        </div>
                    </div>
                ) : (
                    /* FORMULARIO PREMIUM */
                    <form 
                        onSubmit={handleSubmit}
                        className="finder-form"
                        style={{
                            backgroundColor: '#131B2E',
                            border: '1px solid #1E293B',
                            borderRadius: 24,
                            padding: '36px 32px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                        }}
                    >
                        {error && (
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid #EF4444',
                                borderRadius: 10,
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                color: '#FCA5A5',
                                fontSize: 13.5,
                                marginBottom: 24
                            }}>
                                <AlertCircle size={18} style={{ color: '#EF4444', flexShrink: 0 }} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="finder-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
                            {/* COLUMNA 1: DATOS DEL VEHÍCULO BUSCADO */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                                    <div style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        backgroundColor: '#EA580C',
                                        color: '#FFFFFF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Car size={18} />
                                    </div>
                                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                                        1. ¿Qué vehículo buscás?
                                    </h3>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {/* Marca */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                                            Marca <span style={{ color: '#EA580C' }}>*</span>
                                        </label>
                                        <select
                                            value={formData.brand}
                                            onChange={(e) => handleBrandChange(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '11px 14px',
                                                backgroundColor: '#1E293B',
                                                border: '1px solid #334155',
                                                borderRadius: 10,
                                                color: '#FFFFFF',
                                                fontSize: 14,
                                                outline: 'none',
                                                fontWeight: 600
                                            }}
                                        >
                                            <option value="">Seleccioná una marca...</option>
                                            {POPULAR_CAR_BRANDS.map(b => (
                                                <option key={b} value={b}>{b}</option>
                                            ))}
                                        </select>

                                        {formData.brand === 'Otro' && (
                                            <input
                                                type="text"
                                                placeholder="Ingresá la marca deseada..."
                                                value={formData.customBrand}
                                                onChange={(e) => setFormData(prev => ({ ...prev, customBrand: e.target.value }))}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 14px',
                                                    backgroundColor: '#1E293B',
                                                    border: '1px solid #EA580C',
                                                    borderRadius: 10,
                                                    color: '#FFFFFF',
                                                    fontSize: 13.5,
                                                    outline: 'none',
                                                    marginTop: 8
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Modelo */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                                            Modelo <span style={{ color: '#EA580C' }}>*</span>
                                        </label>
                                        {availableModels.length > 0 ? (
                                            <div>
                                                <select
                                                    value={formData.model}
                                                    onChange={(e) => handleModelChange(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '11px 14px',
                                                        backgroundColor: '#1E293B',
                                                        border: '1px solid #334155',
                                                        borderRadius: 10,
                                                        color: '#FFFFFF',
                                                        fontSize: 14,
                                                        outline: 'none',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    <option value="">Seleccioná el modelo...</option>
                                                    {availableModels.map(m => (
                                                        <option key={m} value={m}>{m}</option>
                                                    ))}
                                                    <option value="Otro">Otro modelo...</option>
                                                </select>

                                                {formData.model === 'Otro' && (
                                                    <input
                                                        type="text"
                                                        placeholder="Escribí el modelo exacto..."
                                                        value={formData.customModel}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, customModel: e.target.value }))}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 14px',
                                                            backgroundColor: '#1E293B',
                                                            border: '1px solid #EA580C',
                                                            borderRadius: 10,
                                                            color: '#FFFFFF',
                                                            fontSize: 13.5,
                                                            outline: 'none',
                                                            marginTop: 8
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder={formData.brand ? "Ej: Corolla Cross, Amarok, 208..." : "Primero seleccioná una marca"}
                                                value={formData.customModel}
                                                disabled={!formData.brand}
                                                onChange={(e) => setFormData(prev => ({ ...prev, customModel: e.target.value }))}
                                                style={{
                                                    width: '100%',
                                                    padding: '11px 14px',
                                                    backgroundColor: formData.brand ? '#1E293B' : '#0F172A',
                                                    border: '1px solid #334155',
                                                    borderRadius: 10,
                                                    color: '#FFFFFF',
                                                    fontSize: 14,
                                                    outline: 'none'
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Rango de Años */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                                                Año Desde
                                            </label>
                                            <select
                                                value={formData.year_min}
                                                onChange={(e) => setFormData(prev => ({ ...prev, year_min: e.target.value }))}
                                                style={{
                                                    width: '100%',
                                                    padding: '11px 14px',
                                                    backgroundColor: '#1E293B',
                                                    border: '1px solid #334155',
                                                    borderRadius: 10,
                                                    color: '#FFFFFF',
                                                    fontSize: 13.5,
                                                    outline: 'none'
                                                }}
                                            >
                                                <option value="">Cualquiera</option>
                                                {CAR_YEAR_OPTIONS.map(y => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                                                Año Hasta
                                            </label>
                                            <select
                                                value={formData.year_max}
                                                onChange={(e) => setFormData(prev => ({ ...prev, year_max: e.target.value }))}
                                                style={{
                                                    width: '100%',
                                                    padding: '11px 14px',
                                                    backgroundColor: '#1E293B',
                                                    border: '1px solid #334155',
                                                    borderRadius: 10,
                                                    color: '#FFFFFF',
                                                    fontSize: 13.5,
                                                    outline: 'none'
                                                }}
                                            >
                                                <option value="">Cualquiera</option>
                                                {CAR_YEAR_OPTIONS.map(y => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Carrocería y Transmisión (Solo Desktop) */}
                                    <div className="desktop-only-block" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                                                Carrocería
                                            </label>
                                            <select
                                                value={formData.body_type}
                                                onChange={(e) => setFormData(prev => ({ ...prev, body_type: e.target.value }))}
                                                style={{
                                                    width: '100%',
                                                    padding: '11px 14px',
                                                    backgroundColor: '#1E293B',
                                                    border: '1px solid #334155',
                                                    borderRadius: 10,
                                                    color: '#FFFFFF',
                                                    fontSize: 13,
                                                    outline: 'none'
                                                }}
                                            >
                                                {BODY_TYPE_LOV.map(bt => (
                                                    <option key={bt.value} value={bt.value}>{bt.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                                                Caja / Transmisión
                                            </label>
                                            <select
                                                value={formData.transmission}
                                                onChange={(e) => setFormData(prev => ({ ...prev, transmission: e.target.value }))}
                                                style={{
                                                    width: '100%',
                                                    padding: '11px 14px',
                                                    backgroundColor: '#1E293B',
                                                    border: '1px solid #334155',
                                                    borderRadius: 10,
                                                    color: '#FFFFFF',
                                                    fontSize: 13,
                                                    outline: 'none'
                                                }}
                                            >
                                                {TRANSMISSION_LOV.map(tr => (
                                                    <option key={tr.value} value={tr.value}>{tr.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA 2: TUS DATOS + CONDICIONES COMERCIALES */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                                    <div style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        backgroundColor: '#EA580C',
                                        color: '#FFFFFF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <User size={18} />
                                    </div>
                                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                                        2. Tus Datos de Contacto
                                    </h3>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {/* Nombre y Apellido */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                                                Nombre <span style={{ color: '#EA580C' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ej: Carlos"
                                                value={formData.first_name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                                                style={{
                                                    width: '100%',
                                                    padding: '11px 14px',
                                                    backgroundColor: '#1E293B',
                                                    border: '1px solid #334155',
                                                    borderRadius: 10,
                                                    color: '#FFFFFF',
                                                    fontSize: 14,
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                                                Apellido
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ej: Rossi"
                                                value={formData.last_name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                                                style={{
                                                    width: '100%',
                                                    padding: '11px 14px',
                                                    backgroundColor: '#1E293B',
                                                    border: '1px solid #334155',
                                                    borderRadius: 10,
                                                    color: '#FFFFFF',
                                                    fontSize: 14,
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* WhatsApp / Teléfono */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                                            WhatsApp / Celular <span style={{ color: '#EA580C' }}>*</span>
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input
                                                type="tel"
                                                placeholder="Ej: 2262 554433"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                style={{
                                                    width: '100%',
                                                    padding: '11px 14px 11px 40px',
                                                    backgroundColor: '#1E293B',
                                                    border: '1px solid #334155',
                                                    borderRadius: 10,
                                                    color: '#FFFFFF',
                                                    fontSize: 14,
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Email (Solo Desktop) */}
                                    <div className="desktop-only-block">
                                        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                                            Email (Opcional)
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input
                                                type="email"
                                                placeholder="tuemail@ejemplo.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                style={{
                                                    width: '100%',
                                                    padding: '11px 14px 11px 40px',
                                                    backgroundColor: '#1E293B',
                                                    border: '1px solid #334155',
                                                    borderRadius: 10,
                                                    color: '#FFFFFF',
                                                    fontSize: 14,
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Presupuesto Estimado (Solo Desktop) */}
                                    <div className="desktop-only-block">
                                        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                                            Presupuesto Estimado ($ ARS)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: $ 25.000.000 (o dejar vacío)"
                                            value={formData.max_budget}
                                            onChange={(e) => setFormData(prev => ({ ...prev, max_budget: e.target.value }))}
                                            style={{
                                                width: '100%',
                                                padding: '11px 14px',
                                                backgroundColor: '#1E293B',
                                                border: '1px solid #334155',
                                                borderRadius: 10,
                                                color: '#FFFFFF',
                                                fontSize: 14,
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN INFERIOR: PERMUTA Y OBSERVACIONES */}
                        <div style={{ borderTop: '1px solid #1E293B', marginTop: 28, paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Permuta / Usado en Parte de Pago */}
                            <div style={{
                                backgroundColor: formData.has_trade_in ? 'rgba(234, 88, 12, 0.08)' : '#1A2333',
                                border: `1px solid ${formData.has_trade_in ? '#EA580C' : '#2D3748'}`,
                                borderRadius: 14,
                                padding: '16px 20px',
                                transition: 'all 0.2s'
                            }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.has_trade_in}
                                        onChange={(e) => setFormData(prev => ({ ...prev, has_trade_in: e.target.checked }))}
                                        style={{ width: 18, height: 18, accentColor: '#EA580C', cursor: 'pointer' }}
                                    />
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <ArrowLeftRight size={16} style={{ color: '#EA580C' }} />
                                            <span>¿Tenés un vehículo usado para entregar en parte de pago (Permuta)?</span>
                                        </div>
                                        <div style={{ fontSize: 12.5, color: '#94A3B8', marginTop: 2 }}>
                                            Tomamos tu vehículo al mejor valor de plaza para achicar la diferencia.
                                        </div>
                                    </div>
                                </label>

                                {formData.has_trade_in && (
                                    <div style={{ marginTop: 14 }}>
                                        <input
                                            type="text"
                                            placeholder="Detallá tu usado: Marca, Modelo, Versión, Año y Kilómetros aprox..."
                                            value={formData.trade_in_details}
                                            onChange={(e) => setFormData(prev => ({ ...prev, trade_in_details: e.target.value }))}
                                            style={{
                                                width: '100%',
                                                padding: '11px 14px',
                                                backgroundColor: '#1E293B',
                                                border: '1px solid #EA580C',
                                                borderRadius: 10,
                                                color: '#FFFFFF',
                                                fontSize: 13.5,
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Observaciones (Solo Desktop) */}
                            <div className="desktop-only-block">
                                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                                    Observaciones / Detalles específicos (Opcional)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Ej: Preferencia de color blanco o negro, techo solar, menos de 50.000 km, etc..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '11px 14px',
                                        backgroundColor: '#1E293B',
                                        border: '1px solid #334155',
                                        borderRadius: 10,
                                        color: '#FFFFFF',
                                        fontSize: 13.5,
                                        outline: 'none',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            {/* Botón de Envío */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="finder-submit-btn"
                                    style={{
                                        backgroundColor: '#EA580C',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        padding: '16px 36px',
                                        borderRadius: 14,
                                        fontWeight: 900,
                                        fontSize: 16,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        opacity: isSubmitting ? 0.7 : 1,
                                        boxShadow: '0 8px 24px rgba(234, 88, 12, 0.4)',
                                        transition: 'all 0.2s',
                                        letterSpacing: 0.3
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RefreshCw size={20} className="animate-spin" />
                                            <span>Enviando tu pedido...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            <span>Enviar Solicitud de Búsqueda</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
}
