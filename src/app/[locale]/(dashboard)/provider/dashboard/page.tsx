import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProviderDashboardPage() {
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect(`/${locale}/login`);

  // Get provider
  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('contact_email', user.email)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prov = provider as any;
  if (!prov) redirect(`/${locale}/register/provider`);

  if (prov.status === 'pending') {
    return (
      <div className="space-y-6">
        <h1 className="font-sans font-bold text-3xl text-zynq-green">Dashboard</h1>
        <div className="bg-zynq-amber/10 border border-zynq-amber/30 rounded-lg p-6">
          <h2 className="font-sans font-semibold text-lg text-zynq-amber mb-2">
            Aanvraag in Behandeling
          </h2>
          <p className="text-zynq-dark font-serif">
            Je aanvraag wordt beoordeeld. We nemen zo snel mogelijk contact met je op.
          </p>
        </div>
      </div>
    );
  }

  if (prov.status === 'rejected') {
    return (
      <div className="space-y-6">
        <h1 className="font-sans font-bold text-3xl text-zynq-green">Dashboard</h1>
        <div className="bg-zynq-red/10 border border-zynq-red/30 rounded-lg p-6">
          <h2 className="font-sans font-semibold text-lg text-zynq-red mb-2">
            Aanvraag Afgewezen
          </h2>
          <p className="text-zynq-dark font-serif">
            Je aanvraag is helaas niet goedgekeurd. Neem contact op voor meer informatie.
          </p>
        </div>
      </div>
    );
  }

  // Get stats
  const { count: offeringsCount } = await supabase
    .from('offerings')
    .select('*', { count: 'exact', head: true })
    .eq('provider_id', prov.id);

  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('offering_id', prov.id)
    .in('status', ['confirmed', 'fulfilled']);

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*, employees(name)')
    .eq('offering_id', prov.id)
    .order('order_date', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">
          Dashboard
        </h1>
        <p className="text-zynq-muted font-sans mt-1">
          {prov.name}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <p className="text-sm font-sans text-zynq-muted">Actief Aanbod</p>
          <p className="text-3xl font-sans font-bold text-zynq-green mt-1">
            {offeringsCount ?? 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <p className="text-sm font-sans text-zynq-muted">Bestellingen</p>
          <p className="text-3xl font-sans font-bold text-zynq-green mt-1">
            {ordersCount ?? 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <p className="text-sm font-sans text-zynq-muted">Status</p>
          <p className="text-3xl font-sans font-bold text-zynq-green mt-1 capitalize">
            {prov.status}
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      {recentOrders && recentOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-zynq-mid/20">
          <div className="p-6 border-b border-zynq-mid/20">
            <h2 className="font-sans font-semibold text-lg text-zynq-dark">
              Recente Bestellingen
            </h2>
          </div>
          <div className="divide-y divide-zynq-mid/10">
            {(recentOrders as Array<Record<string, unknown>>).map((order) => {
              const status = order.status as string;
              return (
                <div key={order.id as string} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-sans font-medium text-zynq-dark">
                      Bestelling #{(order.id as string).slice(0, 8)}
                    </p>
                    <p className="text-sm text-zynq-muted font-sans">
                      {new Date(order.order_date as string).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans font-bold text-zynq-dark">
                      €{order.amount as number}
                    </p>
                    <span className={`text-xs font-sans px-2 py-1 rounded ${
                      status === 'confirmed' ? 'bg-zynq-pale text-zynq-green' :
                      status === 'fulfilled' ? 'bg-zynq-green/20 text-zynq-green' :
                      'bg-zynq-amber/10 text-zynq-amber'
                    }`}>
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
