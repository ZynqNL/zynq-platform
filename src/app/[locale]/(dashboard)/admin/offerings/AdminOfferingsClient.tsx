'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Search, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminOfferingsClient({
  initialOfferings,
}: {
  initialOfferings: Array<Record<string, unknown>>;
}) {
  const [offerings, setOfferings] = useState(initialOfferings);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = offerings.filter((off) => {
    const name = (off.name as string)?.toLowerCase() ?? '';
    const category = (off.category as string)?.toLowerCase() ?? '';
    const status = off.status as string;
    const provider = (off.providers as Record<string, string> | null)?.name?.toLowerCase() ?? '';

    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      category.includes(search.toLowerCase()) ||
      provider.includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || status === filter;

    return matchesSearch && matchesFilter;
  });

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from('offerings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    setOfferings((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">Aanbod</h1>
        <p className="text-zynq-muted font-sans mt-1">
          Kwaliteitscontrole en activatie
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
            placeholder="Zoek op naam, categorie of aanbieder..."
            className="w-full pl-10 pr-4 py-2 border border-zynq-mid/50 rounded font-sans"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'draft', 'active', 'archived'].map((f) => (
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
               f === 'draft' ? 'Concept' :
               f === 'active' ? 'Actief' :
               'Gearchiveerd'}
            </button>
          ))}
        </div>
      </div>

      {/* Offering List */}
      <div className="grid gap-4">
        {filtered.map((off) => {
          const provider = off.providers as Record<string, string> | null;

          return (
            <div key={off.id as string} className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-sans font-semibold text-lg text-zynq-dark">
                      {off.name as string}
                    </h3>
                    <span className={`text-xs font-sans px-2 py-1 rounded ${
                      off.status === 'active' ? 'bg-zynq-pale text-zynq-green' :
                      off.status === 'draft' ? 'bg-zynq-amber/10 text-zynq-amber' :
                      'bg-zynq-mid/10 text-zynq-muted'
                    }`}>
                      {off.status === 'active' ? 'Actief' :
                       off.status === 'draft' ? 'Concept' :
                       'Gearchiveerd'}
                    </span>
                    <span className="text-xs font-sans px-2 py-1 rounded bg-zynq-blue/10 text-zynq-blue capitalize">
                      {off.category as string}
                    </span>
                    <span className="text-xs font-sans px-2 py-1 rounded bg-zynq-pale text-zynq-dark capitalize">
                      {off.type as string}
                    </span>
                  </div>
                  {(off.description as string) && (
                    <p className="text-zynq-muted font-sans mt-2">
                      {off.description as string}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-zynq-muted font-sans mt-3">
                    <span className="font-bold text-zynq-green text-lg">
                      €{off.price as number}
                    </span>
                    <span>•</span>
                    <span>{provider?.name ?? 'Onbekend'}</span>
                    {(off.duration_months as number) && (
                      <>
                        <span>•</span>
                        <span>{off.duration_months as number} maanden</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  {(off.status as string) === 'draft' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateStatus(off.id as string, 'active')}
                        className="font-sans bg-zynq-green hover:bg-zynq-deep"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Activeren
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(off.id as string, 'archived')}
                        className="font-sans text-zynq-red border-zynq-red/30"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Archiveren
                      </Button>
                    </>
                  )}
                  {(off.status as string) === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(off.id as string, 'archived')}
                      className="font-sans text-zynq-red border-zynq-red/30"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Archiveren
                    </Button>
                  )}
                  {(off.status as string) === 'archived' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(off.id as string, 'active')}
                      className="font-sans bg-zynq-green hover:bg-zynq-deep"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Heractiveren
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-zynq-mid/20 text-center">
          <p className="text-zynq-muted font-sans">
            Geen aanbod gevonden
          </p>
        </div>
      )}
    </div>
  );
}
