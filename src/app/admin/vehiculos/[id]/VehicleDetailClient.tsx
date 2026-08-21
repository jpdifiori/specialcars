'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vehicle, ExpenseCategory } from '@/lib/types';
import { toggleVehiclePublish, updateVehicleStatus, deleteVehicle } from '@/lib/actions/vehicles';
import { addVehicleExpense, deleteVehicleExpense } from '@/lib/actions/expenses';
import { registerVehicleImage, setPrimaryVehicleImage, deleteVehicleImage } from '@/lib/actions/images';
import { formatARS } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { createClient } from '@/lib/supabase/client';
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
    Wrench
} from 'lucide-react';

export function VehicleDetailClient({ vehicle }: { vehicle: Vehicle }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'expenses' | 'history'>('photos');
    const [isUpdating, setIsUpdating] = useState(false);
    const [statusVal, setStatusVal] = useState(vehicle.status);
    const [isPublished, setIsPublished] = useState(vehicle.published);

    // Estado para nuevo gasto
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('MECHANICAL');
    const [expenseDesc, setExpenseDesc] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseProvider, setExpenseProvider] = useState('');

    // Estado para upload de fotos
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);

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
        const supabase = createClient();

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setUploadProgress(`Procesando foto ${i + 1} de ${files.length}...`);

            try {
                const options = {
                    maxSizeMB: 1.2,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                };
                const compressedFile = await imageCompression(file, options);

                const ext = file.name.split('.').pop() || 'jpg';
                const fileName = `${vehicle.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

                const { data: uploadData, error: uploadErr } = await supabase.storage
                    .from('vehicle-images')
                    .upload(fileName, compressedFile, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadErr) {
                    console.error('Error subiendo foto:', uploadErr);
                    continue;
                }

                const { data: publicUrlData } = supabase.storage
                    .from('vehicle-images')
                    .getPublicUrl(fileName);

                await registerVehicleImage({
                    vehicle_id: vehicle.id,
                    storage_path: fileName,
                    url: publicUrlData.publicUrl,
                    file_name: file.name,
                    file_size: compressedFile.size,
                    mime_type: compressedFile.type
                });
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
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Estado del Vehículo:</span>
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
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Galería de Fotografías</h3>
                            <p style={{ fontSize: 13, color: '#64748B' }}>
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
                            <ImageIcon size={40} style={{ color: '#94A3B8', margin: '0 auto 12px' }} />
                            <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                                Aún no hay fotografías cargadas
                            </p>
                            <p style={{ fontSize: 13, color: '#64748B' }}>
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
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        {!img.is_primary && (
                                            <button
                                                onClick={() => handleSetPrimary(img.id)}
                                                className="btn-secondary"
                                                style={{ padding: '3px 8px', fontSize: 11, background: '#FFFFFF' }}
                                                title="Hacer Portada Principal"
                                            >
                                                <Star size={12} />
                                                <span>Portada</span>
                                            </button>
                                        )}
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

            {/* TAB: GASTOS & TALLER */}
            {activeTab === 'expenses' && (
                <div className="table-container" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Registro de Gastos del Vehículo</h3>
                            <p style={{ fontSize: 13, color: '#64748B' }}>
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
                            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Nuevo Gasto</h4>
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
                        <div style={{ padding: 32, textAlign: 'center', color: '#64748B' }}>
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
                                        <td style={{ color: '#64748B', fontSize: 12.5 }}>
                                            {formatDate(exp.expense_date)}
                                        </td>
                                        <td>
                                            <span className="badge" style={{ background: '#F1F5F9', color: '#334155' }}>
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600, color: '#0F172A' }}>
                                            {exp.description}
                                        </td>
                                        <td style={{ color: '#64748B' }}>
                                            {exp.provider || '-'}
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0F172A' }}>
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
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
                            Especificaciones Técnicas
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#64748B' }}>Marca y Modelo:</span>
                                <span style={{ fontWeight: 700, color: '#0F172A' }}>{vehicle.brand} {vehicle.model}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#64748B' }}>Versión:</span>
                                <span style={{ fontWeight: 600, color: '#334155' }}>{vehicle.version || '-'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#64748B' }}>Año:</span>
                                <span style={{ fontWeight: 700, color: '#0F172A' }}>{vehicle.year}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#64748B' }}>Kilometraje:</span>
                                <span style={{ fontWeight: 700, color: '#0F172A' }}>{vehicle.mileage?.toLocaleString('es-AR')} km</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#64748B' }}>Combustible:</span>
                                <span style={{ fontWeight: 600, color: '#334155' }}>{vehicle.fuel_type}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#64748B' }}>Transmisión:</span>
                                <span style={{ fontWeight: 600, color: '#334155' }}>{vehicle.transmission}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#64748B' }}>Color Exterior:</span>
                                <span style={{ fontWeight: 600, color: '#334155' }}>{vehicle.exterior_color || '-'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#64748B' }}>VIN / Chasis:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#EA580C' }}>{vehicle.vin || '-'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748B' }}>Nro. de Motor:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#334155' }}>{vehicle.engine_number || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="table-container" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
                            Valores Comerciales & Rentabilidad
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#64748B' }}>Valor de Compra:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0F172A' }}>{formatARS(vehicle.purchase_price)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#64748B' }}>Gastos Invertidos:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#64748B' }}>{formatARS(vehicle.total_expenses)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#64748B' }}>Costo Real Total:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0F172A' }}>{formatARS(vehicle.real_cost)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#64748B' }}>Precio de Venta:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#EA580C', fontSize: 16 }}>{formatARS(vehicle.sale_price)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#64748B' }}>Precio Mínimo:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#64748B' }}>{formatARS(vehicle.minimum_price)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                                <span style={{ color: '#64748B' }}>Ganancia Estimada:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#10B981' }}>{formatARS(vehicle.potential_profit)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748B' }}>Días en Stock:</span>
                                <span style={{ fontWeight: 700, color: '#0F172A' }}>{vehicle.days_in_stock} días</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
