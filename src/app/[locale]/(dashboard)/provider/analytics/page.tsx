import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProviderAnalyticsPage() {
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

  // Get offerings
  const { data: offerings } = await supabase
    .from('offerings')
    .select('id, name, price')
    .eq('provider_id', prov.id);

  const offeringIds = (offerings as Array<Record<string, string | number>> | null)?.map((o) => o.id as string) ?? [];

  if (offeringIds.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-sans font-bold text-3xl text-zynq-green">Analytics</h1>
        <div className="bg-white p-12 rounded-lg shadow-sm border border-zynq-mid/20 text-center">
          <p className="text-zynq-muted font-sans">Nog geen aanbod om analytics voor te tonen.</p>
        </div>
      </div>
    );
  }

  // Get order stats
  const { data: orders } = await supabase
    .from('orders')
    .select('offering_id, amount, order_date')
    .in('offering_id', offeringIds)
    .in('status', ['confirmed', 'fulfilled']);

  const totalOrders = (orders as Array<Record<string, unknown>> | null)?.length ?? 0;
  const totalRevenue = (orders as Array<Record<string, unknown>> | null)?.reduce(
    (sum, o) => sum + (o.amount as number), 0
  ) ?? 0;

  // Unique customers (employees who ordered)
  const { data: customerOrders } = await supabase
    .from('orders')
    .select('employee_id')
    .in('offering_id', offeringIds)
    .in('status', ['confirmed', 'fulfilled']);

  const uniqueCustomers = new Set(
    (customerOrders as Array<Record<string, string>> | null)?.map((o) => o.employee_id)
  ).size;

  // Orders per offering
  const ordersByOffering: Record<string, number> = {};
  (orders as Array<Record<string, string>> | null)?.forEach((o) => {
    const id = o.offering_id;
    ordersByOffering[id] = (ordersByOffering[id] ?? 0) + 1;
  });

  // Top offerings
  const topOfferings = (offerings as Array<Record<string, string | number>> | null)
    ?.map((o) => ({
      name: o.name as string,
      price: o.price as number,
      orders: ordersByOffering[o.id as string] ?? 0,
      revenue: (ordersByOffering[o.id as string] ?? 0) * (o.price as number),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">
          Analytics
        </h1>
        <p className="text-zynq-muted font-sans mt-1">
          Inzichten in je prestaties
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <p className="text-sm font-sans text-zynq-muted">Totaal Bestellingen</p>
          <p className="text-3xl font-sans font-bold text-zynq-green mt-1">
            {totalOrders}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <p className="text-sm font-sans text-zynq-muted">Totale Omzet</p>
          <p className="text-3xl font-sans font-bold text-zynq-green mt-1">
            €{totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <p className="text-sm font-sans text-zynq-muted">Unieke Klanten</p>
          <p className="text-3xl font-sans font-bold text-zynq-green mt-1">
            {uniqueCustomers}
          </p>
        </div>
      </div>

      {/* Top Offerings */}
      {topOfferings.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-zynq-mid/20">
          <div className="p-6 border-b border-zynq-mid/20">
            <h2 className="font-sans font-semibold text-lg text-zynq-dark">
              Top Aanbod
            </h2>
          </div>
          <div className="divide-y divide-zynq-mid/10">
            {topOfferings.map((off, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-sans font-medium text-zynq-dark">
                    {off.name}
                  </p>
                  <p className="text-sm text-zynq-muted font-sans">
                    €{off.price} per stuk
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-sans font-bold text-zynq-dark">
                    {off.orders} bestellingen
                  </p>
                  <p className="text-sm text-zynq-green font-sans">
                    €{off.revenue.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
