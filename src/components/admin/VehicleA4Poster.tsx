'use client';

import React from 'react';
import { Vehicle } from '@/lib/types';
import { formatARS } from '@/lib/utils/currency';
import { Gauge, ShieldCheck, QrCode, Phone, MapPin, Sparkles, CheckCircle } from 'lucide-react';

export interface VehicleA4PosterProps {
    vehicle: Vehicle;
    showPrice?: boolean;
    showQr?: boolean;
    showFeatures?: boolean;
    agencyPhone?: string;
    agencyAddress?: string;
    websiteUrl?: string;
}

export function VehicleA4Poster({
    vehicle,
    showPrice = true,
    showQr = true,
    showFeatures = true,
    agencyPhone = '+54 2262 57-4254',
    agencyAddress = 'Necochea, Buenos Aires',
    websiteUrl = 'https://specialcarsnecochea.com'
}: VehicleA4PosterProps) {
    const isZeroKm = vehicle.mileage === 0;
    
    // Normalizar transmisión
    const transmissionLabel = 
        vehicle.transmission === 'AUTOMATIC' ? 'Automática' :
        vehicle.transmission === 'MANUAL' ? 'Manual' :
        vehicle.transmission === 'CVT' ? 'Automática CVT' : (vehicle.transmission || 'Manual');

    // Normalizar combustible
    const fuelLabel = 
        vehicle.fuel_type === 'DIESEL' ? 'Diésel' :
        vehicle.fuel_type === 'NAFTA' ? 'Nafta' :
        vehicle.fuel_type === 'GNC' ? 'Nafta / GNC' :
        vehicle.fuel_type === 'HYBRID' ? 'Híbrido' :
        vehicle.fuel_type === 'ELECTRIC' ? 'Eléctrico' : (vehicle.fuel_type || 'Nafta');

    // URL pública para QR
    const publicVehicleUrl = `${websiteUrl}/vehiculos/${vehicle.slug || vehicle.id}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=4&data=${encodeURIComponent(publicVehicleUrl)}`;

    // Procesar equipamiento
    let featuresList: string[] = [];
    if (vehicle.features) {
        if (typeof vehicle.features === 'string') {
            try {
                const parsed = JSON.parse(vehicle.features);
                if (Array.isArray(parsed)) {
                    featuresList = parsed.filter(Boolean);
                }
            } catch {
                featuresList = vehicle.features.split(/[,;\n•]+/).map(f => f.trim()).filter(Boolean);
            }
        } else if (Array.isArray(vehicle.features)) {
            featuresList = (vehicle.features as string[]).filter(Boolean);
        }
    }

    const isOffer = Boolean(vehicle.is_offer && vehicle.offer_price);
    const finalPrice = (isOffer ? vehicle.offer_price : vehicle.sale_price) || 0;

    return (
        <div className="a4-poster-root">
            <style jsx global>{`
                @page {
                    size: A4 portrait;
                    margin: 0;
                }
                @media print {
                    html, body {
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #FFFFFF !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .a4-poster-root {
                        box-shadow: none !important;
                        margin: 0 !important;
                        border: none !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        max-height: 297mm !important;
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                    }
                }
            `}</style>

            <div style={{
                width: '100%',
                height: '100%',
                minHeight: '297mm',
                maxHeight: '297mm',
                boxSizing: 'border-box',
                padding: '14mm 16mm 12mm 16mm',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Borde perimetral de lujo */}
                <div style={{
                    position: 'absolute',
                    top: '6mm',
                    left: '6mm',
                    right: '6mm',
                    bottom: '6mm',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    pointerEvents: 'none'
                }} />
                
                {/* Acento superior en esquina */}
                <div style={{
                    position: 'absolute',
                    top: '6mm',
                    right: '6mm',
                    width: '40mm',
                    height: '4mm',
                    backgroundColor: '#EA580C',
                    borderTopRightRadius: '8px'
                }} />

                {/* 1. CABECERA INSTITUCIONAL */}
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '2px solid #0F172A',
                        paddingBottom: '10px',
                        marginBottom: '14px'
                    }}>
                        {/* Logo Identitario Special Cars */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '2px solid #EA580C',
                                backgroundColor: '#0F172A',
                                flexShrink: 0
                            }}>
                                <img
                                    src="/images/specialcars-icon.jpg"
                                    alt="Special Cars"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '24px',
                                    fontWeight: 900,
                                    fontStyle: 'italic',
                                    lineHeight: 1,
                                    letterSpacing: '-0.5px'
                                }}>
                                    <span style={{ color: '#0F172A' }}>SPECIAL </span>
                                    <span style={{ color: '#EA580C' }}>CARS</span>
                                </div>
                                <div style={{
                                    fontSize: '9px',
                                    fontWeight: 800,
                                    letterSpacing: '2px',
                                    textTransform: 'uppercase',
                                    color: '#64748B',
                                    marginTop: '4px'
                                }}>
                                    Vehículos Seleccionados & 0 KM
                                </div>
                            </div>
                        </div>

                        {/* Datos de contacto cabecera */}
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '13px',
                                fontWeight: 800,
                                color: '#0F172A'
                            }}>
                                <Phone size={14} color="#EA580C" />
                                <span>{agencyPhone}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: '4px',
                                fontSize: '10px',
                                color: '#64748B',
                                marginTop: '2px'
                            }}>
                                <MapPin size={11} />
                                <span>{agencyAddress}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. EL AÑO COMO PROTAGONISTA ABSOLUTO */}
                    <div style={{
                        backgroundColor: '#0F172A',
                        borderRadius: '14px',
                        padding: '16px 20px',
                        color: '#FFFFFF',
                        textAlign: 'center',
                        position: 'relative',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                        marginBottom: '14px'
                    }}>
                        <div style={{
                            display: 'inline-block',
                            backgroundColor: '#EA580C',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 900,
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            padding: '3px 14px',
                            borderRadius: '20px',
                            marginBottom: '4px'
                        }}>
                            {isZeroKm ? 'UNIDAD 0 KM OFICIAL' : 'AÑO DE FABRICACIÓN'}
                        </div>
                        
                        {/* AÑO GIGANTE PROTAGONISTA */}
                        <div style={{
                            fontSize: '92px',
                            fontWeight: 950,
                            lineHeight: 0.9,
                            letterSpacing: '-2px',
                            color: '#FFFFFF',
                            textShadow: '0 3px 6px rgba(0,0,0,0.4)',
                            margin: '4px 0'
                        }}>
                            {vehicle.year}
                        </div>

                        <div style={{
                            fontSize: '11px',
                            color: '#94A3B8',
                            letterSpacing: '1.5px',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                        }}>
                            ★ UNIDAD SELECCIONADA Y VERIFICADA POR SPECIAL CARS ★
                        </div>
                    </div>

                    {/* 3. MARCA (SECUNDARIA/ELEGANTE) + MODELO Y VERSIÓN (DESTACADOS) */}
                    <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                        {/* Marca discreta */}
                        <div style={{
                            fontSize: '15px',
                            fontWeight: 800,
                            letterSpacing: '4px',
                            textTransform: 'uppercase',
                            color: '#EA580C',
                            marginBottom: '2px'
                        }}>
                            {vehicle.brand}
                        </div>

                        {/* Modelo de gran impacto */}
                        <div style={{
                            fontSize: '34px',
                            fontWeight: 900,
                            color: '#0F172A',
                            lineHeight: 1.1,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.5px'
                        }}>
                            {vehicle.model}
                        </div>

                        {/* Versión */}
                        {vehicle.version && (
                            <div style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                color: '#475569',
                                marginTop: '4px'
                            }}>
                                {vehicle.version}
                            </div>
                        )}
                    </div>

                    {/* 4. KILOMETRAJE - ELEMENTO CLAVE */}
                    <div style={{
                        backgroundColor: '#F8FAFC',
                        border: '2px solid #E2E8F0',
                        borderLeft: '6px solid #EA580C',
                        borderRadius: '10px',
                        padding: '12px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '14px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                backgroundColor: '#FFEDD5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Gauge size={22} color="#EA580C" />
                            </div>
                            <div>
                                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    KILOMETRAJE CERTIFICADO
                                </div>
                                <div style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                                    {isZeroKm ? '0 KM • A ESTRENAR' : `${vehicle.mileage?.toLocaleString('es-AR')} KM`}
                                </div>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: isZeroKm ? '#DCFCE7' : '#EFF6FF',
                            color: isZeroKm ? '#15803D' : '#1D4ED8',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <ShieldCheck size={14} />
                            <span>{isZeroKm ? 'Garantía de Fábrica' : 'Garantía de Documentación'}</span>
                        </div>
                    </div>

                    {/* 5. ESPECIFICACIONES TÉCNICAS RÁPIDAS (GRILLA) */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px',
                        marginBottom: '14px'
                    }}>
                        <div style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            padding: '8px 12px'
                        }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                                Combustible
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                                {fuelLabel}
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            padding: '8px 12px'
                        }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                                Transmisión
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                                {transmissionLabel}
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            padding: '8px 12px'
                        }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                                Color Exterior
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                                {vehicle.exterior_color || 'A consultar'}
                            </div>
                        </div>
                    </div>

                    {/* 6. EQUIPAMIENTO DESTACADO (SI EXISTE Y ESTÁ HABILITADO) */}
                    {showFeatures && featuresList.length > 0 && (
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px dashed #CBD5E1',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            marginBottom: '14px'
                        }}>
                            <div style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                color: '#0F172A',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}>
                                <Sparkles size={12} color="#EA580C" />
                                <span>Equipamiento y Destacados de Serie</span>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '4px 12px'
                            }}>
                                {featuresList.slice(0, 6).map((feat, idx) => (
                                    <div key={idx} style={{
                                        fontSize: '11px',
                                        color: '#334155',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}>
                                        <CheckCircle size={11} color="#16A34A" style={{ flexShrink: 0 }} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {feat}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 7. BLOQUE INFERIOR: PRECIO, QR Y FOOTER */}
                <div>
                    {/* PRECIO (SI ESTÁ HABILITADO) */}
                    {showPrice && finalPrice > 0 && (
                        <div style={{
                            backgroundColor: isOffer ? '#FFF7ED' : '#F1F5F9',
                            border: `2px solid ${isOffer ? '#EA580C' : '#CBD5E1'}`,
                            borderRadius: '10px',
                            padding: '10px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '12px'
                        }}>
                            <div>
                                <div style={{
                                    fontSize: '10px',
                                    fontWeight: 900,
                                    color: isOffer ? '#C2410C' : '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    {isOffer ? `🔥 ${vehicle.offer_label || 'PRECIO DE OFERTA EXCLUSIVO'}` : 'PRECIO CONTADO / PERMUTA'}
                                </div>
                                <div style={{
                                    fontSize: '32px',
                                    fontWeight: 950,
                                    color: isOffer ? '#EA580C' : '#0F172A',
                                    fontFamily: 'monospace',
                                    lineHeight: 1.1
                                }}>
                                    {formatARS(finalPrice)}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B' }}>
                                    Tomamos tu Usado
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A' }}>
                                    Financiación Disponible
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CÓDIGO QR Y LLAMADO A LA ACCIÓN */}
                    {showQr && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            backgroundColor: '#FFFFFF',
                            border: '1.5px solid #E2E8F0',
                            borderRadius: '10px',
                            padding: '8px 14px',
                            marginBottom: '10px'
                        }}>
                            <div style={{
                                width: '68px',
                                height: '68px',
                                flexShrink: 0,
                                border: '1px solid #CBD5E1',
                                borderRadius: '6px',
                                padding: '2px',
                                backgroundColor: '#FFFFFF'
                            }}>
                                <img
                                    src={qrImageUrl}
                                    alt="QR Ficha Online"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '11.5px',
                                    fontWeight: 800,
                                    color: '#0F172A',
                                    textTransform: 'uppercase',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>
                                    <QrCode size={13} color="#EA580C" />
                                    <span>Escaneá con tu celular este código</span>
                                </div>
                                <div style={{ fontSize: '10.5px', color: '#475569', marginTop: '2px', lineHeight: 1.3 }}>
                                    Accedé a la galería con todas las fotografías, ficha técnica 360°, y consultanos directamente por WhatsApp.
                                </div>
                            </div>
                            <div style={{
                                textAlign: 'right',
                                fontSize: '10px',
                                color: '#94A3B8',
                                fontFamily: 'monospace'
                            }}>
                                COD: {vehicle.stock_code}
                                {vehicle.plate ? <br /> : null}
                                {vehicle.plate ? `PAT: ${vehicle.plate}` : null}
                            </div>
                        </div>
                    )}

                    {/* PIE INSTITUCIONAL */}
                    <div style={{
                        borderTop: '1.5px solid #E2E8F0',
                        paddingTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        color: '#64748B'
                    }}>
                        <div>
                            SPECIAL CARS • {agencyAddress}
                        </div>
                        <div style={{ color: '#EA580C' }}>
                            Instagram: @specialcarsnecochea
                        </div>
                        <div>
                            www.specialcarsnecochea.com
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
