import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminSettingsPage() {
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

  // Platform stats
  const { count: totalCompanies } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true });

  const { count: totalEmployees } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true });

  const { count: totalProviders } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true });

  const { count: totalOfferings } = await supabase
    .from('offerings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">
          Platform Instellingen
        </h1>
        <p className="text-zynq-muted font-sans mt-1">
          Configuratie en platform statistieken
        </p>
      </div>

      {/* Platform Stats */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
        <h2 className="font-sans font-semibold text-lg text-zynq-dark mb-4">
          Platform Statistieken
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-zynq-pale p-4 rounded">
            <p className="text-sm font-sans text-zynq-muted">Bedrijven</p>
            <p className="text-2xl font-sans font-bold text-zynq-green">
              {totalCompanies ?? 0}
            </p>
          </div>
          <div className="bg-zynq-pale p-4 rounded">
            <p className="text-sm font-sans text-zynq-muted">Werknemers</p>
            <p className="text-2xl font-sans font-bold text-zynq-green">
              {totalEmployees ?? 0}
            </p>
          </div>
          <div className="bg-zynq-pale p-4 rounded">
            <p className="text-sm font-sans text-zynq-muted">Aanbieders</p>
            <p className="text-2xl font-sans font-bold text-zynq-green">
              {totalProviders ?? 0}
            </p>
          </div>
          <div className="bg-zynq-pale p-4 rounded">
            <p className="text-sm font-sans text-zynq-muted">Actief Aanbod</p>
            <p className="text-2xl font-sans font-bold text-zynq-green">
              {totalOfferings ?? 0}
            </p>
          </div>
          <div className="bg-zynq-pale p-4 rounded">
            <p className="text-sm font-sans text-zynq-muted">Bestellingen</p>
            <p className="text-2xl font-sans font-bold text-zynq-green">
              {totalOrders ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Platform Configuration */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20 space-y-4">
        <h2 className="font-sans font-semibold text-lg text-zynq-dark">
          Platform Configuratie
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
              Standaard tarief per FTE (€)
            </label>
            <input
              type="text"
              value="25.00"
              disabled
              className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans bg-zynq-pale text-zynq-muted"
            />
          </div>
          <div>
            <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
              Standaard taal
            </label>
            <input
              type="text"
              value="Nederlands (nl)"
              disabled
              className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans bg-zynq-pale text-zynq-muted"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            Ondersteunde talen
          </label>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-zynq-pale rounded font-sans text-sm text-zynq-dark">
              Nederlands
            </span>
            <span className="px-3 py-1 bg-zynq-pale rounded font-sans text-sm text-zynq-dark">
              English
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            Maandelijkse facturatie cron
          </label>
          <span className="inline-block text-sm font-sans px-3 py-1 rounded bg-zynq-pale text-zynq-green">
            /api/cron/monthly-billing (actief)
          </span>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20 space-y-4">
        <h2 className="font-sans font-semibold text-lg text-zynq-dark">
          Beveiliging
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-zynq-pale rounded">
            <div>
              <p className="font-sans font-medium text-zynq-dark">Double-Blind RLS</p>
              <p className="text-sm text-zynq-muted font-sans">
                Werkgevers hebben geen toegang tot individuele bestellingen
              </p>
            </div>
            <span className="text-zynq-green font-sans font-bold">✓ Actief</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-zynq-pale rounded">
            <div>
              <p className="font-sans font-medium text-zynq-dark">E-mail domein matching</p>
              <p className="text-sm text-zynq-muted font-sans">
                Werknemers kunnen alleen bij hun bedrijf aansluiten
              </p>
            </div>
            <span className="text-zynq-green font-sans font-bold">✓ Actief</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-zynq-pale rounded">
            <div>
              <p className="font-sans font-medium text-zynq-dark">Cron bescherming</p>
              <p className="text-sm text-zynq-muted font-sans">
                Maandelijkse facturatie vereist CRON_SECRET
              </p>
            </div>
            <span className="text-zynq-green font-sans font-bold">✓ Actief</span>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-zynq-pale border border-zynq-mid/30 rounded-lg p-4">
        <p className="text-sm text-zynq-dark font-sans">
          <strong>Platform beheer:</strong> Voor wijzigingen in platformconfiguratie of ondersteuning, neem contact op met support@zynq.nl
        </p>
      </div>
    </div>
  );
}
