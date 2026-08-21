import '@/styles/admin.css';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Panel Administrativo | Special Cars',
    description: 'Gestión integral de vehículos, clientes, operaciones, finanzas y reportes.'
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="admin-shell">
            <AdminSidebar />
            <div className="admin-main">
                <AdminHeader />
                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
