import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function EmployeeOrdersPage() {
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect(`/${locale}/login`);

  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emp = employee as any;
  if (!emp) redirect(`/${locale}/register/employee`);

  const { data: orders } = await supabase
    .from('orders')
    .select('*, offerings(name, category, type, duration_months), providers(name)')
    .eq('employee_id', emp.id)
    .order('order_date', { ascending: false });

  const statusLabels: Record<string, string> = {
    pending: 'In behandeling',
    confirmed: 'Bevestigd',
    fulfilled: 'Afgerond',
    cancelled: 'Geannuleerd',
    refunded: 'Terugbetaald',
  };

  const typeLabels: Record<string, string> = {
    subscription: 'Abonnement',
    one_time: 'Eenmalig',
    voucher: 'Voucher',
    package: 'Pakket',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">
          Mijn Bestellingen
        </h1>
        <p className="text-zynq-muted font-sans mt-1">
          Overzicht van al je aankopen
        </p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-zynq-mid/20">
          <div className="divide-y divide-zynq-mid/10">
            {(orders as Array<Record<string, unknown>>).map((order) => {
              const offering = order.offerings as Record<string, string | number | null> | null;
              const provider = order.providers as Record<string, string> | null;
              const status = order.status as string;
              const orderDate = order.order_date as string;

              return (
                <div key={order.id as string} className="p-6 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-sans font-semibold text-lg text-zynq-dark">
                        {offering?.name ?? 'Onbekend'}
                      </h3>
                      <span className={`text-xs font-sans px-2 py-1 rounded ${
                        status === 'confirmed' ? 'bg-zynq-pale text-zynq-green' :
                        status === 'fulfilled' ? 'bg-zynq-green/20 text-zynq-green' :
                        status === 'pending' ? 'bg-zynq-amber/10 text-zynq-amber' :
                        status === 'refunded' ? 'bg-zynq-red/10 text-zynq-red' :
                        'bg-zynq-muted/10 text-zynq-muted'
                      }`}>
                        {statusLabels[status] ?? status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zynq-muted font-sans">
                      <span>{provider?.name}</span>
                      <span>•</span>
                      <span>{offering?.category}</span>
                      <span>•</span>
                      <span>{typeLabels[offering?.type as string] ?? offering?.type}</span>
                      {offering?.duration_months && (
                        <>
                          <span>•</span>
                          <span>{offering.duration_months} {offering.duration_months === 1 ? 'maand' : 'maanden'}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-zynq-muted font-sans mt-2">
                      {new Date(orderDate).toLocaleDateString('nl-NL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-sans font-bold text-xl text-zynq-dark">
                      €{order.amount as number}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-zynq-mid/20 text-center">
          <p className="text-zynq-muted font-sans mb-4">
            Nog geen bestellingen
          </p>
          <Link
            href={`/${locale}/employee/marketplace`}
            className="inline-block bg-zynq-green text-white font-sans font-bold px-6 py-3 rounded hover:bg-zynq-deep transition-colors"
          >
            Naar Marketplace
          </Link>
        </div>
      )}
    </div>
  );
}
