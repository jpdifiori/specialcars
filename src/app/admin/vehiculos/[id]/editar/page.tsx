import { notFound } from 'next/navigation';
import { getVehicleById } from '@/lib/actions/vehicles';
import { EditVehicleForm } from './EditVehicleForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const vehicle = await getVehicleById(id);

    if (!vehicle) {
        notFound();
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ marginBottom: 20 }}>
                <Link href={`/admin/vehiculos/${vehicle.id}`} style={{ fontSize: 13, color: '#EA580C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <ArrowLeft size={14} />
                    <span>Volver a la Ficha</span>
                </Link>
                <h1 className="admin-page-title">
                    Editar {vehicle.brand} {vehicle.model} ({vehicle.stock_code})
                </h1>
                <p className="admin-page-desc">Actualizá los datos técnicos, comerciales y de publicación del vehículo.</p>
            </div>

            <EditVehicleForm vehicle={vehicle} />
        </div>
    );
}
