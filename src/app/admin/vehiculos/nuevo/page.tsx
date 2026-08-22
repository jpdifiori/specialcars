'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createVehicle } from '@/lib/actions/vehicles';
import { uploadVehicleImageAction } from '@/lib/actions/images';
import { checkQuickDemand } from '@/lib/actions/wanted-vehicles';
import imageCompression from 'browser-image-compression';
import { formatARS } from '@/lib/utils/currency';
import { 
    Car, 
    Wrench, 
    DollarSign, 
    ArrowLeftRight, 
    Image as ImageIcon, 
    Globe, 
    Eye, 
    Save, 
    Check, 
    ArrowRight, 
    ArrowLeft,
    UploadCloud,
    AlertCircle,
    X,
    Star,
    Crop,
    Flame,
    Sparkles
} from 'lucide-react';
import { ImagePositionModal } from '@/components/admin/ImagePositionModal';

const STEPS = [
    { id: 1, label: 'Datos Básicos', icon: Car },
    { id: 2, label: 'Info Técnica', icon: Wrench },
    { id: 3, label: 'Info Comercial', icon: DollarSign },
    { id: 4, label: 'Origen', icon: ArrowLeftRight },
    { id: 5, label: 'Fotografías', icon: ImageIcon },
    { id: 6, label: 'Publicación', icon: Globe },
    { id: 7, label: 'Vista Previa', icon: Eye },
    { id: 8, label: 'Guardar', icon: Save },
];

export default function NewVehiclePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const [adjustingPhoto, setAdjustingPhoto] = useState<{ index: number; url: string; fileName: string } | null>(null);
    const [demandEstimate, setDemandEstimate] = useState<{ level: 'LOW' | 'MEDIUM' | 'HIGH'; count: number; highMatchCount: number }>({ level: 'LOW', count: 0, highMatchCount: 0 });

    // Estado del formulario
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        version: '',
        year: new Date().getFullYear(),
        mileage: 0,
        fuel_type: 'NAFTA',
        transmission: 'MANUAL',
        body_type: 'AUTO',
        doors: 4,
        exterior_color: '',
        interior_color: '',
        plate: '',
        vin: '',
        engine_number: '',
        purchase_price: 0,
        sale_price: 0,
        minimum_price: 0,
        origin_type: 'DIRECT_PURCHASE',
        status: 'AVAILABLE',
        published: true,
        featured: false,
        hide_price: true,
        commercial_title: '',
        description: '',
        equipment: '',
        features: '',
        meta_title: '',
        meta_description: ''
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Consulta de demanda estimada en tiempo real
    useEffect(() => {
        if (formData.brand.trim() && formData.model.trim()) {
            const timer = setTimeout(() => {
                checkQuickDemand(formData.brand, formData.model, formData.body_type).then(setDemandEstimate);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setDemandEstimate({ level: 'LOW', count: 0, highMatchCount: 0 });
        }
    }, [formData.brand, formData.model, formData.body_type]);

    const handleNext = () => {
        setError(null);
        // Validaciones paso 1
        if (currentStep === 1) {
            if (!formData.brand.trim() || !formData.model.trim()) {
                setError('Por favor completá la Marca y el Modelo del vehículo.');
                return;
            }
        }
        // Validaciones paso 3
        if (currentStep === 3) {
            if (formData.sale_price <= 0) {
                setError('El precio de venta debe ser mayor a $ 0.');
                return;
            }
        }

        if (currentStep < 8) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setError(null);
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // Seleccionar archivos
    const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const newFiles = Array.from(files);
        setSelectedFiles(prev => [...prev, ...newFiles]);
        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveAdjustedPhoto = (adjustedFile: File, newPreviewUrl: string) => {
        if (!adjustingPhoto) return;
        const targetIdx = adjustingPhoto.index;
        setSelectedFiles(prev => {
            const next = [...prev];
            next[targetIdx] = adjustedFile;
            return next;
        });
        setPreviews(prev => {
            const next = [...prev];
            next[targetIdx] = newPreviewUrl;
            return next;
        });
        setAdjustingPhoto(null);
    };

    // Subir fotos a Supabase después de crear el vehículo
    const uploadPhotos = async (vehicleId: string) => {
        if (selectedFiles.length === 0) return;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            setUploadStatus(`Subiendo foto ${i + 1} de ${selectedFiles.length}...`);

            try {
                const compressed = await imageCompression(file, {
                    maxSizeMB: 1.2,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                });

                const uploadData = new FormData();
                uploadData.append('vehicle_id', vehicleId);
                uploadData.append('file', compressed, file.name);
                uploadData.append('is_primary', i === 0 ? 'true' : 'false');

                const res = await uploadVehicleImageAction(uploadData);
                if (!res.success) {
                    console.error('Error subiendo foto:', res.error);
                }
            } catch (err) {
                console.error('Error procesando imagen:', err);
            }
        }
        setUploadStatus(null);
    };

    const handleSave = async (shouldPublish: boolean) => {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                published: shouldPublish,
                status: (shouldPublish ? (formData.status || 'AVAILABLE') : 'IN_PREPARATION') as any
            };

            const res = await createVehicle(payload as any);
            if (!res.success) {
                setError(res.error || 'Error al guardar el vehículo.');
                setLoading(false);
                return;
            }

            if (res.vehicle) {
                // Subir fotos seleccionadas
                if (selectedFiles.length > 0) {
                    await uploadPhotos(res.vehicle.id);
                }
                router.push(`/admin/vehiculos/${res.vehicle.id}`);
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado.');
            setLoading(false);
        }
    };

    // Auto-generar título comercial si está vacío
    const autoTitle = `${formData.brand.toUpperCase()} ${formData.model.toUpperCase()} ${formData.version ? formData.version.toUpperCase() : ''} ${formData.year}`.trim();

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* Header */}
            <div className="admin-page-header">
                <div>
                    <Link href="/admin/vehiculos" style={{ fontSize: 13, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <ArrowLeft size={14} />
                        <span>Volver a Vehículos</span>
                    </Link>
                    <h1 className="admin-page-title">Carga de Vehículo (Paso a Paso)</h1>
                    <p className="admin-page-desc">Completá la información del vehículo para incorporarlo al inventario y a la web.</p>
                </div>
            </div>

            {/* Stepper Wizard */}
            <div className="wizard-steps">
                {STEPS.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;
                    return (
                        <div
                            key={step.id}
                            className={`wizard-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                            style={{ cursor: isCompleted ? 'pointer' : 'default' }}
                            onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                        >
                            <div className="wizard-step-num">
                                {isCompleted ? <Check size={14} /> : step.id}
                            </div>
                            <span>{step.label}</span>
                        </div>
                    );
                })}
            </div>

            {error && (
                <div className="alert-banner danger" style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* CONTENIDO DE CADA PASO */}
            <div className="table-container" style={{ padding: 32, marginBottom: 24 }}>
                {/* PASO 1: DATOS BÁSICOS */}
                {currentStep === 1 && (
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#000000', marginBottom: 20 }}>
                            Paso 1: Datos Básicos
                        </h2>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Marca *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: Toyota, Ford, Fiat, Volkswagen"
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
                                    placeholder="Ej: Hilux, Corolla, Toro, Amarok"
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
                                    placeholder="Ej: SRX 4x4, Volcano, Highline"
                                    value={formData.version}
                                    onChange={(e) => updateField('version', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Año de Fabricación *</label>
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
                                    placeholder="0 para 0 KM"
                                    value={formData.mileage}
                                    onChange={(e) => updateField('mileage', parseInt(e.target.value, 10) || 0)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Patente (Dominio)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: AF123CD o N/A para 0 KM"
                                    style={{ textTransform: 'uppercase' }}
                                    value={formData.plate}
                                    onChange={(e) => updateField('plate', e.target.value.toUpperCase())}
                                />
                                <span className="form-help">Para unidades 0 KM podés ingresar N/A o dejarlo vacío.</span>
                            </div>
                        </div>

                        {/* Indicador de Demanda Comercial en Tiempo Real */}
                        {formData.brand.trim() && formData.model.trim() && (
                            <div style={{
                                marginTop: 22,
                                padding: '14px 18px',
                                borderRadius: 12,
                                backgroundColor: demandEstimate.level === 'HIGH' ? '#FFF7ED' : demandEstimate.level === 'MEDIUM' ? '#EFF6FF' : '#F8FAFC',
                                border: demandEstimate.level === 'HIGH' ? '1.5px solid #FDBA74' : demandEstimate.level === 'MEDIUM' ? '1.5px solid #BFDBFE' : '1px solid #E2E8F0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 10
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {demandEstimate.level === 'HIGH' ? (
                                        <Flame size={22} style={{ color: '#EA580C' }} />
                                    ) : demandEstimate.level === 'MEDIUM' ? (
                                        <Sparkles size={20} style={{ color: '#2563EB' }} />
                                    ) : (
                                        <Car size={18} style={{ color: '#64748B' }} />
                                    )}
                                    <div>
                                        <span style={{
                                            fontSize: 14,
                                            fontWeight: 800,
                                            color: demandEstimate.level === 'HIGH' ? '#C2410C' : demandEstimate.level === 'MEDIUM' ? '#1E40AF' : '#475569'
                                        }}>
                                            Demanda Estimada: {demandEstimate.level === 'HIGH' ? 'ALTA 🔥' : demandEstimate.level === 'MEDIUM' ? 'MEDIA ⚡' : 'BAJA ⚪'}
                                        </span>
                                        <span style={{ fontSize: 13, color: '#64748B', marginLeft: 8 }}>
                                            ({demandEstimate.count} {demandEstimate.count === 1 ? 'cliente compatible esperando' : 'clientes compatibles esperando'})
                                        </span>
                                    </div>
                                </div>
                                {demandEstimate.count > 0 && (
                                    <span style={{ fontSize: 12, color: '#EA580C', fontWeight: 700 }}>
                                        ✓ Al guardar la ficha podrás contactar a los interesados por WhatsApp
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* PASO 2: INFORMACIÓN TÉCNICA */}
                {currentStep === 2 && (
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#000000', marginBottom: 20 }}>
                            Paso 2: Información Técnica
                        </h2>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Tipo de Vehículo</label>
                                <select
                                    className="form-select"
                                    value={formData.body_type}
                                    onChange={(e) => updateField('body_type', e.target.value)}
                                >
                                    <option value="AUTO">Auto / Sedán / Hatchback</option>
                                    <option value="SUV">SUV</option>
                                    <option value="PICKUP">Pickup</option>
                                    <option value="UTILITY">Utilitario / Furgón</option>
                                    <option value="TRUCK">Camión</option>
                                    <option value="MOTORCYCLE">Moto</option>
                                    <option value="OTHER">Otro</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Combustible</label>
                                <select
                                    className="form-select"
                                    value={formData.fuel_type}
                                    onChange={(e) => updateField('fuel_type', e.target.value)}
                                >
                                    <option value="NAFTA">Nafta</option>
                                    <option value="DIESEL">Diesel</option>
                                    <option value="GNC">Nafta / GNC</option>
                                    <option value="HYBRID">Híbrido</option>
                                    <option value="ELECTRIC">Eléctrico</option>
                                    <option value="OTHER">Otro</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Transmisión</label>
                                <select
                                    className="form-select"
                                    value={formData.transmission}
                                    onChange={(e) => updateField('transmission', e.target.value)}
                                >
                                    <option value="MANUAL">Manual</option>
                                    <option value="AUTOMATIC">Automática</option>
                                    <option value="CVT">CVT</option>
                                    <option value="OTHER">Otro</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Puertas</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.doors}
                                    onChange={(e) => updateField('doors', parseInt(e.target.value, 10))}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Color Exterior</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: Blanco Perlado, Gris Grafito"
                                    value={formData.exterior_color}
                                    onChange={(e) => updateField('exterior_color', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Color Interior / Tapizado</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Ej: Cuero Negro, Tela Gris"
                                    value={formData.interior_color}
                                    onChange={(e) => updateField('interior_color', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">VIN / Número de Chasis</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Número de 17 caracteres"
                                    style={{ textTransform: 'uppercase' }}
                                    value={formData.vin}
                                    onChange={(e) => updateField('vin', e.target.value.toUpperCase())}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Número de Motor</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Nro de motor según título"
                                    value={formData.engine_number}
                                    onChange={(e) => updateField('engine_number', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 3: INFORMACIÓN COMERCIAL (ARS) */}
                {currentStep === 3 && (
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#000000', marginBottom: 8 }}>
                            Paso 3: Información Comercial (ARS)
                        </h2>
                        <p style={{ fontSize: 13, color: '#000000', marginBottom: 20 }}>
                            Todos los importes se manejan exclusivamente en <strong>Pesos Argentinos ($ ARS)</strong>.
                        </p>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Valor de Compra / Toma ($ ARS)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Ej: 20000000"
                                    value={formData.purchase_price}
                                    onChange={(e) => updateField('purchase_price', parseInt(e.target.value, 10) || 0)}
                                />
                                <span className="form-help">Monto abonado al adquirir el vehículo: {formatARS(formData.purchase_price)}</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Precio de Venta Publicado ($ ARS) *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Ej: 27000000"
                                    value={formData.sale_price}
                                    onChange={(e) => updateField('sale_price', parseInt(e.target.value, 10) || 0)}
                                    required
                                />
                                <span className="form-help" style={{ color: '#34d399', fontWeight: 600 }}>
                                    Precio público en web: {formatARS(formData.sale_price)}
                                </span>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Precio Mínimo Autorizado ($ ARS)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Ej: 25500000"
                                    value={formData.minimum_price}
                                    onChange={(e) => updateField('minimum_price', parseInt(e.target.value, 10) || 0)}
                                />
                                <span className="form-help">Piso de negociación interna: {formatARS(formData.minimum_price)}</span>
                            </div>
                        </div>

                        {/* Cálculo instantáneo de rentabilidad preliminar */}
                        <div style={{
                            backgroundColor: '#F8FAFC',
                            borderRadius: 10,
                            padding: '18px 22px',
                            border: '1px solid #E2E8F0',
                            marginTop: 16,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 16
                        }}>
                            <div>
                                <div style={{ fontSize: 11, color: '#000000', textTransform: 'uppercase', fontWeight: 700 }}>Ganancia Potencial</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: '#EA580C' }}>
                                    {formatARS(formData.sale_price - formData.purchase_price)}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: '#000000', textTransform: 'uppercase', fontWeight: 700 }}>Margen Proyectado</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: '#059669' }}>
                                    {formData.purchase_price > 0 ? `${(((formData.sale_price - formData.purchase_price) / formData.purchase_price) * 100).toFixed(1)} %` : '0 %'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 4: ORIGEN */}
                {currentStep === 4 && (
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#000000', marginBottom: 20 }}>
                            Paso 4: Origen y Trazabilidad
                        </h2>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Tipo de Origen</label>
                                <select
                                    className="form-select"
                                    value={formData.origin_type}
                                    onChange={(e) => updateField('origin_type', e.target.value)}
                                >
                                    <option value="DIRECT_PURCHASE">Compra Directa de la Agencia</option>
                                    <option value="TRADE_IN">Recibido en Permuta</option>
                                    <option value="CONSIGNMENT">Vehículo Consignado (de un cliente)</option>
                                    <option value="OWN_VEHICLE">Vehículo Propio de la Empresa</option>
                                    <option value="OTHER">Otro</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Estado Inicial en el Sistema</label>
                                <select
                                    className="form-select"
                                    value={formData.status}
                                    onChange={(e) => updateField('status', e.target.value)}
                                >
                                    <option value="AVAILABLE">Disponible para Venta</option>
                                    <option value="IN_PREPARATION">En Preparación (Mecánica / Chapa / Detailing)</option>
                                    <option value="DRAFT">Borrador</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 5: FOTOGRAFÍAS */}
                {currentStep === 5 && (
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#000000', marginBottom: 8 }}>
                            Paso 5: Fotografías del Vehículo
                        </h2>
                        <p style={{ fontSize: 13, color: '#000000', marginBottom: 20 }}>
                            Seleccioná las fotos del vehículo. Se subirán automáticamente al guardar.
                        </p>

                        {/* Input oculto */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFilesSelected}
                        />

                        {/* Botón de selección */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="btn-primary"
                            style={{ marginBottom: 20, padding: '12px 24px', fontSize: 14 }}
                        >
                            <UploadCloud size={18} />
                            <span>Seleccionar Imágenes</span>
                        </button>

                        {/* Previews */}
                        {previews.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                                {previews.map((src, idx) => (
                                    <div key={idx} style={{
                                        position: 'relative',
                                        borderRadius: 10,
                                        overflow: 'hidden',
                                        border: '1px solid #E2E8F0',
                                        aspectRatio: '16/10',
                                        backgroundColor: '#F8FAFC'
                                    }}>
                                        <img src={src} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        
                                        {/* Acciones sobre la miniatura */}
                                        <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
                                            <button
                                                type="button"
                                                onClick={() => setAdjustingPhoto({ index: idx, url: src, fileName: selectedFiles[idx]?.name || 'foto.jpg' })}
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: 6,
                                                    backgroundColor: 'rgba(0,0,0,0.75)',
                                                    color: '#fff',
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                                title="Ajustar encuadre y posición"
                                            >
                                                <Crop size={12} />
                                                <span>Ajustar</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                style={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: '50%',
                                                    backgroundColor: 'rgba(239,68,68,0.85)',
                                                    color: '#fff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: 0
                                                }}
                                                title="Eliminar foto"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>

                                        {idx === 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 6,
                                                left: 6,
                                                backgroundColor: '#EA580C',
                                                color: '#fff',
                                                fontSize: 10,
                                                fontWeight: 700,
                                                padding: '2px 8px',
                                                borderRadius: 20,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4
                                            }}>
                                                <Star size={10} /> Portada
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                border: '2px dashed #CBD5E1',
                                borderRadius: 12,
                                padding: '40px 24px',
                                textAlign: 'center',
                                backgroundColor: '#F8FAFC'
                            }}>
                                <UploadCloud size={40} style={{ color: '#EA580C', margin: '0 auto 12px' }} />
                                <p style={{ fontSize: 15, fontWeight: 600, color: '#000000', marginBottom: 4 }}>
                                    No hay imágenes seleccionadas
                                </p>
                                <p style={{ fontSize: 12.5, color: '#334155', maxWidth: 460, margin: '0 auto' }}>
                                    Hacé click en "Seleccionar Imágenes" para elegir fotos desde tu dispositivo.
                                    La primera imagen será la portada principal.
                                </p>
                            </div>
                        )}

                        <p style={{ fontSize: 12, color: '#334155', marginTop: 12 }}>
                            {selectedFiles.length} {selectedFiles.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
                        </p>
                    </div>
                )}

                {/* PASO 6: PUBLICACIÓN WEB */}
                {currentStep === 6 && (
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#000000', marginBottom: 20 }}>
                            Paso 6: Información para la Página Web
                        </h2>
                        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="form-group">
                                <label className="form-label">Título Comercial</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder={autoTitle}
                                    value={formData.commercial_title}
                                    onChange={(e) => updateField('commercial_title', e.target.value)}
                                />
                                <span className="form-help">Si lo dejás vacío se usará: &quot;{autoTitle}&quot;</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Descripción Comercial</label>
                                <textarea
                                    className="form-textarea"
                                    rows={4}
                                    placeholder="Detalles sobre el estado del auto, historial de servicios, si es primer dueño, equipamiento destacado..."
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Equipamiento y Confort</label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    placeholder="Climatizador bizona, techo solar, tapizado de cuero, pantalla táctil 10'', cámara de retroceso..."
                                    value={formData.equipment}
                                    onChange={(e) => updateField('equipment', e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', backgroundColor: '#F8FAFC', padding: '12px 16px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
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
                                            Por defecto activado. En lugar del monto numérico, el público verá &quot;Consultar precio!&quot;.
                                        </div>
                                    </div>
                                </label>

                                <div style={{ display: 'flex', gap: 20 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.published}
                                            onChange={(e) => updateField('published', e.target.checked)}
                                        />
                                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#000000' }}>
                                            Publicar en el Catálogo Web
                                        </span>
                                    </label>

                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={(e) => updateField('featured', e.target.checked)}
                                        />
                                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#D97706' }}>
                                            Destacar en Portada (Home)
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 7: VISTA PREVIA */}
                {currentStep === 7 && (
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#000000', marginBottom: 20 }}>
                            Paso 7: Vista Previa de la Ficha
                        </h2>
                        
                        <div style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: 14,
                            padding: 24
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <span className="badge badge-available" style={{ marginBottom: 6 }}>
                                        {formData.status}
                                    </span>
                                    <h3 style={{ fontSize: 22, fontWeight: 800, color: '#000000' }}>
                                        {formData.commercial_title || autoTitle}
                                    </h3>
                                    <p style={{ fontSize: 13, color: '#334155' }}>
                                        Año {formData.year} • {formData.mileage?.toLocaleString('es-AR')} km • {formData.fuel_type} • Caja {formData.transmission}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 11, color: '#334155', textTransform: 'uppercase', fontWeight: 700 }}>Precio Publicado</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 800, color: '#059669' }}>
                                        {formatARS(formData.sale_price)}
                                    </div>
                                </div>
                            </div>

                            {formData.description && (
                                <p style={{ fontSize: 13.5, color: '#000000', lineHeight: 1.6, padding: '12px 0', borderTop: '1px solid #E2E8F0' }}>
                                    {formData.description}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* PASO 8: GUARDAR */}
                {currentStep === 8 && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Check size={48} style={{ color: '#34d399', margin: '0 auto 16px' }} />
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#000000', marginBottom: 8 }}>
                            ¡Vehículo Listo para Guardar!
                        </h2>
                        <p style={{ fontSize: 14, color: '#000000', maxWidth: 500, margin: '0 auto 32px' }}>
                            Elegí cómo querés guardar este registro. El vehículo se creará con trazabilidad permanente en el sistema.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                            <button
                                onClick={() => handleSave(false)}
                                disabled={loading}
                                className="btn-secondary"
                                style={{ padding: '12px 24px', fontSize: 14 }}
                            >
                                <Save size={16} />
                                <span>{loading ? (uploadStatus || 'Guardando...') : 'Guardar como Borrador'}</span>
                            </button>

                            <button
                                onClick={() => handleSave(true)}
                                disabled={loading}
                                className="btn-primary"
                                style={{ padding: '12px 28px', fontSize: 14 }}
                            >
                                <Globe size={16} />
                                <span>{loading ? (uploadStatus || 'Guardando...') : 'Guardar y Publicar en Web'}</span>
                            </button>
                        </div>

                        {selectedFiles.length > 0 && !loading && (
                            <p style={{ fontSize: 12, color: '#334155', textAlign: 'center', marginTop: 12 }}>
                                📷 {selectedFiles.length} {selectedFiles.length === 1 ? 'imagen' : 'imágenes'} se subirán al guardar
                            </p>
                        )}
                    </div>
                )}

                {/* BOTONES DE NAVEGACIÓN ANTERIOR / SIGUIENTE */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 32,
                    paddingTop: 20,
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1 || loading}
                        className="btn-secondary"
                        style={{ opacity: currentStep === 1 ? 0.4 : 1 }}
                    >
                        <ArrowLeft size={16} />
                        <span>Anterior</span>
                    </button>

                    {currentStep < 8 && (
                        <button
                            onClick={handleNext}
                            className="btn-primary"
                        >
                            <span>Siguiente</span>
                            <ArrowRight size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Modal de Ajuste de Encuadre */}
            {adjustingPhoto && (
                <ImagePositionModal
                    isOpen={Boolean(adjustingPhoto)}
                    imageUrl={adjustingPhoto.url}
                    fileName={adjustingPhoto.fileName}
                    onClose={() => setAdjustingPhoto(null)}
                    onSave={handleSaveAdjustedPhoto}
                />
            )}
        </div>
    );
}
