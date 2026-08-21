'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getClients } from '@/lib/actions/clients';
import { getAdminVehicles } from '@/lib/actions/vehicles';
import { processSimpleSaleAction, processTradeInSaleAction } from '@/lib/actions/operations';
import { Client, Vehicle, PaymentType } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';
import { 
    ArrowLeft, 
    Check, 
    ArrowRight, 
    Car, 
    User, 
    DollarSign, 
    ArrowLeftRight, 
    Plus, 
    Trash2, 
    AlertCircle, 
    Sparkles, 
    ShieldCheck 
} from 'lucide-react';

function NewOperationWizard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedClientId = searchParams.get('clientId');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [clients, setClients] = useState<Client[]>([]);
    const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);

    const [step, setStep] = useState(1);

    const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || '');
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [agreedPrice, setAgreedPrice] = useState<number>(0);
    const [hasTradeIn, setHasTradeIn] = useState<boolean>(false);

    const [tradeInBrand, setTradeInBrand] = useState('');
    const [tradeInModel, setTradeInModel] = useState('');
    const [tradeInVersion, setTradeInVersion] = useState('');
    const [tradeInYear, setTradeInYear] = useState<number>(new Date().getFullYear() - 4);
    const [tradeInMileage, setTradeInMileage] = useState<number>(50000);
    const [tradeInFuel, setTradeInFuel] = useState<string>('NAFTA');
    const [tradeInTransmission, setTradeInTransmission] = useState<string>('MANUAL');
    const [tradeInBodyType, setTradeInBodyType] = useState<string>('AUTO');
    const [tradeInColor, setTradeInColor] = useState('');
    const [tradeInPlate, setTradeInPlate] = useState('');
    const [tradeInVin, setTradeInVin] = useState('');
    const [tradeInValue, setTradeInValue] = useState<number>(0);

    const [payments, setPayments] = useState<{ payment_type: PaymentType; amount: number; reference?: string; notes?: string }[]>([
        { payment_type: 'TRANSFER', amount: 0, reference: '', notes: '' }
    ]);

    const [notes, setNotes] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [cliRes, vehRes] = await Promise.all([
                    getClients({ limit: 100 }),
                    getAdminVehicles({ status: 'AVAILABLE', limit: 100 })
                ]);
                setClients(cliRes.data);
                setAvailableVehicles(vehRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        loadInitialData();
    }, []);

    const selectedVehicle = availableVehicles.find(v => v.id === selectedVehicleId);
    const selectedClient = clients.find(c => c.id === selectedClientId);

    useEffect(() => {
        if (selectedVehicle && agreedPrice === 0) {
            setAgreedPrice(selectedVehicle.sale_price);
        }
    }, [selectedVehicle]);

    const balanceRemaining = agreedPrice - (hasTradeIn ? tradeInValue : 0);
    const totalAdditionalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const difference = balanceRemaining - totalAdditionalPayments;

    const handleAddPayment = () => {
        setPayments(prev => [...prev, { payment_type: 'CASH', amount: Math.max(0, difference), reference: '', notes: '' }]);
    };

    const handleRemovePayment = (index: number) => {
        setPayments(prev => prev.filter((_, i) => i !== index));
    };

    const handlePaymentChange = (index: number, field: string, value: any) => {
        setPayments(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const handleNextStep = () => {
        setError(null);
        if (step === 1 && !selectedClientId) {
            setError('Por favor seleccioná un cliente para la operación.');
            return;
        }
        if (step === 2 && !selectedVehicleId) {
            setError('Por favor seleccioná el vehículo que el cliente va a comprar.');
            return;
        }
        if (step === 3 && agreedPrice <= 0) {
            setError('El precio acordado debe ser mayor a $ 0.');
            return;
        }
        if (step === 4 && hasTradeIn) {
            if (!tradeInBrand.trim() || !tradeInModel.trim() || tradeInValue <= 0) {
                setError('Completá la marca, modelo y valor de toma del vehículo entregado en permuta.');
                return;
            }
            if (tradeInValue >= agreedPrice) {
                setError('El valor de toma no puede superar el precio acordado del vehículo a comprar.');
                return;
            }
        }

        setStep(prev => prev + 1);
    };

    const handleConfirmOperation = async () => {
        setLoading(true);
        setError(null);

        try {
            if (hasTradeIn) {
                const res = await processTradeInSaleAction({
                    client_id: selectedClientId,
                    sold_vehicle_id: selectedVehicleId,
                    agreed_price: agreedPrice,
                    trade_in_value: tradeInValue,
                    trade_in_vehicle: {
                        brand: tradeInBrand.trim(),
                        model: tradeInModel.trim(),
                        version: tradeInVersion.trim() || undefined,
                        year: tradeInYear,
                        mileage: tradeInMileage,
                        fuel_type: tradeInFuel,
                        transmission: tradeInTransmission,
                        body_type: tradeInBodyType,
                        doors: 4,
                        exterior_color: tradeInColor.trim() || undefined,
                        plate: tradeInPlate.trim().toUpperCase() || undefined,
                        vin: tradeInVin.trim().toUpperCase() || undefined,
                        sale_price: 0,
                        minimum_price: 0
                    },
                    payments: payments.filter(p => p.amount > 0),
                    notes: notes || undefined
                });

                if (!res.success) {
                    setError(res.error || 'Error al procesar la permuta');
                    setLoading(false);
                    return;
                }

                router.push(`/admin/operaciones/${res.operation_id}`);
            } else {
                const res = await processSimpleSaleAction({
                    client_id: selectedClientId,
                    vehicle_id: selectedVehicleId,
                    agreed_price: agreedPrice,
                    payments: payments.filter(p => p.amount > 0),
                    notes: notes || undefined
                });

                if (!res.success) {
                    setError(res.error || 'Error al procesar la venta');
                    setLoading(false);
                    return;
                }

                router.push(`/admin/operaciones/${res.operation_id}`);
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado');
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
            <div style={{ marginBottom: 20 }}>
                <Link href="/admin/operaciones" style={{ fontSize: 13, color: '#EA580C', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontWeight: 700 }}>
                    <ArrowLeft size={14} />
                    <span>Volver a Operaciones</span>
                </Link>
                <h1 className="admin-page-title">Nueva Operación de Venta / Permuta</h1>
                <p className="admin-page-desc">Registrá una venta simple o una venta con permuta de vehículo de forma atómica y trazable.</p>
            </div>

            {/* Stepper */}
            <div className="wizard-steps">
                <div className={`wizard-step-item ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    <div className="wizard-step-num">{step > 1 ? <Check size={14} /> : 1}</div>
                    <span>1. Cliente</span>
                </div>
                <div className={`wizard-step-item ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                    <div className="wizard-step-num">{step > 2 ? <Check size={14} /> : 2}</div>
                    <span>2. Vehículo a Comprar</span>
                </div>
                <div className={`wizard-step-item ${step === 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                    <div className="wizard-step-num">{step > 3 ? <Check size={14} /> : 3}</div>
                    <span>3. Precio Acordado</span>
                </div>
                <div className={`wizard-step-item ${step === 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>
                    <div className="wizard-step-num">{step > 4 ? <Check size={14} /> : 4}</div>
                    <span>4. Permuta</span>
                </div>
                <div className={`wizard-step-item ${step === 5 ? 'active' : ''} ${step > 5 ? 'completed' : ''}`}>
                    <div className="wizard-step-num">{step > 5 ? <Check size={14} /> : 5}</div>
                    <span>5. Pagos & Resumen</span>
                </div>
            </div>

            {error && (
                <div className="alert-banner danger" style={{ marginBottom: 20 }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* CONTENIDO DE PASOS */}
            <div className="table-container" style={{ padding: 32, marginBottom: 24 }}>
                {/* PASO 1: SELECCIONAR CLIENTE */}
                {step === 1 && (
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#000000', marginBottom: 16 }}>
                            Paso 1: Seleccionar Cliente Comprador
                        </h2>

                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label className="form-label">Elegir Cliente Existente</label>
                            <select
                                className="form-select"
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                            >
                                <option value="">-- Seleccioná un cliente --</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.first_name} {c.last_name} {c.dni ? `(DNI: ${c.dni})` : ''} {c.phone ? `• Tel: ${c.phone}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                            <span style={{ fontSize: 13, color: '#000000' }}>¿El cliente no está registrado aún?</span>
                            <Link href="/admin/clientes/nuevo" target="_blank" className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
                                <Plus size={14} />
                                <span>Crear Nuevo Cliente</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* PASO 2: SELECCIONAR VEHÍCULO QUE COMPRA */}
                {step === 2 && (
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#000000', marginBottom: 16 }}>
                            Paso 2: Seleccionar Vehículo que Compra el Cliente
                        </h2>

                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label className="form-label">Vehículo Disponible en Stock</label>
                            <select
                                className="form-select"
                                value={selectedVehicleId}
                                onChange={(e) => {
                                    setSelectedVehicleId(e.target.value);
                                    const veh = availableVehicles.find(v => v.id === e.target.value);
                                    if (veh) setAgreedPrice(veh.sale_price);
                                }}
                            >
                                <option value="">-- Seleccioná el vehículo --</option>
                                {availableVehicles.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.stock_code} — {v.brand} {v.model} {v.version || ''} ({v.year}) • {formatARS(v.sale_price)} {v.plate ? `[${v.plate}]` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedVehicle && (
                            <div style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 20, border: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#000000', marginBottom: 6 }}>
                                    {selectedVehicle.brand} {selectedVehicle.model} {selectedVehicle.version || ''} ({selectedVehicle.year})
                                </h3>
                                <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#000000' }}>
                                    <span>Código: <strong style={{ color: '#EA580C' }}>{selectedVehicle.stock_code}</strong></span>
                                    <span>Km: <strong>{selectedVehicle.mileage?.toLocaleString('es-AR')}</strong></span>
                                    <span>Precio Publicado: <strong style={{ color: '#000000' }}>{formatARS(selectedVehicle.sale_price)}</strong></span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* PASO 3: PRECIO ACORDADO */}
                {step === 3 && (
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#000000', marginBottom: 8 }}>
                            Paso 3: Definir Precio Final Acordado
                        </h2>
                        <p style={{ fontSize: 13, color: '#000000', marginBottom: 20 }}>
                            Podés mantener el precio publicado de {formatARS(selectedVehicle?.sale_price)} o modificarlo según la negociación.
                        </p>

                        <div className="form-group" style={{ maxWidth: 400 }}>
                            <label className="form-label">Precio Final Acordado ($ ARS) *</label>
                            <input
                                type="number"
                                className="form-input"
                                value={agreedPrice}
                                onChange={(e) => setAgreedPrice(parseInt(e.target.value, 10) || 0)}
                                required
                            />
                            <span className="form-help" style={{ color: '#EA580C', fontWeight: 800, fontSize: 15 }}>
                                Total a abonar: {formatARS(agreedPrice)}
                            </span>
                        </div>
                    </div>
                )}

                {/* PASO 4: PERMUTA */}
                {step === 4 && (
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#000000', marginBottom: 8 }}>
                            Paso 4: ¿El cliente entrega un vehículo como parte de pago?
                        </h2>
                        <p style={{ fontSize: 13, color: '#000000', marginBottom: 20 }}>
                            Si el cliente entrega un auto en permuta, se creará automáticamente en el inventario de Special Cars con trazabilidad completa.
                        </p>

                        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                            <button
                                type="button"
                                onClick={() => setHasTradeIn(false)}
                                className={!hasTradeIn ? 'btn-primary' : 'btn-secondary'}
                                style={{ padding: '12px 24px', flex: 1 }}
                            >
                                No, es Venta Simple (Sin Permuta)
                            </button>
                            <button
                                type="button"
                                onClick={() => setHasTradeIn(true)}
                                className={hasTradeIn ? 'btn-primary' : 'btn-secondary'}
                                style={{ padding: '12px 24px', flex: 1 }}
                            >
                                <ArrowLeftRight size={16} />
                                <span>Sí, Entrega un Vehículo en Permuta</span>
                            </button>
                        </div>

                        {hasTradeIn && (
                            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #FFEDD5', borderRadius: 12, padding: 24 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#EA580C', marginBottom: 16 }}>
                                    Datos del Vehículo Recibido en Permuta
                                </h3>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Marca *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Ej: Volkswagen"
                                            value={tradeInBrand}
                                            onChange={(e) => setTradeInBrand(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Modelo *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Ej: Golf Highline"
                                            value={tradeInModel}
                                            onChange={(e) => setTradeInModel(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Año *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={tradeInYear}
                                            onChange={(e) => setTradeInYear(parseInt(e.target.value, 10))}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Kilómetros</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={tradeInMileage}
                                            onChange={(e) => setTradeInMileage(parseInt(e.target.value, 10) || 0)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Patente</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ textTransform: 'uppercase' }}
                                            placeholder="Ej: AB123CD"
                                            value={tradeInPlate}
                                            onChange={(e) => setTradeInPlate(e.target.value.toUpperCase())}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Color</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Ej: Gris Plata"
                                            value={tradeInColor}
                                            onChange={(e) => setTradeInColor(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="form-label" style={{ color: '#EA580C', fontSize: 14 }}>
                                            Valor de Toma Reconocido ($ ARS) *
                                        </label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="Ej: 15000000"
                                            style={{ fontSize: 16, fontWeight: 800, color: '#EA580C' }}
                                            value={tradeInValue}
                                            onChange={(e) => setTradeInValue(parseInt(e.target.value, 10) || 0)}
                                            required
                                        />
                                        <span className="form-help">
                                            Valor tomado: {formatARS(tradeInValue)} (Se registrará como costo de compra del nuevo vehículo).
                                        </span>
                                    </div>
                                </div>

                                <div style={{ marginTop: 20, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#000000' }}>Precio Acordado</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#000000' }}>{formatARS(agreedPrice)}</div>
                                    </div>
                                    <div style={{ fontSize: 18, color: '#000000' }}>-</div>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#000000' }}>Valor de Toma</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#EA580C' }}>{formatARS(tradeInValue)}</div>
                                    </div>
                                    <div style={{ fontSize: 18, color: '#000000' }}>=</div>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#000000' }}>Saldo Restante a Cobrar</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#10B981', fontSize: 18 }}>
                                            {formatARS(balanceRemaining)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* PASO 5: PAGOS ADICIONALES Y RESUMEN FINAL */}
                {step === 5 && (
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#000000', marginBottom: 8 }}>
                            Paso 5: Componentes de Pago & Resumen de Operación
                        </h2>
                        <p style={{ fontSize: 13, color: '#000000', marginBottom: 20 }}>
                            Saldo a cubrir con pagos monetarios: <strong>{formatARS(balanceRemaining)}</strong>.
                        </p>

                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#000000' }}>Formas de Pago</h3>
                                <button type="button" onClick={handleAddPayment} className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>
                                    <Plus size={14} />
                                    <span>Agregar Pago</span>
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {payments.map((p, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '160px 180px 1fr 40px', gap: 10, alignItems: 'center' }}>
                                        <select
                                            className="admin-select"
                                            value={p.payment_type}
                                            onChange={(e) => handlePaymentChange(idx, 'payment_type', e.target.value)}
                                        >
                                            <option value="TRANSFER">Transferencia</option>
                                            <option value="CASH">Efectivo</option>
                                            <option value="CHECK">Cheque</option>
                                            <option value="FINANCING">Financiación</option>
                                            <option value="CARD">Tarjeta</option>
                                            <option value="OTHER">Otro</option>
                                        </select>

                                        <input
                                            type="number"
                                            className="admin-input"
                                            placeholder="Importe ($)"
                                            value={p.amount || ''}
                                            onChange={(e) => handlePaymentChange(idx, 'amount', parseInt(e.target.value, 10) || 0)}
                                        />

                                        <input
                                            type="text"
                                            className="admin-input"
                                            placeholder="Nro comprobante, banco o notas..."
                                            value={p.reference || ''}
                                            onChange={(e) => handlePaymentChange(idx, 'reference', e.target.value)}
                                        />

                                        {payments.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePayment(idx)}
                                                style={{ color: '#EF4444', padding: 8 }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RESUMEN FINAL */}
                        <div style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 24, border: '1px solid #E2E8F0', marginBottom: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#000000', marginBottom: 16 }}>
                                Resumen de la Operación
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                                    <span style={{ color: '#000000' }}>Cliente Comprador:</span>
                                    <span style={{ fontWeight: 700, color: '#000000' }}>
                                        {selectedClient?.first_name} {selectedClient?.last_name}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                                    <span style={{ color: '#000000' }}>Vehículo que Sale (Vendido):</span>
                                    <span style={{ fontWeight: 700, color: '#000000' }}>
                                        {selectedVehicle?.brand} {selectedVehicle?.model} ({selectedVehicle?.stock_code})
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                                    <span style={{ color: '#000000' }}>Precio Acordado:</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#000000' }}>
                                        {formatARS(agreedPrice)}
                                    </span>
                                </div>

                                {hasTradeIn && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                                        <span style={{ color: '#EA580C', fontWeight: 700 }}>Vehículo que Entra (Permuta):</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#EA580C' }}>
                                            {tradeInBrand} {tradeInModel} ({formatARS(tradeInValue)})
                                        </span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
                                    <span style={{ fontWeight: 800, color: '#000000' }}>Total Pagos Monetarios:</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#10B981', fontSize: 16 }}>
                                        {formatARS(totalAdditionalPayments)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 24 }}>
                            <label className="form-label">Observaciones / Boleto de Compraventa</label>
                            <textarea
                                className="form-textarea"
                                rows={3}
                                placeholder="Condiciones acordadas, entrega de documentación, fecha de transferencia..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <button
                                type="button"
                                onClick={handleConfirmOperation}
                                disabled={loading}
                                className="btn-primary"
                                style={{ padding: '14px 36px', fontSize: 16, fontWeight: 800, boxShadow: '0 4px 20px rgba(234, 88, 12, 0.4)' }}
                            >
                                <Check size={18} />
                                <span>{loading ? 'Procesando Operación...' : 'Confirmar y Cerrar Operación'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* BOTONES ANTERIOR / SIGUIENTE */}
                {step < 5 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 32,
                        paddingTop: 20,
                        borderTop: '1px solid #E2E8F0'
                    }}>
                        <button
                            type="button"
                            onClick={() => setStep(prev => Math.max(1, prev - 1))}
                            disabled={step === 1 || loading}
                            className="btn-secondary"
                            style={{ opacity: step === 1 ? 0.4 : 1 }}
                        >
                            <ArrowLeft size={16} />
                            <span>Anterior</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleNextStep}
                            className="btn-primary"
                        >
                            <span>Siguiente</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function NewOperationPage() {
    return (
        <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#000000' }}>Cargando asistente de operación...</div>}>
            <NewOperationWizard />
        </Suspense>
    );
}
