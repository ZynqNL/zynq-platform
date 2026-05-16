import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 9;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; success?: string; page?: string }>;
}) {
  const t = await getTranslations('employee.marketplace');
  const locale = await getLocale();
  const supabase = await createClient();

  const params = await searchParams;
  const categoryFilter = params.category;
  const searchQuery = params.search;
  const showSuccess = params.success === 'true';
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10) || 1);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) redirect(`/${locale}/login`);

  // Get employee and budget
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  const emp = employee as Record<string, unknown> | null;
  if (!emp) redirect(`/${locale}/register/employee`);

  const { data: budget } = await supabase
    .from('employee_budgets')
    .select('*')
    .eq('employee_id', emp.id)
    .maybeSingle();

  const bgt = budget as Record<string, unknown> | null;
  const remainingBudget = bgt?.remaining_amount as number ?? 0;

  // Build query for count
  let countQuery = supabase
    .from('offerings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('providers.status', 'approved');

  if (categoryFilter && categoryFilter !== 'all') {
    countQuery = countQuery.eq('category', categoryFilter);
  }

  const { count: totalCount } = await countQuery;

  // Build query for paginated data
  let dataQuery = supabase
    .from('offerings')
    .select('*, providers(name, category, logo_url)')
    .eq('status', 'active')
    .eq('providers.status', 'approved')
    .order('created_at', { ascending: false })
    .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

  if (categoryFilter && categoryFilter !== 'all') {
    dataQuery = dataQuery.eq('category', categoryFilter);
  }

  const { data: offerings } = await dataQuery;

  const categories = [
    { id: 'all', label: t('categories.all') },
    { id: 'fitness', label: t('categories.fitness') },
    { id: 'mindfulness', label: t('categories.mindfulness') },
    { id: 'coaching', label: t('categories.coaching') },
    { id: 'nutrition', label: t('categories.nutrition') },
    { id: 'wellness', label: 'Wellness' },
  ];

  // Client-side search filter (on current page)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredOfferings = (offerings as any[] | null)?.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.name?.toLowerCase().includes(q) ||
      o.description?.toLowerCase().includes(q) ||
      o.providers?.name?.toLowerCase().includes(q)
    );
  }) ?? [];

  const total = totalCount ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildPageUrl = (page: number) => {
    const urlParams = new URLSearchParams();
    if (page > 1) urlParams.set('page', String(page));
    if (categoryFilter && categoryFilter !== 'all') urlParams.set('category', categoryFilter);
    if (searchQuery) urlParams.set('search', searchQuery);
    return `/${locale}/employee/marketplace${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-bold text-3xl text-zynq-green">
            {t('title')}
          </h1>
          <p className="text-zynq-muted font-sans mt-1">
            Budget: €{remainingBudget} beschikbaar
          </p>
        </div>
        {total > 0 && (
          <p className="text-sm text-zynq-muted font-sans">
            {total} aanbod
          </p>
        )}
      </div>

      {/* Search */}
      {showSuccess && (
        <div className="p-4 bg-zynq-green/10 text-zynq-green rounded-lg font-sans">
          Bestelling succesvol! Je budget is bijgewerkt.
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zynq-muted" />
        <form>
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder={t('search')}
            className="w-full pl-10 pr-4 py-3 border border-zynq-mid rounded-lg font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
          />
          {categoryFilter && categoryFilter !== 'all' && (
            <input type="hidden" name="category" value={categoryFilter} />
          )}
        </form>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const isActive = categoryFilter === cat.id || (!categoryFilter && cat.id === 'all');
          return (
            <Link
              key={cat.id}
              href={`/${locale}/employee/marketplace?category=${cat.id}${searchQuery ? `&search=${searchQuery}` : ''}`}
              className={`px-4 py-2 rounded-full font-sans text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-zynq-green text-white'
                  : 'bg-white border border-zynq-mid text-zynq-dark hover:border-zynq-green hover:text-zynq-green'
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Offerings Grid */}
      {filteredOfferings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOfferings.map((offering) => {
              const canAfford = remainingBudget >= offering.price;
              return (
                <Link
                  key={offering.id}
                  href={`/${locale}/employee/marketplace/${offering.id}`}
                  className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
                    canAfford
                      ? 'border-zynq-mid/20 hover:border-zynq-green'
                      : 'border-zynq-mid/10 opacity-60'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs font-sans text-zynq-green uppercase tracking-wider">
                          {offering.category}
                        </span>
                        <h3 className="font-sans font-semibold text-lg text-zynq-dark mt-1">
                          {offering.name}
                        </h3>
                      </div>
                      <span className="text-xl font-sans font-bold text-zynq-green">
                        €{offering.price}
                      </span>
                    </div>
                    <p className="text-sm text-zynq-muted font-serif line-clamp-2 mb-4">
                      {offering.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-zynq-muted font-sans">
                        {offering.providers?.name}
                      </p>
                      {!canAfford && (
                        <span className="text-xs font-sans text-zynq-red">
                          {t('insufficientBudget')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={buildPageUrl(currentPage - 1)}
                  className="flex items-center gap-1 px-3 py-2 border border-zynq-mid/30 rounded font-sans text-sm text-zynq-dark hover:border-zynq-green hover:text-zynq-green transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Vorige
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={buildPageUrl(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded font-sans text-sm transition-colors ${
                    page === currentPage
                      ? 'bg-zynq-green text-white'
                      : 'text-zynq-dark hover:bg-zynq-pale'
                  }`}
                >
                  {page}
                </Link>
              ))}
              {currentPage < totalPages && (
                <Link
                  href={buildPageUrl(currentPage + 1)}
                  className="flex items-center gap-1 px-3 py-2 border border-zynq-mid/30 rounded font-sans text-sm text-zynq-dark hover:border-zynq-green hover:text-zynq-green transition-colors"
                >
                  Volgende
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-zynq-mid/20 text-center">
          <p className="text-zynq-muted font-sans">
            {searchQuery ? 'Geen resultaten gevonden' : 'Nog geen aanbod beschikbaar'}
          </p>
        </div>
      )}
    </div>
  );
}
