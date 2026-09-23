'use client';

import React, { useState } from 'react';
import { Vehicle } from '@/lib/types';
import { VehicleA4Poster } from './VehicleA4Poster';
import { Printer, X, ExternalLink, Sparkles, Check, CheckSquare } from 'lucide-react';

interface VehicleA4PosterModalProps {
    vehicle: Vehicle | null;
    isOpen: boolean;
    onClose: () => void;
}

export function VehicleA4PosterModal({ vehicle, isOpen, onClose }: VehicleA4PosterModalProps) {
    const [showPrice, setShowPrice] = useState(true);
    const [showQr, setShowQr] = useState(true);
    const [showFeatures, setShowFeatures] = useState(true);

    if (!isOpen || !vehicle) return null;

    const printUrl = `/admin/vehiculos/${vehicle.id}/imprimir?price=${showPrice}&qr=${showQr}&feat=${showFeatures}&auto=1`;
    const viewUrl = `/admin/vehiculos/${vehicle.id}/imprimir?price=${showPrice}&qr=${showQr}&feat=${showFeatures}`;

    const handlePrintDirect = () => {
        const printWindow = window.open(printUrl, '_blank');
        if (printWindow) {
            printWindow.focus();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 14px'
        }}>
            {/* CONTENEDOR PRINCIPAL DEL MODAL */}
            <div style={{
                backgroundColor: '#0F172A',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '920px',
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid #334155',
                overflow: 'hidden'
            }}>
                {/* CABECERA DEL MODAL */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #1E293B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    backgroundColor: '#0F172A'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: '#EA580C',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Printer size={18} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                                Ficha de Parabrisas en Formato A4
                            </h3>
                            <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0 0' }}>
                                {vehicle.brand} {vehicle.model} • <strong style={{ color: '#EA580C' }}>Año {vehicle.year}</strong> • {vehicle.mileage === 0 ? '0 KM' : `${vehicle.mileage?.toLocaleString('es-AR')} km`}
                            </p>
                        </div>
                    </div>

                    {/* BOTONES DE ACCIÓN SUPERIORES */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <a
                            href={viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: '#1E293B',
                                color: '#E2E8F0',
                                border: '1px solid #334155',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                textDecoration: 'none'
                            }}
                            title="Abrir en pestaña completa de navegador"
                        >
                            <ExternalLink size={14} />
                            <span>Pestaña Completa</span>
                        </a>

                        <button
                            type="button"
                            onClick={handlePrintDirect}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: '#EA580C',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)'
                            }}
                        >
                            <Printer size={16} />
                            <span>Imprimir / Descargar PDF</span>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                backgroundColor: '#1E293B',
                                border: 'none',
                                color: '#94A3B8',
                                width: '34px',
                                height: '34px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* BARRA DE FILTROS Y PERSONALIZACIÓN */}
                <div style={{
                    backgroundColor: '#1E293B',
                    padding: '10px 20px',
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Opciones del Cartel:
                        </span>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#F8FAFC', fontWeight: 600 }}>
                            <input
                                type="checkbox"
                                checked={showPrice}
                                onChange={(e) => setShowPrice(e.target.checked)}
                                style={{ accentColor: '#EA580C', cursor: 'pointer' }}
                            />
                            <span>Incluir Precio ({vehicle.sale_price ? 'ARS' : 'Sin precio'})</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#F8FAFC', fontWeight: 600 }}>
                            <input
                                type="checkbox"
                                checked={showQr}
                                onChange={(e) => setShowQr(e.target.checked)}
                                style={{ accentColor: '#EA580C', cursor: 'pointer' }}
                            />
                            <span>Código QR para Celular</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#F8FAFC', fontWeight: 600 }}>
                            <input
                                type="checkbox"
                                checked={showFeatures}
                                onChange={(e) => setShowFeatures(e.target.checked)}
                                style={{ accentColor: '#EA580C', cursor: 'pointer' }}
                            />
                            <span>Equipamiento Destacado</span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#CBD5E1' }}>
                        <Sparkles size={13} color="#EA580C" />
                        <span>Formato A4 Portrait (210×297 mm)</span>
                    </div>
                </div>

                {/* ÁREA DE PREVISUALIZACIÓN CON SCROLL */}
                <div style={{
                    padding: '24px',
                    overflowY: 'auto',
                    backgroundColor: '#334155',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    flex: 1
                }}>
                    <div style={{
                        width: '210mm',
                        minHeight: '297mm',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                        borderRadius: '4px',
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

                {/* PIE INFORMATIVO */}
                <div style={{
                    backgroundColor: '#0F172A',
                    padding: '12px 20px',
                    borderTop: '1px solid #1E293B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#94A3B8'
                }}>
                    <div>
                        💡 Al pulsar <strong>&quot;Imprimir / Descargar PDF&quot;</strong>, seleccioná como destino <strong>&quot;Guardar como PDF&quot;</strong> para bajar el archivo a tu PC, o tu impresora para imprimir directamente.
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            backgroundColor: '#1E293B',
                            color: '#F8FAFC',
                            border: '1px solid #334155',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: 700
                        }}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
