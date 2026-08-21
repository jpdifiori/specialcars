import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
    title: {
        template: '%s | Special Cars',
        default: 'Special Cars | Concesionaria de Autos en Argentina'
    },
    description: 'Sistema integral de gestión y catálogo de automóviles seleccionados, seminuevos y 0 KM.',
    keywords: ['autos argentina', 'concesionaria', 'compra y venta de autos', 'permutas', 'special cars']
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body>
                {children}
            </body>
        </html>
    );
}
