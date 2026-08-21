import { getAgencySettings } from '@/lib/actions/settings';
import { SettingsForm } from './SettingsForm';

export default async function AdminSettingsPage() {
    const settings = await getAgencySettings();

    return (
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Configuración de la Agencia</h1>
                    <p className="admin-page-desc">Información pública de Special Cars, datos de contacto, enlaces de redes y horarios comerciales.</p>
                </div>
            </div>

            <SettingsForm initialSettings={settings} />
        </div>
    );
}
