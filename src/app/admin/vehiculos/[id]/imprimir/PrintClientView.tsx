'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Vehicle } from '@/lib/types';
import { VehicleA4Poster } from '@/components/admin/VehicleA4Poster';
import { Printer, ArrowLeft, CheckSquare, Square, Download, Sparkles } from 'lucide-react';

interface PrintClientViewProps {
    vehicle: Vehicle;
    initialPrice?: boolean;
    initialQr?: boolean;
    initialFeatures?: boolean;
    autoPrint?: boolean;
}

export function PrintClientView({
    vehicle,
    initialPrice = true,
    initialQr = true,
    initialFeatures = true,
    autoPrint = false
}: PrintClientViewProps) {
    const [showPrice, setShowPrice] = useState(initialPrice);
    const [showQr, setShowQr] = useState(initialQr);
    const [showFeatures, setShowFeatures] = useState(initialFeatures);

    useEffect(() => {
        if (autoPrint) {
            const timer = setTimeout(() => {
                window.print();
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [autoPrint]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{ backgroundColor: '#475569', minHeight: '100vh', padding: '24px 16px' }}>
            {/* BARRA DE HERRAMIENTAS SUPERIOR (NO SE IMPRIME) */}
            <div className="no-print" style={{
                maxWidth: '210mm',
                margin: '0 auto 20px auto',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '12px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link
                        href="/admin/vehiculos"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#1E293B',
                            color: '#F8FAFC',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '13px',
                            fontWeight: 700
                        }}
                    >
                        <ArrowLeft size={16} />
                        <span>Inventario</span>
                    </Link>
                    <div>
                        <div style={{ fontSize: '15px', fontWeight: 800 }}>
                            Cartel de Parabrisas (A4)
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                            {vehicle.brand} {vehicle.model} • Año {vehicle.year}
                        </div>
                    </div>
                </div>

                {/* OPCIONES RÁPIDAS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                        <input
                            type="checkbox"
                            checked={showPrice}
                            onChange={(e) => setShowPrice(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                        />
                        <span>Mostrar Precio</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                        <input
                            type="checkbox"
                            checked={showQr}
                            onChange={(e) => setShowQr(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                        />
                        <span>Código QR</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                        <input
                            type="checkbox"
                            checked={showFeatures}
                            onChange={(e) => setShowFeatures(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                        />
                        <span>Equipamiento</span>
                    </label>
                </div>

                {/* BOTÓN IMPRIMIR / DESCARGAR PDF */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handlePrint}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#EA580C',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '10px 18px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)'
                        }}
                    >
                        <Printer size={18} />
                        <span>Imprimir / Guardar como PDF</span>
                    </button>
                </div>
            </div>

            {/* TIP INFORMATIVO (NO SE IMPRIME) */}
            <div className="no-print" style={{
                maxWidth: '210mm',
                margin: '0 auto 16px auto',
                backgroundColor: '#1E293B',
                color: '#CBD5E1',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <Sparkles size={16} color="#EA580C" style={{ flexShrink: 0 }} />
                <span>
                    <strong>Para guardar en la PC:</strong> En el diálogo de impresión, seleccioná como destino <strong>&quot;Guardar como PDF&quot;</strong>. La hoja está preconfigurada en A4 exacto sin cabeceras ni pies del navegador.
                </span>
            </div>

            {/* CONTENEDOR DE LA HOJA A4 CON SOMBRA ELEGANTE */}
            <div style={{
                width: '210mm',
                minHeight: '297mm',
                margin: '0 auto',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
                borderRadius: '2px',
                overflow: 'hidden'
            }}>
                <VehicleA4Poster
                    vehicle={vehicle}
                    showPrice={showPrice}
                    showQr={showQr}
                    showFeatures={showFeatures}
                />
            </div>
        </div>
    );
}
