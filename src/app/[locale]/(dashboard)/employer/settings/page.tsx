import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function EmployerSettingsPage() {
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect(`/${locale}/login`);

  const { data: contact } = await supabase
    .from('company_contacts')
    .select('*, companies(*)')
    .eq('email', user.email)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ct = contact as any;

  if (!ct) redirect(`/${locale}/employer/dashboard`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const company = ct.companies as any;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">
          Instellingen
        </h1>
        <p className="text-zynq-muted font-sans mt-1">
          Bedrijfsinstellingen beheren
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20 space-y-4">
        <h2 className="font-sans font-semibold text-lg text-zynq-dark">
          Bedrijfsinformatie
        </h2>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            Bedrijfsnaam
          </label>
          <input
            type="text"
            value={company?.name ?? ''}
            disabled
            className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans bg-zynq-pale text-zynq-muted"
          />
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            E-mail domein
          </label>
          <input
            type="text"
            value={company?.domain ?? ''}
            disabled
            className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans bg-zynq-pale text-zynq-muted"
          />
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            Maandelijks tarief per FTE
          </label>
          <input
            type="text"
            value={`€${company?.monthly_fee_per_fte ?? 25}`}
            disabled
            className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans bg-zynq-pale text-zynq-muted"
          />
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            Abonnement
          </label>
          <span className={`inline-block text-sm font-sans px-3 py-1 rounded ${
            company?.plan_tier === 'enterprise' ? 'bg-zynq-green/10 text-zynq-green' :
            company?.plan_tier === 'pro' ? 'bg-zynq-blue/10 text-zynq-blue' :
            'bg-zynq-mid/10 text-zynq-muted'
          }`}>
            {company?.plan_tier === 'enterprise' ? 'Enterprise' :
             company?.plan_tier === 'pro' ? 'Pro' :
             company?.plan_tier === 'starter' ? 'Starter' :
             company?.plan_tier ?? 'Free'}
          </span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20 space-y-4">
        <h2 className="font-sans font-semibold text-lg text-zynq-dark">
          Contactpersoon
        </h2>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            Naam
          </label>
          <input
            type="text"
            value={ct.name ?? ''}
            disabled
            className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans bg-zynq-pale text-zynq-muted"
          />
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            E-mail
          </label>
          <input
            type="email"
            value={ct.email ?? ''}
            disabled
            className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans bg-zynq-pale text-zynq-muted"
          />
        </div>
      </div>

      <div className="bg-zynq-pale border border-zynq-mid/30 rounded-lg p-4">
        <p className="text-sm text-zynq-dark font-sans">
          <strong>Let op:</strong> Wijzigingen in bedrijfsinstellingen kunnen worden aangevraagd door contact op te nemen met support@zynq.nl
        </p>
      </div>
    </div>
  );
}
