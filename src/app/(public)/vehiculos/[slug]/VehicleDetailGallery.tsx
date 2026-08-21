'use client';

import { useState } from 'react';
import { Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageItem {
    id: string;
    url: string;
    sort_order: number;
    is_primary: boolean;
}

export function VehicleDetailGallery({ images, brand, model }: { images: ImageItem[]; brand: string; model: string }) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="detail-main-img-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <div style={{ textAlign: 'center' }}>
                    <ImageIcon size={48} style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 14 }}>Fotografías en preparación</p>
                </div>
            </div>
        );
    }

    const currentImg = images[selectedIndex] || images[0];

    const handlePrev = () => {
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNext = () => {
        setSelectedIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    };

    return (
        <div className="detail-gallery">
            {/* Foto Principal */}
            <div className="detail-main-img-wrap" style={{ position: 'relative' }}>
                <img 
                    src={currentImg.url} 
                    alt={`${brand} ${model} - Foto ${selectedIndex + 1}`} 
                    className="detail-main-img" 
                />

                {/* Controles de Navegación si hay más de 1 foto */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            style={{
                                position: 'absolute',
                                left: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                                backdropFilter: 'blur(6px)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                            title="Foto anterior"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <button
                            onClick={handleNext}
                            style={{
                                position: 'absolute',
                                right: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                                backdropFilter: 'blur(6px)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                            title="Foto siguiente"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}

                {/* Indicador de fotos */}
                <div style={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {selectedIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="detail-thumbs-grid">
                    {images.map((img, idx) => (
                        <div
                            key={img.id}
                            className={`detail-thumb ${idx === selectedIndex ? 'active' : ''}`}
                            onClick={() => setSelectedIndex(idx)}
                        >
                            <img src={img.url} alt={`${brand} thumbnail ${idx + 1}`} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
