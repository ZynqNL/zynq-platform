import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function EmployerReportsPage() {
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect(`/${locale}/login`);

  const { data: contact } = await supabase
    .from('company_contacts')
    .select('company_id')
    .eq('email', user.email)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ct = contact as any;

  if (!ct) redirect(`/${locale}/employer/dashboard`);

  // Get historical analytics (aggregate only, double-blind)
  const { data: analytics } = await supabase
    .from('employer_analytics')
    .select('*')
    .eq('company_id', ct.company_id)
    .order('period_start', { ascending: false })
    .limit(12);

  const reports = (analytics ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">
          Rapporten
        </h1>
        <p className="text-zynq-muted font-sans mt-1">
          Geaggregeerde vitaliteitsdata — individuele aankopen zijn niet zichtbaar
        </p>
      </div>

      {reports.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-zynq-mid/20">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-zynq-mid/20 bg-zynq-pale/50">
                  <th className="text-left p-4 text-zynq-muted font-medium">Periode</th>
                  <th className="text-right p-4 text-zynq-muted font-medium">Werknemers</th>
                  <th className="text-right p-4 text-zynq-muted font-medium">Totaal Budget</th>
                  <th className="text-right p-4 text-zynq-muted font-medium">Besteed</th>
                  <th className="text-right p-4 text-zynq-muted font-medium">Benutting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zynq-mid/10">
                {reports.map((report) => {
                  const start = report.period_start as string;
                  const utilization = report.utilization_rate as number;

                  return (
                    <tr key={report.id as string} className="hover:bg-zynq-pale/30">
                      <td className="p-4 font-medium text-zynq-dark">
                        {new Date(start).toLocaleDateString('nl-NL', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </td>
                      <td className="p-4 text-right text-zynq-dark">
                        {report.active_employees as number}
                      </td>
                      <td className="p-4 text-right text-zynq-dark">
                        €{(report.total_budget_allocated as number)?.toFixed(2)}
                      </td>
                      <td className="p-4 text-right text-zynq-amber">
                        €{(report.total_budget_spent as number)?.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`font-bold ${
                            utilization >= 70
                              ? 'text-zynq-green'
                              : utilization >= 40
                              ? 'text-zynq-amber'
                              : 'text-zynq-red'
                          }`}
                        >
                          {utilization}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-zynq-mid/20 text-center">
          <p className="text-zynq-muted font-sans">
            Nog geen rapportage data beschikbaar
          </p>
        </div>
      )}

      {/* Privacy Reminder */}
      <div className="bg-zynq-pale border border-zynq-mid/30 rounded-lg p-4">
        <p className="text-sm text-zynq-dark font-sans">
          <strong>Privacy:</strong> Deze rapporten bevatten alleen geaggregeerde data.
          Individuele aankopen van werknemers zijn niet zichtbaar, conform ons double-blind privacybeleid.
        </p>
      </div>
    </div>
  );
}
