import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function EmployerBillingPage() {
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect(`/${locale}/login`);

  const { data: contact } = await supabase
    .from('company_contacts')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ct = contact as any;
  if (!ct) redirect(`/${locale}/employee/dashboard`);

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', ct.company_id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const co = company as any;
  if (!co) redirect(`/${locale}/login`);

  const { data: invoices } = await supabase
    .from('company_invoices')
    .select('*')
    .eq('company_id', co.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const planLabels: Record<string, string> = {
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">
          Facturering
        </h1>
        <p className="text-zynq-muted font-sans mt-1">
          Beheer je abonnement en facturen
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
        <h2 className="font-sans font-semibold text-lg text-zynq-dark mb-4">
          Huidig Abonnement
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-sans font-bold text-zynq-green">
              {planLabels[co.plan_tier] || co.plan_tier}
            </p>
            <p className="text-sm text-zynq-muted font-sans mt-1">
              €{co.monthly_fee_per_fte} per werknemer/maand
            </p>
          </div>
          <div className="flex gap-2">
            <form action="/api/stripe/portal" method="POST">
              <button
                type="submit"
                className="px-4 py-2 bg-zynq-green text-white rounded font-sans hover:bg-zynq-deep transition-colors"
              >
                Betaalmethode Wijzigen
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-lg shadow-sm border border-zynq-mid/20">
        <div className="p-6 border-b border-zynq-mid/20">
          <h2 className="font-sans font-semibold text-lg text-zynq-dark">
            Factuurgeschiedenis
          </h2>
        </div>
        <div className="divide-y divide-zynq-mid/10">
          {invoices && invoices.length > 0 ? (
            (invoices as Array<Record<string, string | number | null>>).map((invoice) => (
              <div key={invoice.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-sans font-medium text-zynq-dark">
                    {invoice.period_start} — {invoice.period_end}
                  </p>
                  <p className="text-sm text-zynq-muted font-sans">
                    {invoice.employee_count} werknemers
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-sans font-bold text-zynq-dark">
                    €{invoice.total_amount}
                  </p>
                  <span className={`text-xs font-sans px-2 py-1 rounded ${
                    invoice.status === 'paid' ? 'bg-zynq-pale text-zynq-green' :
                    invoice.status === 'overdue' ? 'bg-zynq-red/10 text-zynq-red' :
                    'bg-zynq-amber/10 text-zynq-amber'
                  }`}>
                    {invoice.status === 'paid' ? 'Betaald' :
                     invoice.status === 'overdue' ? 'Achterstallig' :
                     invoice.status === 'open' ? 'Open' :
                     invoice.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-zynq-muted font-sans">
              Nog geen facturen
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
