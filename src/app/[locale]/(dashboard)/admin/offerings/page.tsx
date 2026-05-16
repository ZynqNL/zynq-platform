import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminOfferingsClient from './AdminOfferingsClient';

export default async function AdminOfferingsPage() {
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect(`/${locale}/login`);

  const { data: contact } = await supabase
    .from('company_contacts')
    .select('role')
    .eq('email', user.email)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ct = contact as any;
  if (ct?.role !== 'admin') redirect(`/${locale}/employer/dashboard`);

  const { data: offerings } = await supabase
    .from('offerings')
    .select('*, providers(name)')
    .order('created_at', { ascending: false });

  return (
    <AdminOfferingsClient
      initialOfferings={(offerings ?? []) as Array<Record<string, unknown>>}
    />
  );
}
