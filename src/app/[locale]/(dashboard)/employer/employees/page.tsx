import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EmployerEmployeesClient from './EmployerEmployeesClient';

export default async function EmployerEmployeesPage() {
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

  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', ct.company_id)
    .order('name');

  return (
    <EmployerEmployeesClient
      initialEmployees={(employees ?? []) as Array<Record<string, unknown>>}
      companyId={ct.company_id}
    />
  );
}
