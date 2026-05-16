import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function OfferingDetailPage({
  params,
}: {
  params: Promise<{ offeringId: string }>;
}) {
  const locale = await getLocale();
  const supabase = await createClient();
  const { offeringId } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect(`/${locale}/login`);

  // Get employee and budget
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emp = employee as any;
  if (!emp) redirect(`/${locale}/register/employee`);

  const { data: budget } = await supabase
    .from('employee_budgets')
    .select('*')
    .eq('employee_id', emp.id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bgt = budget as any;
  const remainingBudget = bgt?.remaining_amount ?? 0;

  // Get offering with provider
  const { data: offering } = await supabase
    .from('offerings')
    .select('*, providers(name, description, website_url)')
    .eq('id', offeringId)
    .eq('status', 'active')
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const off = offering as any;
  if (!off) redirect(`/${locale}/employee/marketplace`);

  const canAfford = remainingBudget >= off.price;
  const remainingAfterPurchase = remainingBudget - off.price;

  const typeLabels: Record<string, string> = {
    subscription: 'Abonnement',
    one_time: 'Eenmalig',
    voucher: 'Voucher',
    package: 'Pakket',
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href={`/${locale}/employee/marketplace`}
        className="inline-flex items-center gap-2 text-zynq-muted hover:text-zynq-green transition-colors font-sans"
      >
        <ArrowLeft className="w-4 h-4" />
        Terug naar Marketplace
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-zynq-mid/20">
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="text-xs font-sans text-zynq-green uppercase tracking-wider">
                {off.category} — {typeLabels[off.type] ?? off.type}
              </span>
              <h1 className="font-sans font-bold text-3xl text-zynq-dark mt-2">
                {off.name}
              </h1>
            </div>
            <span className="text-3xl font-sans font-bold text-zynq-green">
              €{off.price}
            </span>
          </div>

          <div className="prose prose-sm max-w-none mb-8">
            <p className="text-zynq-dark font-serif leading-relaxed">
              {off.description}
            </p>
          </div>

          {off.duration_months && (
            <div className="mb-6 p-4 bg-zynq-pale rounded-lg">
              <p className="text-sm font-sans text-zynq-dark">
                <strong>Duur:</strong> {off.duration_months} {off.duration_months === 1 ? 'maand' : 'maanden'}
              </p>
            </div>
          )}

          {/* Provider Info */}
          <div className="mb-8 p-4 border border-zynq-mid/20 rounded-lg">
            <h3 className="font-sans font-semibold text-zynq-dark mb-2">
              Aanbieder
            </h3>
            <p className="text-zynq-dark font-sans font-medium">
              {off.providers?.name}
            </p>
            {off.providers?.description && (
              <p className="text-sm text-zynq-muted font-serif mt-1">
                {off.providers.description}
              </p>
            )}
          </div>

          {/* Budget Info */}
          <div className="mb-8 p-4 bg-zynq-pale rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-sans text-zynq-dark">
                Huidig budget
              </span>
              <span className="font-sans font-bold text-zynq-green">
                €{remainingBudget}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-zynq-dark">
                Na aankoop
              </span>
              <span className={`font-sans font-bold ${
                canAfford ? 'text-zynq-green' : 'text-zynq-red'
              }`}>
                €{remainingAfterPurchase}
              </span>
            </div>
          </div>

          {/* Purchase Button */}
          {canAfford ? (
            <form action={`/${locale}/employee/marketplace/${offeringId}/purchase`} method="POST">
              <button
                type="submit"
                className="w-full bg-zynq-green text-white font-sans font-bold px-8 py-4 rounded hover:bg-zynq-deep transition-colors text-lg"
              >
                Kopen met Budget (€{off.price})
              </button>
            </form>
          ) : (
            <div className="p-4 bg-zynq-red/10 text-zynq-red rounded text-center font-sans">
              Onvoldoende budget. Je hebt €{remainingBudget} nodig maar hebt €{off.price} nodig.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
