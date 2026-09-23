'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export function SellerPwaInstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [dismissed, setDismissed] = useState(true);

    useEffect(() => {
        // Detectar si ya está en modo standalone PWA
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
        setIsStandalone(isStandaloneMode);

        if (isStandaloneMode) return;

        // Comprobar si el usuario la cerró anteriormente
        const wasDismissed = sessionStorage.getItem('pwa_banner_dismissed') === 'true';
        if (wasDismissed) return;

        // Detectar iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const iOSDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(iOSDevice);

        if (iOSDevice) {
            setDismissed(false);
        }

        // Listener de Chrome/Android
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setDismissed(false);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setDismissed(true);
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
        sessionStorage.setItem('pwa_banner_dismissed', 'true');
    };

    if (isStandalone || dismissed) return null;

    return (
        <div
            style={{
                backgroundColor: 'rgba(234, 88, 12, 0.12)',
                border: '1px solid rgba(234, 88, 12, 0.3)',
                borderRadius: 12,
                padding: '10px 14px',
                margin: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        backgroundColor: '#EA580C',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    <Download size={18} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>
                        Instalar App Salón
                    </div>
                    <div style={{ fontSize: 11, color: '#CBD5E1', lineHeight: 1.3 }}>
                        {isIOS ? (
                            <span>Tocá <Share size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> y <strong>"Agregar a inicio"</strong></span>
                        ) : (
                            <span>Abrí el catálogo directo desde tu pantalla de inicio</span>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {!isIOS && deferredPrompt && (
                    <button
                        onClick={handleInstallClick}
                        style={{
                            backgroundColor: '#EA580C',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Instalar
                    </button>
                )}
                <button
                    onClick={handleDismiss}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        padding: 4,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
