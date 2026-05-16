import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProviderOrdersPage() {
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect(`/${locale}/login`);

  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('contact_email', user.email)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prov = provider as any;
  if (!prov || prov.status !== 'approved') {
    redirect(`/${locale}/provider/dashboard`);
  }

  // Get offerings for this provider
  const { data: offerings } = await supabase
    .from('offerings')
    .select('id')
    .eq('provider_id', prov.id);

  const offeringIds = (offerings as Array<Record<string, string>> | null)?.map((o) => o.id) ?? [];

  if (offeringIds.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-sans font-bold text-3xl text-zynq-green">Bestellingen</h1>
        <div className="bg-white p-12 rounded-lg shadow-sm border border-zynq-mid/20 text-center">
          <p className="text-zynq-muted font-sans">Nog geen aanbod, dus geen bestellingen.</p>
        </div>
      </div>
    );
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, offerings(name), employees(name)')
    .in('offering_id', offeringIds)
    .order('order_date', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">
          Bestellingen
        </h1>
        <p className="text-zynq-muted font-sans mt-1">
          Overzicht van alle bestellingen voor jouw aanbod
        </p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-zynq-mid/20">
          <div className="divide-y divide-zynq-mid/10">
            {(orders as Array<Record<string, unknown>>).map((order) => {
              const offering = order.offerings as Record<string, string> | null;
              const employee = order.employees as Record<string, string> | null;
              const status = order.status as string;

              return (
                <div key={order.id as string} className="p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-sans font-semibold text-zynq-dark">
                      {offering?.name ?? 'Onbekend'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-zynq-muted font-sans mt-1">
                      <span>
                        {new Date(order.order_date as string).toLocaleDateString('nl-NL')}
                      </span>
                      <span>•</span>
                      <span>
                        {employee?.name ? `Werknemer: ${employee.name}` : 'Anoniem'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-sans font-bold text-xl text-zynq-dark">
                      €{order.amount as number}
                    </p>
                    <span className={`text-xs font-sans px-2 py-1 rounded ${
                      status === 'confirmed' ? 'bg-zynq-pale text-zynq-green' :
                      status === 'fulfilled' ? 'bg-zynq-green/20 text-zynq-green' :
                      status === 'pending' ? 'bg-zynq-amber/10 text-zynq-amber' :
                      'bg-zynq-red/10 text-zynq-red'
                    }`}>
                      {status === 'confirmed' ? 'Bevestigd' :
                       status === 'fulfilled' ? 'Afgerond' :
                       status === 'pending' ? 'In behandeling' :
                       status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-zynq-mid/20 text-center">
          <p className="text-zynq-muted font-sans">
            Nog geen bestellingen
          </p>
        </div>
      )}
    </div>
  );
}
