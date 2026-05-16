import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminProvidersClient from './AdminProvidersClient';

export default async function AdminProvidersPage() {
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

  const { data: providers } = await supabase
    .from('providers')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <AdminProvidersClient
      initialProviders={(providers ?? []) as Array<Record<string, unknown>>}
    />
  );
}
