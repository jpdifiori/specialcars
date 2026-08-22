import { getWantedVehicleById, getMatchingStockForWanted } from '@/lib/actions/wanted-vehicles';
import { notFound } from 'next/navigation';
import { WantedVehicleDetailClient } from './WantedVehicleDetailClient';

export default async function WantedVehicleDetailPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const wanted = await getWantedVehicleById(id);

    if (!wanted) {
        notFound();
    }

    const matches = await getMatchingStockForWanted(id);

    return <WantedVehicleDetailClient wanted={wanted} initialMatches={matches} />;
}
