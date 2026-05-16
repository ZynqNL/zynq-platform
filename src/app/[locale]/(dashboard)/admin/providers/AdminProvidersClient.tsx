'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Search, Check, X, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminProvidersClient({
  initialProviders,
}: {
  initialProviders: Array<Record<string, unknown>>;
}) {
  const [providers, setProviders] = useState(initialProviders);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = providers.filter((prov) => {
    const name = (prov.name as string)?.toLowerCase() ?? '';
    const category = (prov.category as string)?.toLowerCase() ?? '';
    const status = prov.status as string;

    const matchesSearch = name.includes(search.toLowerCase()) || category.includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || status === filter;

    return matchesSearch && matchesFilter;
  });

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from('providers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">Aanbieders</h1>
        <p className="text-zynq-muted font-sans mt-1">
          Goedkeuren, afwijzen of opschorten
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zynq-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op naam of categorie..."
            className="w-full pl-10 pr-4 py-2 border border-zynq-mid/50 rounded font-sans"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected', 'suspended'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded font-sans text-sm ${
                filter === f
                  ? 'bg-zynq-green text-white'
                  : 'bg-white border border-zynq-mid/30 text-zynq-muted hover:border-zynq-green'
              }`}
            >
              {f === 'all' ? 'Alle' :
               f === 'pending' ? 'Wachtend' :
               f === 'approved' ? 'Goedgekeurd' :
               f === 'rejected' ? 'Afgewezen' :
               'Opgeschort'}
            </button>
          ))}
        </div>
      </div>

      {/* Provider List */}
      <div className="grid gap-4">
        {filtered.map((prov) => (
          <div key={prov.id as string} className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-sans font-semibold text-lg text-zynq-dark">
                    {prov.name as string}
                  </h3>
                  <span className={`text-xs font-sans px-2 py-1 rounded ${
                    prov.status === 'approved' ? 'bg-zynq-pale text-zynq-green' :
                    prov.status === 'pending' ? 'bg-zynq-amber/10 text-zynq-amber' :
                    prov.status === 'rejected' ? 'bg-zynq-red/10 text-zynq-red' :
                    'bg-zynq-mid/10 text-zynq-muted'
                  }`}>
                    {prov.status === 'approved' ? 'Goedgekeurd' :
                     prov.status === 'pending' ? 'In behandeling' :
                     prov.status === 'rejected' ? 'Afgewezen' :
                     prov.status === 'suspended' ? 'Opgeschort' :
                     prov.status as string}
                  </span>
                  {prov.onboarding_type === 'self_service' && (
                    <span className="text-xs font-sans px-2 py-1 rounded bg-zynq-blue/10 text-zynq-blue">
                      Self-Service
                    </span>
                  )}
                </div>
                {(prov.description as string) && (
                  <p className="text-zynq-muted font-sans mt-2">
                    {prov.description as string}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-zynq-muted font-sans mt-3">
                  <span className="capitalize">{prov.category as string}</span>
                  {(prov.contact_email as string) && (
                    <>
                      <span>•</span>
                      <span>{prov.contact_email as string}</span>
                    </>
                  )}
                  {(prov.website_url as string) && (
                    <>
                      <span>•</span>
                      <a
                        href={prov.website_url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zynq-green hover:underline"
                      >
                        Website
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              {(prov.status as string) === 'pending' && (
                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => updateStatus(prov.id as string, 'approved')}
                    className="font-sans bg-zynq-green hover:bg-zynq-deep"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Goedkeuren
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(prov.id as string, 'rejected')}
                    className="font-sans text-zynq-red border-zynq-red/30"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Afwijzen
                  </Button>
                </div>
              )}
              {(prov.status as string) === 'approved' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(prov.id as string, 'suspended')}
                  className="font-sans text-zynq-red border-zynq-red/30 ml-4"
                >
                  <Ban className="w-3 h-3 mr-1" />
                  Opschorten
                </Button>
              )}
              {(prov.status as string) === 'suspended' && (
                <Button
                  size="sm"
                  onClick={() => updateStatus(prov.id as string, 'approved')}
                  className="font-sans bg-zynq-green hover:bg-zynq-deep ml-4"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Heractiveren
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-zynq-mid/20 text-center">
          <p className="text-zynq-muted font-sans">
            Geen aanbieders gevonden
          </p>
        </div>
      )}
    </div>
  );
}
