import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const companyId = session.metadata?.company_id;
        const planTier = session.metadata?.plan_tier;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (companyId) {
          await supabase
            .from('companies')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: 'active',
              plan_tier: planTier || 'starter',
            })
            .eq('id', companyId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;
        const amount = invoice.amount_paid / 100; // Convert from cents
        const periodStart = new Date(invoice.period_start * 1000).toISOString().split('T')[0];
        const periodEnd = new Date(invoice.period_end * 1000).toISOString().split('T')[0];

        // Find company by Stripe customer ID
        const { data: company } = await supabase
          .from('companies')
          .select('*')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (company) {
          // Create invoice record
          await supabase
            .from('company_invoices')
            .insert({
              company_id: company.id,
              stripe_invoice_id: invoice.id,
              period_start: periodStart,
              period_end: periodEnd,
              total_amount: amount,
              status: 'paid',
              due_date: periodEnd,
            });

          // Check if budget period already exists
          const { data: existingPeriod } = await supabase
            .from('budget_periods')
            .select('id')
            .eq('company_id', company.id)
            .eq('period_start', periodStart)
            .maybeSingle();

          if (!existingPeriod) {
            // Create budget period
            const periodResult = await supabase
              .from('budget_periods')
              .insert({
                company_id: company.id,
                period_start: periodStart,
                period_end: periodEnd,
                status: 'open',
              })
              .select('id')
              .single();

            if (periodResult?.data) {
              const period = periodResult.data;

              // Allocate budgets for active employees
              const { data: employees } = await supabase
                .from('employees')
                .select('*')
                .eq('company_id', company.id)
                .eq('status', 'active');

              if (employees) {
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

                if (budgets.length > 0) {
                  await supabase
                    .from('employee_budgets')
                    .insert(budgets);
                }
              }
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        const { data: company } = await supabase
          .from('companies')
          .select('*')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (company) {
          await supabase
            .from('company_invoices')
            .insert({
              company_id: company.id,
              stripe_invoice_id: invoice.id,
              period_start: new Date(invoice.period_start * 1000).toISOString().split('T')[0],
              period_end: new Date(invoice.period_end * 1000).toISOString().split('T')[0],
              total_amount: invoice.amount_due / 100,
              status: 'overdue',
              due_date: new Date(invoice.period_end * 1000).toISOString().split('T')[0],
            });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        await supabase
          .from('companies')
          .update({
            status: 'churned',
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', customerId);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Processing error' }, { status: 500 });
  }
}
