import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Shield } from 'lucide-react';

export default async function EmployerDashboardPage() {
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect(`/${locale}/login`);

  // Get company data
  const { data: contact } = await supabase
    .from('company_contacts')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ct = contact as any;

  if (!ct) {
    // Not a company contact, check if employee
    const { data: employee } = await supabase
      .from('employees')
      .select('company_id')
      .eq('email', user.email)
      .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emp = employee as any;
    if (emp) {
      redirect(`/${locale}/employee/dashboard`);
    }
    redirect(`/${locale}/login`);
  }

  // Get company details
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', ct.company_id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const co = company as any;
  if (!co) redirect(`/${locale}/login`);

  // Get aggregate employee count
  const { count: employeeCount } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', co.id)
    .eq('status', 'active');

  // Get aggregate budget data (employer_analytics - aggregate only, double-blind)
  const { data: analytics } = await supabase
    .from('employer_analytics')
    .select('*')
    .eq('company_id', co.id)
    .order('period_start', { ascending: false })
    .limit(1)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const an = analytics as any;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">
          Dashboard
        </h1>
        <p className="text-zynq-muted font-sans mt-1">
          {co.name}
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="bg-zynq-pale border border-zynq-mid/30 rounded-lg p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-zynq-green mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-sans font-medium text-zynq-green">Privacy</h3>
          <p className="text-sm text-zynq-dark font-serif mt-1">
            Je werknemers kiezen zelf hun vitaliteit. Wij respecteren hun privacy — je ziet alleen geaggregeerde data.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <p className="text-sm font-sans text-zynq-muted">Actieve Werknemers</p>
          <p className="text-3xl font-sans font-bold text-zynq-green mt-1">
            {employeeCount ?? 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <p className="text-sm font-sans text-zynq-muted">Totaal Budget</p>
          <p className="text-3xl font-sans font-bold text-zynq-green mt-1">
            €{an?.total_budget_allocated ?? 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <p className="text-sm font-sans text-zynq-muted">Totaal Besteed</p>
          <p className="text-3xl font-sans font-bold text-zynq-amber mt-1">
            €{an?.total_budget_spent ?? 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <p className="text-sm font-sans text-zynq-muted">Benuttingsgraad</p>
          <p className="text-3xl font-sans font-bold text-zynq-dark mt-1">
            {an?.utilization_rate ?? 0}%
          </p>
        </div>
      </div>

      {/* Utilization Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
        <h2 className="font-sans font-semibold text-lg text-zynq-dark mb-4">
          Budget Benutting (Maandelijks)
        </h2>
        <div className="h-48 bg-zynq-pale rounded flex items-center justify-center text-zynq-muted font-sans">
          Grafiek komt hier — maandelijkse benuttingsdata
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href={`/${locale}/employer/budgets`}
          className="bg-zynq-green text-white p-6 rounded-lg shadow-sm hover:bg-zynq-deep transition-colors"
        >
          <h3 className="font-sans font-semibold text-lg">Bonus Budget Toevoegen</h3>
          <p className="text-zynq-light text-sm mt-1">Geef je team extra vitaliteitsbudget</p>
        </a>
        <a
          href={`/${locale}/employer/employees`}
          className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20 hover:border-zynq-green transition-colors"
        >
          <h3 className="font-sans font-semibold text-lg text-zynq-dark">Werknemers Beheren</h3>
          <p className="text-zynq-muted text-sm mt-1">FTE scores en status bijwerken</p>
        </a>
        <a
          href={`/${locale}/employer/reports`}
          className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20 hover:border-zynq-green transition-colors"
        >
          <h3 className="font-sans font-semibold text-lg text-zynq-dark">Rapporten</h3>
          <p className="text-zynq-muted text-sm mt-1">Geaggregeerde vitaliteitsdata</p>
        </a>
      </div>
    </div>
  );
}
