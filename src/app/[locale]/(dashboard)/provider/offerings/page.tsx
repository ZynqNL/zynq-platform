import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProviderOfferingsPage() {
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
  if (!prov || prov.status !== 'approved') {
    redirect(`/${locale}/provider/dashboard`);
  }

  const { data: offerings } = await supabase
    .from('offerings')
    .select('*')
    .eq('provider_id', prov.id)
    .order('created_at', { ascending: false });

  const typeLabels: Record<string, string> = {
    subscription: 'Abonnement',
    one_time: 'Eenmalig',
    voucher: 'Voucher',
    package: 'Pakket',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-bold text-3xl text-zynq-green">
            Mijn Aanbod
          </h1>
          <p className="text-zynq-muted font-sans mt-1">
            Beheer je producten en diensten
          </p>
        </div>
        <Link
          href={`/${locale}/provider/offerings/new`}
          className="bg-zynq-green text-white font-sans font-bold px-4 py-2 rounded hover:bg-zynq-deep transition-colors"
        >
          + Nieuw Aanbod
        </Link>
      </div>

      {offerings && offerings.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-zynq-mid/20">
          <div className="divide-y divide-zynq-mid/10">
            {(offerings as Array<Record<string, string | number | null>>).map((off) => (
              <div key={off.id as string} className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-sans font-semibold text-lg text-zynq-dark">
                      {off.name}
                    </h3>
                    <span className={`text-xs font-sans px-2 py-1 rounded ${
                      off.status === 'active' ? 'bg-zynq-pale text-zynq-green' :
                      off.status === 'draft' ? 'bg-zynq-amber/10 text-zynq-amber' :
                      'bg-zynq-muted/10 text-zynq-muted'
                    }`}>
                      {off.status === 'active' ? 'Actief' :
                       off.status === 'draft' ? 'Concept' :
                       'Gearchiveerd'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zynq-muted font-sans">
                    <span>{off.category}</span>
                    <span>•</span>
                    <span>{typeLabels[off.type as string] ?? off.type}</span>
                    {off.duration_months && (
                      <>
                        <span>•</span>
                        <span>{off.duration_months} {off.duration_months === 1 ? 'maand' : 'maanden'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-zynq-muted font-serif mt-1 line-clamp-1">
                    {off.description}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-sans font-bold text-xl text-zynq-green">
                    €{off.price}
                  </p>
                  <Link
                    href={`/${locale}/provider/offerings/${off.id}/edit`}
                    className="text-sm text-zynq-green hover:underline font-sans mt-1 inline-block"
                  >
                    Bewerken
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-zynq-mid/20 text-center">
          <p className="text-zynq-muted font-sans mb-4">
            Nog geen aanbod. Voeg je eerste product of dienst toe.
          </p>
          <Link
            href={`/${locale}/provider/offerings/new`}
            className="inline-block bg-zynq-green text-white font-sans font-bold px-6 py-3 rounded hover:bg-zynq-deep transition-colors"
          >
            + Nieuw Aanbod Toevoegen
          </Link>
        </div>
      )}
    </div>
  );
}
