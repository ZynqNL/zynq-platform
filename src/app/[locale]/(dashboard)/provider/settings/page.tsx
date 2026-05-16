import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProviderSettingsPage() {
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect(`/${locale}/login`);

  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('contact_email', user.email)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prov = provider as any;
  if (!prov) redirect(`/${locale}/register/provider`);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">
          Instellingen
        </h1>
        <p className="text-zynq-muted font-sans mt-1">
          Beheer je provider profiel
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20 space-y-4">
        <h2 className="font-sans font-semibold text-lg text-zynq-dark">
          Bedrijfsinformatie
        </h2>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            Naam
          </label>
          <input
            type="text"
            value={prov.name ?? ''}
            disabled
            className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans bg-zynq-pale text-zynq-muted"
          />
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            Beschrijving
          </label>
          <textarea
            value={prov.description ?? ''}
            disabled
            rows={3}
            className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans bg-zynq-pale text-zynq-muted"
          />
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            Categorie
          </label>
          <input
            type="text"
            value={prov.category ?? ''}
            disabled
            className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans bg-zynq-pale text-zynq-muted capitalize"
          />
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            Contact e-mail
          </label>
          <input
            type="email"
            value={prov.contact_email ?? ''}
            disabled
            className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans bg-zynq-pale text-zynq-muted"
          />
        </div>

        {prov.website_url && (
          <div>
            <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
              Website
            </label>
            <input
              type="url"
              value={prov.website_url}
              disabled
              className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans bg-zynq-pale text-zynq-muted"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            Status
          </label>
          <span className={`inline-block text-sm font-sans px-3 py-1 rounded ${
            prov.status === 'approved' ? 'bg-zynq-pale text-zynq-green' :
            prov.status === 'pending' ? 'bg-zynq-amber/10 text-zynq-amber' :
            'bg-zynq-red/10 text-zynq-red'
          }`}>
            {prov.status === 'approved' ? 'Goedgekeurd' :
             prov.status === 'pending' ? 'In behandeling' :
             prov.status === 'rejected' ? 'Afgewezen' :
             prov.status}
          </span>
        </div>
      </div>

      <div className="bg-zynq-pale border border-zynq-mid/30 rounded-lg p-4">
        <p className="text-sm text-zynq-dark font-sans">
          <strong>Let op:</strong> Wijzigingen in je profiel kunnen worden aangevraagd door contact op te nemen met support@zynq.nl
        </p>
      </div>
    </div>
  );
}
