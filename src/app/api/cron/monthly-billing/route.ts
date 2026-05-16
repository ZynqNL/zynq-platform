import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Monthly billing cron job
 * Runs on the 1st of each month via Vercel Cron or Supabase cron
 * 
 * Usage: curl https://your-app.vercel.app/api/cron/monthly-billing
 *        (with cron secret header)
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createAdminClient();

  const now = new Date();
  const periodStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const periodEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

  // Get active companies
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('status', 'active');

  if (!companies || companies.length === 0) {
    return new Response('No active companies', { status: 200 });
  }

  let processed = 0;

  for (const company of companies as Array<Record<string, unknown>>) {
    // Check if budget period already exists
    const { data: existingPeriod } = await supabase
      .from('budget_periods')
      .select('id')
      .eq('company_id', company.id)
      .eq('period_start', periodStart)
      .maybeSingle();

    if (existingPeriod) continue;

    // Create budget period
    const { data: period } = await supabase
      .from('budget_periods')
      .insert({
        company_id: company.id,
        period_start: periodStart,
        period_end: periodEnd,
        status: 'open',
      })
      .select('id')
      .single();

    if (!period) continue;

    // Get active employees
    const { data: employees } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', company.id)
      .eq('status', 'active');

    if (!employees || employees.length === 0) continue;

    // Create budgets
    const budgets = employees.map((emp: Record<string, unknown>) => {
      const fteScore = (emp.fte_score as number) ?? 1;
      const monthlyFee = (company.monthly_fee_per_fte as number) ?? 25;
      const baseAmount = Math.round(fteScore * monthlyFee * 100) / 100;
      return {
        employee_id: emp.id,
        budget_period_id: period.id,
        base_amount: baseAmount,
        bonus_amount: 0,
        total_amount: baseAmount,
        spent_amount: 0,
        remaining_amount: baseAmount,
      };
    });

    await supabase.from('employee_budgets').insert(budgets);

    // Create Stripe invoice
    if (company.stripe_customer_id) {
      const totalAmount = budgets.reduce((sum: number, b: Record<string, unknown>) => sum + (b.base_amount as number), 0);

      await supabase.from('company_invoices').insert({
        company_id: company.id,
        period_start: periodStart,
        period_end: periodEnd,
        employee_count: employees.length,
        total_amount: totalAmount,
        status: 'open',
        due_date: periodEnd,
      });
    }

    processed++;
  }

  return new Response(`Processed ${processed} companies`, { status: 200 });
}
