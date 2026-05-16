import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function EmployeeDashboardPage() {
  const t = await getTranslations('employee.dashboard');
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect(`/${locale}/login`);

  // Get employee data
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emp = employee as any;
  if (!emp) redirect(`/${locale}/register/employee`);

  // Get current budget
  const { data: budget } = await supabase
    .from('employee_budgets')
    .select('*')
    .eq('employee_id', emp.id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bgt = budget as any;

  // Get budget period
  let periodStart = '';
  let periodEnd = '';
  if (bgt) {
    const { data: period } = await supabase
      .from('budget_periods')
      .select('period_start, period_end')
      .eq('id', bgt.budget_period_id)
      .maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = period as any;
    if (p) {
      periodStart = p.period_start;
      periodEnd = p.period_end;
    }
  }

  // Get recent transactions
  const { data: transactions } = await supabase
    .from('budget_transactions')
    .select('*')
    .eq('employee_budget_id', bgt?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(5);

  // Get recent orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*, offerings(name, category), providers(name)')
    .eq('employee_id', emp.id)
    .order('order_date', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">
          {t('title')}
        </h1>
        <p className="text-zynq-muted font-sans mt-1">
          Welkom terug, {emp?.name}
        </p>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <p className="text-sm font-sans text-zynq-muted">{t('total')}</p>
          <p className="text-3xl font-sans font-bold text-zynq-green mt-1">
            €{bgt?.total_amount ?? 0}
          </p>
          {bgt && bgt.bonus_amount > 0 && (
            <p className="text-xs font-sans text-zynq-amber mt-1">
              +€{bgt.bonus_amount} bonus
            </p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <p className="text-sm font-sans text-zynq-muted">{t('spent')}</p>
          <p className="text-3xl font-sans font-bold text-zynq-amber mt-1">
            €{bgt?.spent_amount ?? 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <p className="text-sm font-sans text-zynq-muted">{t('remaining')}</p>
          <p className="text-3xl font-sans font-bold text-zynq-dark mt-1">
            €{bgt?.remaining_amount ?? 0}
          </p>
        </div>
      </div>

      {/* Budget Period */}
      {bgt && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <h2 className="font-sans font-semibold text-lg text-zynq-dark mb-4">
            Huidige Periode
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm font-sans text-zynq-muted mb-1">
                <span>{periodStart}</span>
                <span>{periodEnd}</span>
              </div>
              <div className="w-full bg-zynq-pale rounded-full h-2">
                <div
                  className="bg-zynq-green h-2 rounded-full transition-all"
                  style={{
                    width: bgt.total_amount > 0
                      ? `${(bgt.spent_amount / bgt.total_amount) * 100}%`
                      : '0%',
                  }}
                />
              </div>
              <p className="text-xs font-sans text-zynq-muted mt-1">
                {bgt.total_amount > 0
                  ? `${Math.round((bgt.spent_amount / bgt.total_amount) * 100)}% besteed`
                  : 'Nog geen bestedingen'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {transactions && transactions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-zynq-mid/20">
          <div className="p-6 border-b border-zynq-mid/20">
            <h2 className="font-sans font-semibold text-lg text-zynq-dark">
              Transactiegeschiedenis
            </h2>
          </div>
          <div className="divide-y divide-zynq-mid/10">
            {(transactions as Array<Record<string, string | number | null>>).map((tx) => (
              <div key={tx.id as string} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-sans font-medium text-zynq-dark">
                    {tx.type === 'allocation' ? 'Budget Toewijzing' :
                     tx.type === 'spend' ? 'Bestelling' :
                     tx.type === 'bonus' ? 'Bonus Budget' :
                     tx.type === 'refund' ? 'Terugbetaling' :
                     tx.type === 'rollover' ? 'Overdracht' :
                     tx.type}
                  </p>
                  {tx.description && (
                    <p className="text-sm text-zynq-muted font-sans">{tx.description as string}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`font-sans font-bold ${
                    (tx.type as string) === 'spend' ? 'text-zynq-red' : 'text-zynq-green'
                  }`}>
                    {(tx.type as string) === 'spend' ? '-' : '+'}€{tx.amount}
                  </p>
                  <p className="text-xs text-zynq-muted font-sans">
                    {new Date(tx.created_at as string).toLocaleDateString('nl-NL')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {orders && orders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-zynq-mid/20">
          <div className="p-6 border-b border-zynq-mid/20">
            <h2 className="font-sans font-semibold text-lg text-zynq-dark">
              Recente Bestellingen
            </h2>
          </div>
          <div className="divide-y divide-zynq-mid/10">
            {(orders as Array<Record<string, unknown>>).map((order) => {
              const offering = order.offerings as Record<string, string> | null;
              const provider = order.providers as Record<string, string> | null;
              const status = order.status as string;
              return (
                <div key={order.id as string} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-sans font-medium text-zynq-dark">
                      {offering?.name ?? 'Onbekend'}
                    </p>
                    <p className="text-sm text-zynq-muted font-sans">
                      {provider?.name ?? ''} — {offering?.category ?? ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans font-bold text-zynq-dark">
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
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href={`/${locale}/employee/marketplace`}
          className="bg-zynq-green text-white p-6 rounded-lg shadow-sm hover:bg-zynq-deep transition-colors"
        >
          <h3 className="font-sans font-semibold text-lg">{t('marketplace')}</h3>
          <p className="text-zynq-light text-sm mt-1">Ontdek vitaliteitsaanbod</p>
        </a>
        <a
          href={`/${locale}/employee/orders`}
          className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20 hover:border-zynq-green transition-colors"
        >
          <h3 className="font-sans font-semibold text-lg text-zynq-dark">{t('myOrders')}</h3>
          <p className="text-zynq-muted text-sm mt-1">Bekijk al je bestellingen</p>
        </a>
      </div>
    </div>
  );
}
