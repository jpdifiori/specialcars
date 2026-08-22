'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vehicle, ExpenseCategory, MatchResult } from '@/lib/types';
import { toggleVehiclePublish, updateVehicleStatus, deleteVehicle } from '@/lib/actions/vehicles';
import { addVehicleExpense, deleteVehicleExpense } from '@/lib/actions/expenses';
import { uploadVehicleImageAction, setPrimaryVehicleImage, deleteVehicleImage } from '@/lib/actions/images';
import { formatARS } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { isOfferActive, calculateOfferSavings } from '@/lib/utils/offer';
import imageCompression from 'browser-image-compression';
import { 
    Info, 
    Image as ImageIcon, 
    DollarSign, 
    FileText, 
    History, 
    Globe, 
    Plus, 
    Trash2, 
    Star, 
    UploadCloud, 
    AlertCircle, 
    Check,
    Wrench,
    Crop,
    Flame,
    MessageCircle,
    User,
    Phone,
    CheckCircle2
} from 'lucide-react';
import { ImagePositionModal } from '@/components/admin/ImagePositionModal';
import { WhatsAppPreparationModal } from '@/components/admin/WhatsAppPreparationModal';

export function VehicleDetailClient({ 
    vehicle,
    matchingBuyers = []
}: { 
    vehicle: Vehicle;
    matchingBuyers?: MatchResult[];
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'photos' | 'interesados' | 'expenses' | 'info'>('photos');
    const [isUpdating, setIsUpdating] = useState(false);
    const [statusVal, setStatusVal] = useState(vehicle.status);
    const [isPublished, setIsPublished] = useState(vehicle.published);

    // Estado para WhatsApp Modal
    const [whatsappModalTarget, setWhatsappModalTarget] = useState<{
        client: any;
        wantedBrand?: string;
        wantedModel?: string;
    } | null>(null);

    // Estado para nuevo gasto
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('MECHANICAL');
    const [expenseDesc, setExpenseDesc] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseProvider, setExpenseProvider] = useState('');

    // Estado para upload de fotos
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const [adjustingImage, setAdjustingImage] = useState<{ id: string; url: string; fileName: string; isPrimary: boolean; storagePath: string } | null>(null);

    // Toggle Publicar
    const handleTogglePublish = async () => {
        setIsUpdating(true);
        const newPub = !isPublished;
        const res = await toggleVehiclePublish(vehicle.id, newPub);
        if (res.success) {
            setIsPublished(newPub);
            router.refresh();
        }
        setIsUpdating(false);
    };

    // Cambiar Estado
    const handleChangeStatus = async (newStatus: string) => {
        setIsUpdating(true);
        setStatusVal(newStatus as any);
        const res = await updateVehicleStatus(vehicle.id, newStatus);
        if (res.success) {
            router.refresh();
        }
        setIsUpdating(false);
    };

    // Agregar Gasto
    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!expenseDesc || !expenseAmount) return;

        setIsUpdating(true);
        const res = await addVehicleExpense({
            vehicle_id: vehicle.id,
            category: expenseCategory,
            description: expenseDesc,
            amount: parseFloat(expenseAmount.replace(/[^0-9.]/g, '')) || 0,
            provider: expenseProvider
        });

        if (res.success) {
            setShowExpenseModal(false);
            setExpenseDesc('');
            setExpenseAmount('');
            setExpenseProvider('');
            router.refresh();
        }
        setIsUpdating(false);
    };

    // Eliminar Gasto
    const handleDeleteExpense = async (expenseId: string) => {
        if (!confirm('¿Seguro que deseas eliminar este gasto?')) return;
        setIsUpdating(true);
        await deleteVehicleExpense(expenseId, vehicle.id);
        router.refresh();
        setIsUpdating(false);
    };

    // Subir Fotos a Supabase Storage con compresión
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setUploadProgress(`Procesando y subiendo foto ${i + 1} de ${files.length}...`);

            try {
                const options = {
                    maxSizeMB: 1.2,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                };
                const compressedFile = await imageCompression(file, options);

                const uploadData = new FormData();
                uploadData.append('vehicle_id', vehicle.id);
                uploadData.append('file', compressedFile, file.name);
                uploadData.append('is_primary', (!vehicle.images || vehicle.images.length === 0) && i === 0 ? 'true' : 'false');

                const res = await uploadVehicleImageAction(uploadData);
                if (!res.success) {
                    console.error('Error subiendo foto:', res.error);
                }
            } catch (err) {
                console.error('Error procesando imagen:', err);
            }
        }

        setUploading(false);
        setUploadProgress(null);
        router.refresh();
    };

    const handleSetPrimary = async (imageId: string) => {
        await setPrimaryVehicleImage(vehicle.id, imageId);
        router.refresh();
    };

    const handleDeleteImage = async (imageId: string, storagePath: string) => {
        if (!confirm('¿Eliminar esta fotografía?')) return;
        await deleteVehicleImage(imageId, vehicle.id, storagePath);
        router.refresh();
    };

    const handleSaveAdjustedImage = async (adjustedFile: File, _newPreviewUrl: string) => {
        if (!adjustingImage) return;
        setUploading(true);
        setUploadProgress('Guardando foto con el nuevo encuadre...');

        try {
            const uploadData = new FormData();
            uploadData.append('vehicle_id', vehicle.id);
            uploadData.append('file', adjustedFile, adjustedFile.name);
            uploadData.append('is_primary', adjustingImage.isPrimary ? 'true' : 'false');

            const res = await uploadVehicleImageAction(uploadData);
            if (res.success) {
                if (adjustingImage.id) {
                    await deleteVehicleImage(adjustingImage.id, vehicle.id, adjustingImage.storagePath);
                }
            } else {
                alert('Error al guardar encuadre: ' + res.error);
            }
        } catch (err: any) {
            console.error('Error guardando encuadre:', err);
        } finally {
            setUploading(false);
            setUploadProgress(null);
            setAdjustingImage(null);
            router.refresh();
        }
    };

    return (
        <div>
            {/* Panel Superior de Acciones de Estado y Publicación */}
            <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                marginBottom: 24,
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#000000' }}>Estado del Vehículo:</span>
                    <select
                        className="admin-select"
                        value={statusVal}
                        disabled={isUpdating}
                        onChange={(e) => handleChangeStatus(e.target.value)}
                    >
                        <option value="AVAILABLE">Disponible para Venta</option>
                        <option value="IN_PREPARATION">En Preparación (Taller/Fotos)</option>
                        <option value="RESERVED">Reservado (Con Seña)</option>
                        <option value="SOLD">Vendido</option>
                        <option value="WITHDRAWN">Retirado</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={handleTogglePublish}
                        disabled={isUpdating}
                        className={isPublished ? 'btn-secondary' : 'btn-primary'}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <Globe size={16} />
                        <span>{isPublished ? 'Despublicar de la Web' : 'Publicar en la Web'}</span>
                    </button>
                </div>
            </div>

            {/* Banner de Alerta de Demanda Comercial si hay compradores en espera */}
            {matchingBuyers.length > 0 && (
                <div style={{
                    backgroundColor: '#FFF7ED',
                    border: '2px solid #FDBA74',
                    borderRadius: 14,
                    padding: '16px 20px',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    boxShadow: '0 4px 16px rgba(234, 88, 12, 0.12)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            backgroundColor: '#EA580C',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)'
                        }}>
                            <Flame size={22} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#9A3412', margin: 0 }}>
                                🔥 {matchingBuyers.length} {matchingBuyers.length === 1 ? 'CLIENTE PODRÍA ESTAR INTERESADO' : 'CLIENTES PODRÍAN ESTAR INTERESADOS'}
                            </h3>
                            <p style={{ fontSize: 13, color: '#C2410C', margin: '2px 0 0 0' }}>
                                Hay pedidos de búsqueda activos compatibles con este {vehicle.brand} {vehicle.model}. Podés contactarlos vía WhatsApp.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setActiveTab('interesados')}
                        style={{
                            backgroundColor: '#EA580C',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '9px 18px',
                            borderRadius: 10,
                            fontWeight: 800,
                            fontSize: 13,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                        }}
                    >
                        Ver Interesados ({matchingBuyers.length})
                    </button>
                </div>
            )}

            {/* BANNER DE OFERTA ACTIVA */}
            {isOfferActive(vehicle) && (
                <div style={{
                    backgroundColor: '#FFF7ED',
                    border: '2px solid #EA580C',
                    borderRadius: 14,
                    padding: '16px 20px',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16,
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.15)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            backgroundColor: '#EA580C',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)'
                        }}>
                            <Flame size={24} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{
                                    backgroundColor: '#EA580C',
                                    color: '#FFFFFF',
                                    fontWeight: 900,
                                    fontSize: 12,
                                    padding: '2px 8px',
                                    borderRadius: 6
                                }}>
                                    🔥 {vehicle.offer_label || 'OFERTA'}
                                </span>
                                <span style={{
                                    backgroundColor: '#059669',
                                    color: '#FFFFFF',
                                    fontWeight: 800,
                                    fontSize: 12,
                                    padding: '2px 8px',
                                    borderRadius: 6
                                }}>
                                    {calculateOfferSavings(vehicle.sale_price, vehicle.offer_price!).formattedDiscount} OFF
                                </span>
                                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#9A3412', margin: 0 }}>
                                    Vehículo en Oferta Promocional
                                </h3>
                            </div>
                            <div style={{ fontSize: 13, color: '#9A3412', marginTop: 4 }}>
                                Precio Lista: <strong style={{ textDecoration: 'line-through' }}>{formatARS(vehicle.sale_price)}</strong> → Precio Oferta: <strong style={{ color: '#EA580C', fontSize: 15 }}>{formatARS(vehicle.offer_price)}</strong> (Ahorro: <strong>{calculateOfferSavings(vehicle.sale_price, vehicle.offer_price!).formattedSavings}</strong>)
                                {vehicle.offer_end_date && ` • Válido hasta: ${formatDate(vehicle.offer_end_date)}`}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs de Navegación */}
            <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #E2E8F0', marginBottom: 20 }}>
                <button
                    onClick={() => setActiveTab('photos')}
                    className={`admin-nav-item ${activeTab === 'photos' ? 'active' : ''}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '10px 18px' }}
                >
                    <ImageIcon size={16} />
                    <span>Fotografías ({vehicle.images?.length || 0})</span>
                </button>

                <button
                    onClick={() => setActiveTab('interesados')}
                    className={`admin-nav-item ${activeTab === 'interesados' ? 'active' : ''}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    <Flame size={16} style={{ color: matchingBuyers.length > 0 ? '#EA580C' : 'inherit' }} />
                    <span>Interesados ({matchingBuyers.length})</span>
                </button>

                <button
                    onClick={() => setActiveTab('expenses')}
                    className={`admin-nav-item ${activeTab === 'expenses' ? 'active' : ''}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '10px 18px' }}
                >
                    <Wrench size={16} />
                    <span>Gastos & Taller ({vehicle.expenses?.length || 0})</span>
                </button>

                <button
                    onClick={() => setActiveTab('info')}
                    className={`admin-nav-item ${activeTab === 'info' ? 'active' : ''}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '10px 18px' }}
                >
                    <Info size={16} />
                    <span>Ficha Técnica & Comercial</span>
                </button>
            </div>

            {/* TAB: FOTOGRAFÍAS */}
            {activeTab === 'photos' && (
                <div className="table-container" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#000000' }}>Galería de Fotografías</h3>
                            <p style={{ fontSize: 13, color: '#000000' }}>
                                La imagen con la estrella será la <strong>portada principal</strong> en la página web.
                            </p>
                        </div>

                        <div>
                            <label className="btn-primary" style={{ cursor: 'pointer' }}>
                                <UploadCloud size={16} />
                                <span>{uploading ? 'Subiendo...' : 'Subir Fotografías'}</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>

                    {uploadProgress && (
                        <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', padding: 12, borderRadius: 8, color: '#C2410C', fontSize: 13, marginBottom: 16 }}>
                            {uploadProgress}
                        </div>
                    )}

                    {(!vehicle.images || vehicle.images.length === 0) ? (
                        <div style={{ padding: 48, textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, border: '2px dashed #CBD5E1' }}>
                            <ImageIcon size={40} style={{ color: '#000000', margin: '0 auto 12px' }} />
                            <p style={{ fontSize: 15, fontWeight: 700, color: '#000000', marginBottom: 4 }}>
                                Aún no hay fotografías cargadas
                            </p>
                            <p style={{ fontSize: 13, color: '#000000' }}>
                                Subí imágenes para que el vehículo se visualice en la web pública.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                            {vehicle.images.map((img) => (
                                <div
                                    key={img.id}
                                    style={{
                                        position: 'relative',
                                        aspectRatio: '16/10',
                                        backgroundColor: '#F1F5F9',
                                        borderRadius: 10,
                                        overflow: 'hidden',
                                        border: img.is_primary ? '2px solid #EA580C' : '1px solid #E2E8F0',
                                        boxShadow: img.is_primary ? '0 0 12px rgba(234, 88, 12, 0.3)' : 'none'
                                    }}
                                >
                                    <img src={img.url} alt={vehicle.brand} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    
                                    {img.is_primary && (
                                        <div style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#EA580C', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>
                                            Portada
                                        </div>
                                    )}

                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        padding: '8px',
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 6
                                    }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button
                                                type="button"
                                                onClick={() => setAdjustingImage({
                                                    id: img.id,
                                                    url: img.url,
                                                    fileName: img.file_name || 'photo.jpg',
                                                    isPrimary: img.is_primary,
                                                    storagePath: img.storage_path
                                                })}
                                                className="btn-secondary"
                                                style={{ padding: '3px 8px', fontSize: 11, background: '#FFFFFF', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 4 }}
                                                title="Ajustar Encuadre y Posición"
                                            >
                                                <Crop size={12} />
                                                <span>Encuadre</span>
                                            </button>

                                            {!img.is_primary && (
                                                <button
                                                    onClick={() => handleSetPrimary(img.id)}
                                                    className="btn-secondary"
                                                    style={{ padding: '3px 8px', fontSize: 11, background: '#FFFFFF', color: '#0F172A' }}
                                                    title="Hacer Portada Principal"
                                                >
                                                    <Star size={12} />
                                                    <span>Portada</span>
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleDeleteImage(img.id, img.storage_path)}
                                            style={{ color: '#EF4444', padding: 4, marginLeft: 'auto', background: '#FFFFFF', borderRadius: 4 }}
                                            title="Eliminar fotografía"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: INTERESADOS (MOTOR DE DEMANDA & MATCHING) */}
            {activeTab === 'interesados' && (
                <div className="table-container" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Flame size={20} style={{ color: '#EA580C' }} />
                                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                                    Clientes Potencialmente Interesados ({matchingBuyers.length})
                                </h3>
                            </div>
                            <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                                Búsquedas activas calculadas por el motor de coincidencias contra este vehículo.
                            </p>
                        </div>
                    </div>

                    {matchingBuyers.length === 0 ? (
                        <div style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px dashed #CBD5E1',
                            borderRadius: 14,
                            padding: '40px 20px',
                            textAlign: 'center'
                        }}>
                            <User size={36} style={{ color: '#94A3B8', margin: '0 auto 10px' }} />
                            <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                                No hay búsquedas activas registradas para este modelo
                            </h4>
                            <p style={{ fontSize: 13, color: '#64748B', maxWidth: 440, margin: '6px auto 0' }}>
                                Podés registrar pedidos de tus clientes en el módulo <strong>Vehículos Buscados</strong> para recibir alertas automáticas.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {matchingBuyers.map((m, idx) => {
                                const cl = m.wantedVehicle?.client;
                                const w = m.wantedVehicle;
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            backgroundColor: m.score >= 80 ? '#FFF7ED' : '#F8FAFC',
                                            border: m.score >= 80 ? '1.5px solid #FDBA74' : '1px solid #E2E8F0',
                                            borderRadius: 14,
                                            padding: '16px 20px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 12
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{
                                                        backgroundColor: m.score >= 80 ? '#EA580C' : '#475569',
                                                        color: '#FFFFFF',
                                                        fontSize: 12,
                                                        fontWeight: 900,
                                                        padding: '3px 8px',
                                                        borderRadius: 12
                                                    }}>
                                                        {m.score}% Coincidencia
                                                    </span>
                                                    <span style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>
                                                        {cl ? `${cl.first_name} ${cl.last_name}` : 'Cliente'}
                                                    </span>
                                                    {w?.priority === 'HIGH' && (
                                                        <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: 11, fontWeight: 800, padding: '2px 6px', borderRadius: 6 }}>
                                                            Prioridad Alta
                                                        </span>
                                                    )}
                                                </div>

                                                <div style={{ fontSize: 13, color: '#334155', marginTop: 4 }}>
                                                    <strong>Busca:</strong> {w?.brand} {w?.model} {w?.version || ''} ({w?.year_min || '—'} - {w?.year_max || '—'})
                                                    {w?.max_budget ? ` • Ppto: ${formatARS(w.max_budget)}` : ''}
                                                </div>

                                                {cl?.phone && (
                                                    <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                                        <Phone size={12} />
                                                        <span>{cl.phone}</span>
                                                        {cl.city && <span>• 📍 {cl.city}</span>}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Botón Preparar WhatsApp */}
                                            {cl && (
                                                <button
                                                    onClick={() => setWhatsappModalTarget({
                                                        client: cl,
                                                        wantedBrand: w?.brand,
                                                        wantedModel: w?.model
                                                    })}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                        backgroundColor: '#25D366',
                                                        color: '#FFFFFF',
                                                        border: 'none',
                                                        padding: '9px 18px',
                                                        borderRadius: 10,
                                                        fontSize: 13,
                                                        fontWeight: 800,
                                                        cursor: 'pointer',
                                                        boxShadow: '0 3px 10px rgba(37, 211, 102, 0.35)',
                                                        transition: 'transform 0.15s'
                                                    }}
                                                >
                                                    <MessageCircle size={16} />
                                                    <span>Preparar WhatsApp</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Puntos destacados */}
                                        {m.highlights.length > 0 && (
                                            <div style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 6,
                                                padding: '8px 12px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                borderRadius: 8,
                                                border: '1px solid #E2E8F0'
                                            }}>
                                                {m.highlights.map((h, hIdx) => (
                                                    <span
                                                        key={hIdx}
                                                        style={{
                                                            fontSize: 11.5,
                                                            fontWeight: 700,
                                                            color: '#334155',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 4
                                                        }}
                                                    >
                                                        <Check size={12} style={{ color: '#059669' }} />
                                                        <span>{h}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Permuta si tiene */}
                                        {w?.has_trade_in && (
                                            <div style={{ fontSize: 12, color: '#1E40AF', backgroundColor: '#EFF6FF', padding: '6px 10px', borderRadius: 6, border: '1px solid #BFDBFE' }}>
                                                <strong>🔄 Entrega en permuta:</strong> {w.trade_in_details || 'Detalles no cargados'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: GASTOS & TALLER */}
            {activeTab === 'expenses' && (
                <div className="table-container" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#000000' }}>Registro de Gastos del Vehículo</h3>
                            <p style={{ fontSize: 13, color: '#000000' }}>
                                Total acumulado: <strong style={{ color: '#EA580C' }}>{formatARS(vehicle.total_expenses)}</strong>. Aumenta automáticamente el Costo Real.
                            </p>
                        </div>

                        <button onClick={() => setShowExpenseModal(true)} className="btn-primary">
                            <Plus size={16} />
                            <span>Agregar Gasto</span>
                        </button>
                    </div>

                    {showExpenseModal && (
                        <div style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: 12,
                            padding: 20,
                            marginBottom: 24
                        }}>
                            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#000000', marginBottom: 16 }}>Nuevo Gasto</h4>
                            <form onSubmit={handleAddExpense}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Categoría *</label>
                                        <select
                                            className="form-select"
                                            value={expenseCategory}
                                            onChange={(e) => setExpenseCategory(e.target.value as any)}
                                        >
                                            <option value="MECHANICAL">Mecánica</option>
                                            <option value="BODYWORK">Chapa</option>
                                            <option value="PAINT">Pintura</option>
                                            <option value="DETAILING">Detailing / Limpieza</option>
                                            <option value="TIRES">Cubiertas / Alineación</option>
                                            <option value="TRANSFER">Transferencia / Gestoría</option>
                                            <option value="PAPERWORK">VTV / Informes de Dominio</option>
                                            <option value="TAXES">Impuestos / Patentes</option>
                                            <option value="TRANSPORT">Flete / Traslado</option>
                                            <option value="FUEL">Combustible</option>
                                            <option value="OTHER">Otro</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Descripción *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Ej: Cambio de aceite, filtros y pastillas"
                                            value={expenseDesc}
                                            onChange={(e) => setExpenseDesc(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Importe ($ ARS) *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="Ej: 350000"
                                            value={expenseAmount}
                                            onChange={(e) => setExpenseAmount(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Proveedor / Taller (Opcional)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Ej: Taller Mecánico San Martín"
                                            value={expenseProvider}
                                            onChange={(e) => setExpenseProvider(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                                    <button type="button" onClick={() => setShowExpenseModal(false)} className="btn-secondary">
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-primary" disabled={isUpdating}>
                                        Guardar Gasto
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {(!vehicle.expenses || vehicle.expenses.length === 0) ? (
                        <div style={{ padding: 32, textAlign: 'center', color: '#000000' }}>
                            No hay gastos registrados para este vehículo.
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Categoría</th>
                                    <th>Descripción</th>
                                    <th>Proveedor</th>
                                    <th>Importe (ARS)</th>
                                    <th style={{ textAlign: 'right' }}>Eliminar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicle.expenses.map((exp) => (
                                    <tr key={exp.id}>
                                        <td style={{ color: '#000000', fontSize: 12.5 }}>
                                            {formatDate(exp.expense_date)}
                                        </td>
                                        <td>
                                            <span className="badge" style={{ background: '#F1F5F9', color: '#000000' }}>
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600, color: '#000000' }}>
                                            {exp.description}
                                        </td>
                                        <td style={{ color: '#000000' }}>
                                            {exp.provider || '-'}
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#000000' }}>
                                            {formatARS(exp.amount)}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleDeleteExpense(exp.id)}
                                                style={{ color: '#EF4444', padding: 4 }}
                                                title="Eliminar gasto"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* TAB: INFORMACIÓN TÉCNICA Y COMERCIAL */}
            {activeTab === 'info' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                    <div className="table-container" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#000000', marginBottom: 16 }}>
                            Especificaciones Técnicas
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#000000' }}>Marca y Modelo:</span>
                                <span style={{ fontWeight: 700, color: '#000000' }}>{vehicle.brand} {vehicle.model}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#000000' }}>Versión:</span>
                                <span style={{ fontWeight: 600, color: '#000000' }}>{vehicle.version || '-'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#000000' }}>Año:</span>
                                <span style={{ fontWeight: 700, color: '#000000' }}>{vehicle.year}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#000000' }}>Kilometraje:</span>
                                <span style={{ fontWeight: 700, color: '#000000' }}>{vehicle.mileage?.toLocaleString('es-AR')} km</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#000000' }}>Combustible:</span>
                                <span style={{ fontWeight: 600, color: '#000000' }}>{vehicle.fuel_type}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#000000' }}>Transmisión:</span>
                                <span style={{ fontWeight: 600, color: '#000000' }}>{vehicle.transmission}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#000000' }}>Color Exterior:</span>
                                <span style={{ fontWeight: 600, color: '#000000' }}>{vehicle.exterior_color || '-'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#000000' }}>VIN / Chasis:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#EA580C' }}>{vehicle.vin || '-'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#000000' }}>Nro. de Motor:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#000000' }}>{vehicle.engine_number || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="table-container" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#000000', marginBottom: 16 }}>
                            Valores Comerciales & Rentabilidad
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#000000' }}>Valor de Compra:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#000000' }}>{formatARS(vehicle.purchase_price)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#000000' }}>Gastos Invertidos:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#000000' }}>{formatARS(vehicle.total_expenses)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#000000' }}>Costo Real Total:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#000000' }}>{formatARS(vehicle.real_cost)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#000000' }}>Precio de Venta:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#EA580C', fontSize: 16 }}>{formatARS(vehicle.sale_price)}</span>
                            </div>
                            {isOfferActive(vehicle) && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8, backgroundColor: '#FFF7ED', margin: '-4px -8px', padding: '8px 8px', borderRadius: 6 }}>
                                        <span style={{ color: '#EA580C', fontWeight: 800 }}>🔥 Precio de Oferta:</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#EA580C', fontSize: 17 }}>{formatARS(vehicle.offer_price)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                        <span style={{ color: '#059669', fontWeight: 700 }}>Ahorro del Comprador:</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#059669' }}>
                                            {calculateOfferSavings(vehicle.sale_price, vehicle.offer_price!).formattedSavings} ({calculateOfferSavings(vehicle.sale_price, vehicle.offer_price!).formattedDiscount})
                                        </span>
                                    </div>
                                </>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#000000' }}>Visualización en Web:</span>
                                <span style={{ fontWeight: 700, color: vehicle.hide_price ? '#EA580C' : '#059669', fontSize: 12.5 }}>
                                    {vehicle.hide_price ? 'Consultar precio! (Oculto)' : (isOfferActive(vehicle) ? 'Precio Oferta Visible' : 'Precio Visible')}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#000000' }}>Precio Mínimo:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#000000' }}>{formatARS(vehicle.minimum_price)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#000000' }}>Ganancia Estimada:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#10B981' }}>{formatARS(vehicle.potential_profit)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#000000' }}>Días en Stock:</span>
                                <span style={{ fontWeight: 700, color: '#000000' }}>{vehicle.days_in_stock} días</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de Ajuste de Encuadre */}
            {adjustingImage && (
                <ImagePositionModal
                    isOpen={Boolean(adjustingImage)}
                    imageUrl={adjustingImage.url}
                    fileName={adjustingImage.fileName}
                    onClose={() => setAdjustingImage(null)}
                    onSave={handleSaveAdjustedImage}
                />
            )}

            {/* Modal de Preparación de WhatsApp para Interesados */}
            {whatsappModalTarget && whatsappModalTarget.client && (
                <WhatsAppPreparationModal
                    isOpen={Boolean(whatsappModalTarget)}
                    onClose={() => setWhatsappModalTarget(null)}
                    client={whatsappModalTarget.client}
                    vehicle={vehicle}
                    wantedBrand={whatsappModalTarget.wantedBrand}
                    wantedModel={whatsappModalTarget.wantedModel}
                />
            )}
        </div>
    );
}
