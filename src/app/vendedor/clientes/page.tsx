import { getSellerClients } from '@/lib/actions/seller';
import { SellerClientsView } from '@/components/seller/SellerClientsView';

export const dynamic = 'force-dynamic';

export default async function SellerClientsPage() {
    const clients = await getSellerClients();

    return <SellerClientsView initialClients={clients} />;
}
