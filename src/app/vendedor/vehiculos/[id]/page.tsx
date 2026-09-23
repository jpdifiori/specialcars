import { notFound } from 'next/navigation';
import { getSellerVehicleDetail } from '@/lib/actions/seller';
import { SellerVehicleDetailClient } from './SellerVehicleDetailClient';

export const dynamic = 'force-dynamic';

export default async function SellerVehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const vehicle = await getSellerVehicleDetail(id);

    if (!vehicle) {
        notFound();
    }

    return <SellerVehicleDetailClient initialVehicle={vehicle} />;
}
