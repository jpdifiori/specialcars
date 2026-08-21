import '@/styles/public.css';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { FloatingWhatsApp } from '@/components/public/FloatingWhatsApp';
import { getAgencySettings } from '@/lib/actions/settings';

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getAgencySettings();

    return (
        <div className="public-shell">
            <PublicNavbar 
                whatsappNumber={settings.whatsapp} 
                agencyName={settings.name} 
            />
            
            <main style={{ flex: 1 }}>
                {children}
            </main>

            <PublicFooter settings={settings} />
            <FloatingWhatsApp whatsappNumber={settings.whatsapp} />
        </div>
    );
}
