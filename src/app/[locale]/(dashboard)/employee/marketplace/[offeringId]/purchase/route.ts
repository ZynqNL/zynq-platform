import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function POST(request: Request, { params }: { params: Promise<{ offeringId: string }> }) {
  const locale = await getLocale();
  const supabase = await createClient();
  const { offeringId } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get employee
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', user.email)
    .eq('status', 'active')
    .maybeSingle();

  const emp = employee as Record<string, unknown> | null;
  if (!emp) {
    return Response.json({ error: 'Employee not found' }, { status: 404 });
  }

  // Get offering
  const { data: offering } = await supabase
    .from('offerings')
    .select('*')
    .eq('id', offeringId)
    .eq('status', 'active')
    .maybeSingle();

  const off = offering as Record<string, unknown> | null;
  if (!off) {
    return Response.json({ error: 'Offering not found' }, { status: 404 });
  }

  const price = off.price as number;

  // ATOMIC purchase via database function
  // This prevents race conditions by doing check + update in a single transaction
  const { data: result, error } = await supabase.rpc('process_purchase', {
    p_employee_id: emp.id as string,
    p_offering_id: off.id as string,
    p_amount: price,
    p_offering_name: off.name as string,
  });

  if (error || !result) {
    console.error('Purchase error:', error);
    return Response.json(
      { error: error?.message ?? 'Failed to process purchase' },
      { status: error?.message?.includes('Insufficient') ? 400 : 500 }
    );
  }

  const purchaseResult = result as Record<string, unknown>;
  if (purchaseResult.success !== true) {
    return Response.json(
      { error: purchaseResult.error ?? 'Purchase failed' },
      { status: 400 }
    );
  }

  redirect(`/${locale}/employee/marketplace?success=true`);
}
