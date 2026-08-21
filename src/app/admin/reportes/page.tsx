import { getFullReportsData } from '@/lib/actions/reports';
import { formatARS, formatPercent } from '@/lib/utils/currency';
import { ReportsClientView } from './ReportsClientView';

export default async function AdminReportsPage() {
    const reports = await getFullReportsData();

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Centro de Reportes & Analítica</h1>
                    <p className="admin-page-desc">Informes detallados de stock, ventas, rentabilidad real, antigüedad del inventario y permutas en Pesos Argentinos (ARS).</p>
                </div>
            </div>

            <ReportsClientView reports={reports} />
        </div>
    );
}
