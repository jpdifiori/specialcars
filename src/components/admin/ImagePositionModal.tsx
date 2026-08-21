'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, Check, X, RotateCcw, Maximize2, Crosshair } from 'lucide-react';

interface ImagePositionModalProps {
    imageUrl: string;
    fileName?: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: (adjustedFile: File, newPreviewUrl: string) => void;
}

export function ImagePositionModal({
    imageUrl,
    fileName = 'vehicle-photo.jpg',
    isOpen,
    onClose,
    onSave
}: ImagePositionModalProps) {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imgLoaded, setImgLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Reset when modal opens with new image
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
            setImgLoaded(false);
        }
    }, [isOpen, imageUrl]);

    if (!isOpen) return null;

    // Handle mouse/touch drag
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y
            });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        setPosition({
            x: e.touches[0].clientX - dragStart.x,
            y: e.touches[0].clientY - dragStart.y
        });
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Quick positioning helpers
    const resetCenter = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const alignTop = () => {
        setPosition(prev => ({ ...prev, y: 50 }));
    };

    const alignBottom = () => {
        setPosition(prev => ({ ...prev, y: -50 }));
    };

    const fitImage = () => {
        setZoom(0.85);
        setPosition({ x: 0, y: 0 });
    };

    // Export cropped canvas image
    const handleApply = () => {
        const img = imgRef.current;
        const container = containerRef.current;
        if (!img || !container) return;

        const targetWidth = 1920;
        const targetHeight = 1200; // 16:10 aspect ratio
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Container aspect ratio is 16:10
        const containerRect = container.getBoundingClientRect();
        const scaleToTarget = targetWidth / containerRect.width;

        // Fill background
        ctx.fillStyle = '#F1F5F9';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Calculate natural vs displayed dimensions
        const displayedImgWidth = img.clientWidth * zoom;
        const displayedImgHeight = img.clientHeight * zoom;

        // Center coordinates in container + user offset
        const centerX = (containerRect.width / 2) + position.x;
        const centerY = (containerRect.height / 2) + position.y;

        const drawX = (centerX - (displayedImgWidth / 2)) * scaleToTarget;
        const drawY = (centerY - (displayedImgHeight / 2)) * scaleToTarget;
        const drawW = displayedImgWidth * scaleToTarget;
        const drawH = displayedImgHeight * scaleToTarget;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        canvas.toBlob((blob) => {
            if (!blob) return;
            const newFile = new File([blob], fileName.replace(/\.[^/.]+$/, '') + '-adjusted.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now()
            });
            const newPreviewUrl = URL.createObjectURL(blob);
            onSave(newFile, newPreviewUrl);
            onClose();
        }, 'image/jpeg', 0.92);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
        }}>
            <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                width: '100%',
                maxWidth: 680,
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid #E2E8F0'
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#000000', margin: 0 }}>
                            Ajustar Encuadre y Posición del Vehículo
                        </h3>
                        <p style={{ fontSize: 12.5, color: '#64748B', margin: '2px 0 0' }}>
                            Arrastrá la foto y usá el zoom para centrar el auto en el marco oficial (16:10).
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#F1F5F9',
                            color: '#0F172A',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Framing Viewport (16:10) */}
                <div style={{ padding: '24px', backgroundColor: '#F8FAFC' }}>
                    <div
                        ref={containerRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        style={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '16/10',
                            backgroundColor: '#0F172A',
                            borderRadius: 12,
                            overflow: 'hidden',
                            cursor: isDragging ? 'grabbing' : 'grab',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            userSelect: 'none',
                            touchAction: 'none',
                            border: '2px solid #EA580C',
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                        }}
                    >
                        {/* Hidden native image reference */}
                        <img
                            ref={imgRef}
                            src={imageUrl}
                            alt="Preview adjust"
                            crossOrigin="anonymous"
                            onLoad={() => setImgLoaded(true)}
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                transformOrigin: 'center center',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                pointerEvents: 'none',
                                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                            }}
                        />

                        {/* Guide Overlays */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            pointerEvents: 'none',
                            border: '1px dashed rgba(255,255,255,0.25)',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gridTemplateRows: '1fr 1fr 1fr'
                        }}>
                            <div style={{ borderRight: '1px dashed rgba(255,255,255,0.15)', borderBottom: '1px dashed rgba(255,255,255,0.15)' }} />
                            <div style={{ borderRight: '1px dashed rgba(255,255,255,0.15)', borderBottom: '1px dashed rgba(255,255,255,0.15)' }} />
                            <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.15)' }} />
                            <div style={{ borderRight: '1px dashed rgba(255,255,255,0.15)', borderBottom: '1px dashed rgba(255,255,255,0.15)' }} />
                            <div style={{ borderRight: '1px dashed rgba(255,255,255,0.15)', borderBottom: '1px dashed rgba(255,255,255,0.15)' }} />
                            <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.15)' }} />
                        </div>

                        {/* Drag badge */}
                        <div style={{
                            position: 'absolute',
                            bottom: 12,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            color: '#FFFFFF',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '4px 12px',
                            borderRadius: 20,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            pointerEvents: 'none'
                        }}>
                            <Move size={12} /> Arrastrá para mover el auto
                        </div>
                    </div>

                    {/* Zoom & Quick Action Controls */}
                    <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Zoom Slider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <ZoomOut size={16} style={{ color: '#64748B' }} />
                            <input
                                type="range"
                                min="0.6"
                                max="2.5"
                                step="0.02"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                style={{ flex: 1, accentColor: '#EA580C', cursor: 'pointer' }}
                            />
                            <ZoomIn size={16} style={{ color: '#64748B' }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', minWidth: 42, textAlign: 'right' }}>
                                {Math.round(zoom * 100)}%
                            </span>
                        </div>

                        {/* Preset Alignment Buttons */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button
                                type="button"
                                onClick={resetCenter}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    borderRadius: 6,
                                    border: '1px solid #CBD5E1',
                                    backgroundColor: '#FFFFFF',
                                    color: '#0F172A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    cursor: 'pointer'
                                }}
                            >
                                <Crosshair size={13} style={{ color: '#EA580C' }} />
                                Centrar
                            </button>
                            <button
                                type="button"
                                onClick={fitImage}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    borderRadius: 6,
                                    border: '1px solid #CBD5E1',
                                    backgroundColor: '#FFFFFF',
                                    color: '#0F172A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    cursor: 'pointer'
                                }}
                            >
                                <Maximize2 size={13} style={{ color: '#EA580C' }} />
                                Encajar Todo
                            </button>
                            <button
                                type="button"
                                onClick={alignTop}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    borderRadius: 6,
                                    border: '1px solid #CBD5E1',
                                    backgroundColor: '#FFFFFF',
                                    color: '#0F172A',
                                    cursor: 'pointer'
                                }}
                            >
                                Mover Arriba
                            </button>
                            <button
                                type="button"
                                onClick={alignBottom}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    borderRadius: 6,
                                    border: '1px solid #CBD5E1',
                                    backgroundColor: '#FFFFFF',
                                    color: '#0F172A',
                                    cursor: 'pointer'
                                }}
                            >
                                Mover Abajo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Footer Actions */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 12
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '9px 18px',
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: '#334155',
                            backgroundColor: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            borderRadius: 8,
                            cursor: 'pointer'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleApply}
                        style={{
                            padding: '9px 22px',
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: '#FFFFFF',
                            backgroundColor: '#EA580C',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
                        }}
                    >
                        <Check size={16} />
                        <span>Guardar Encuadre</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
