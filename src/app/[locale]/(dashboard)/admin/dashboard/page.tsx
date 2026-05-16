import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Shield, Building2, Store, Package, AlertTriangle } from 'lucide-react';

export default async function AdminDashboardPage() {
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect(`/${locale}/login`);

  // Verify admin role
  const { data: contact } = await supabase
    .from('company_contacts')
    .select('role')
    .eq('email', user.email)
    .maybeSingle();

  const ct = contact as Record<string, unknown> | null;
  if (ct?.role !== 'admin') {
    redirect(`/${locale}/employer/dashboard`);
  }

  // Platform stats
  const { count: companyCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true });

  const { count: providerCount } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true });

  const { count: offeringCount } = await supabase
    .from('offerings')
    .select('*', { count: 'exact', head: true });

  const { count: pendingProviders } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: pendingOfferings } = await supabase
    .from('offerings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft');

  const counts = {
    companies: companyCount ?? 0,
    providers: providerCount ?? 0,
    offerings: offeringCount ?? 0,
    pendingProviders: pendingProviders ?? 0,
    pendingOfferings: pendingOfferings ?? 0,
  } as Record<string, number>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">
          Admin Dashboard
        </h1>
        <p className="text-zynq-muted font-sans mt-1">
          Platformbeheer en moderatie
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-zynq-blue" />
            <div>
              <p className="text-sm font-sans text-zynq-muted">Bedrijven</p>
              <p className="text-2xl font-sans font-bold text-zynq-dark">
                {counts.companies}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-zynq-green" />
            <div>
              <p className="text-sm font-sans text-zynq-muted">Aanbieders</p>
              <p className="text-2xl font-sans font-bold text-zynq-dark">
                {counts.providers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-zynq-amber" />
            <div>
              <p className="text-sm font-sans text-zynq-muted">Aanbod</p>
              <p className="text-2xl font-sans font-bold text-zynq-dark">
                {counts.offerings}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-amber-200 bg-amber-50/50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-zynq-amber" />
            <div>
              <p className="text-sm font-sans text-zynq-amber">Wachtend</p>
              <p className="text-2xl font-sans font-bold text-zynq-amber">
                {counts.pendingProviders} aanbieders
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-amber-200 bg-amber-50/50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-zynq-amber" />
            <div>
              <p className="text-sm font-sans text-zynq-amber">Concepten</p>
              <p className="text-2xl font-sans font-bold text-zynq-amber">
                {counts.pendingOfferings} aanbod
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href={`/${locale}/admin/companies`}
          className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20 hover:border-zynq-green transition-colors"
        >
          <h3 className="font-sans font-semibold text-lg text-zynq-dark">Bedrijven Beheren</h3>
          <p className="text-zynq-muted text-sm mt-1">Status, tarieven en abonnementen</p>
        </a>
        <a
          href={`/${locale}/admin/providers`}
          className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20 hover:border-zynq-green transition-colors"
        >
          <h3 className="font-sans font-semibold text-lg text-zynq-dark">Aanbieders Moderatie</h3>
          <p className="text-zynq-muted text-sm mt-1">Goedkeuren, afwijzen of opschorten</p>
        </a>
        <a
          href={`/${locale}/admin/offerings`}
          className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20 hover:border-zynq-green transition-colors"
        >
          <h3 className="font-sans font-semibold text-lg text-zynq-dark">Aanbod Controle</h3>
          <p className="text-zynq-muted text-sm mt-1">Kwaliteitscontrole en activatie</p>
        </a>
        <a
          href={`/${locale}/admin/settings`}
          className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20 hover:border-zynq-green transition-colors"
        >
          <h3 className="font-sans font-semibold text-lg text-zynq-dark">Platform Instellingen</h3>
          <p className="text-zynq-muted text-sm mt-1">Configuratie en beveiliging</p>
        </a>
      </div>

      {/* Privacy Notice */}
      <div className="bg-zynq-pale border border-zynq-mid/30 rounded-lg p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-zynq-green mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-sans font-medium text-zynq-green">Double-Blind Privacy</h3>
          <p className="text-sm text-zynq-dark font-serif mt-1">
            Als platformbeheerder heb je geen toegang tot individuele aankopen van werknemers.
            Alleen geaggregeerde data is zichtbaar.
          </p>
        </div>
      </div>
    </div>
  );
}
