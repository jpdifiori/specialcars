import type { Metadata, Viewport } from 'next';
import { SellerTopBar } from '@/components/seller/SellerTopBar';
import { SellerBottomNav } from '@/components/seller/SellerBottomNav';
import { SellerPwaInstallBanner } from '@/components/seller/SellerPwaInstallBanner';

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
    themeColor: '#0B0E14',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
};

export const metadata: Metadata = {
    title: 'Salón de Ventas | Special Cars',
    description: 'Catálogo de stock en vivo, clientes y señas para vendedores de salón.',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'SpecialCars Salón'
    }
};

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#0B0E14',
                color: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}
        >
            <SellerTopBar />
            <SellerPwaInstallBanner />
            <main
                style={{
                    flex: 1,
                    paddingBottom: 84, // Espacio para que la BottomNav fija no tape el contenido
                    width: '100%',
                    maxWidth: 768, // Optimizado para smartphones y tablets de salón
                    margin: '0 auto',
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingTop: 12
                }}
            >
                {children}
            </main>
            <SellerBottomNav />
        </div>
    );
}
