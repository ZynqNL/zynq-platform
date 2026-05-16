import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EmployerBudgetsClient from './EmployerBudgetsClient';

export default async function EmployerBudgetsPage() {
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

  // Get current budget period
  const { data: currentPeriod } = await supabase
    .from('budget_periods')
    .select('*')
    .eq('company_id', ct.company_id)
    .eq('status', 'open')
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const period = currentPeriod as any;

  // Get employee budgets for current period
  let employeeBudgets: Array<Record<string, unknown>> = [];
  if (period) {
    const { data } = await supabase
      .from('employee_budgets')
      .select('*, employees(name, email, fte_score)')
      .eq('budget_period_id', period.id);

    employeeBudgets = (data ?? []) as Array<Record<string, unknown>>;
  }

  return (
    <EmployerBudgetsClient
      period={period}
      employeeBudgets={employeeBudgets}
    />
  );
}
