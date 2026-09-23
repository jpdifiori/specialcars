import { getSellerWantedVehicles, getSellerClients } from '@/lib/actions/seller';
import { SellerWantedView } from '@/components/seller/SellerWantedView';

export const dynamic = 'force-dynamic';

export default async function SellerWantedPage() {
    const [wanted, clients] = await Promise.all([
        getSellerWantedVehicles(),
        getSellerClients()
    ]);

    return <SellerWantedView initialWanted={wanted} initialClients={clients} />;
}
