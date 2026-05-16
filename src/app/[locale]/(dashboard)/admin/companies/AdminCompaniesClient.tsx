'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Search, X, Check, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminCompaniesClient({
  initialCompanies,
}: {
  initialCompanies: Array<Record<string, unknown>>;
}) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editFee, setEditFee] = useState('');

  const filtered = companies.filter((co) => {
    const name = (co.name as string)?.toLowerCase() ?? '';
    const domain = (co.domain as string)?.toLowerCase() ?? '';
    return name.includes(search.toLowerCase()) || domain.includes(search.toLowerCase());
  });

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('companies').update({ status }).eq('id', id);
    setCompanies((prev) =>
      prev.map((co) => (co.id === id ? { ...co, status } : co))
    );
  };

  const updatePlan = async (id: string, plan_tier: string) => {
    await supabase.from('companies').update({ plan_tier }).eq('id', id);
    setCompanies((prev) =>
      prev.map((co) => (co.id === id ? { ...co, plan_tier } : co))
    );
  };

  const saveFee = async (id: string) => {
    const fee = parseFloat(editFee);
    if (isNaN(fee) || fee <= 0) return;

    await supabase.from('companies').update({ monthly_fee_per_fte: fee }).eq('id', id);
    setCompanies((prev) =>
      prev.map((co) => (co.id === id ? { ...co, monthly_fee_per_fte: fee } : co))
    );
    setEditing(null);
    setEditFee('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">Bedrijven</h1>
        <p className="text-zynq-muted font-sans mt-1">
          Status, tarieven en abonnementen beheren
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zynq-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op naam of domein..."
          className="w-full pl-10 pr-4 py-2 border border-zynq-mid/50 rounded font-sans"
        />
      </div>

      {/* Company List */}
      <div className="bg-white rounded-lg shadow-sm border border-zynq-mid/20">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-zynq-mid/20 bg-zynq-pale/50">
                <th className="text-left p-4 text-zynq-muted font-medium">Naam</th>
                <th className="text-left p-4 text-zynq-muted font-medium">Domein</th>
                <th className="text-left p-4 text-zynq-muted font-medium">Tarief/FTE</th>
                <th className="text-left p-4 text-zynq-muted font-medium">Abonnement</th>
                <th className="text-left p-4 text-zynq-muted font-medium">Status</th>
                <th className="text-left p-4 text-zynq-muted font-medium">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zynq-mid/10">
              {filtered.map((co) => (
                <tr key={co.id as string} className="hover:bg-zynq-pale/30">
                  <td className="p-4 font-medium text-zynq-dark">
                    {co.name as string}
                  </td>
                  <td className="p-4 text-zynq-muted">
                    {co.domain as string}
                  </td>
                  <td className="p-4">
                    {editing === co.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editFee}
                          onChange={(e) => setEditFee(e.target.value)}
                          className="w-20 px-2 py-1 border border-zynq-mid/50 rounded font-sans"
                        />
                        <Button size="sm" onClick={() => saveFee(co.id as string)} className="font-sans bg-zynq-green hover:bg-zynq-deep">
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditing(null)} className="font-sans">
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditing(co.id as string);
                          setEditFee(String(co.monthly_fee_per_fte ?? 25));
                        }}
                        className="text-zynq-dark font-sans hover:text-zynq-green"
                      >
                        €{(co.monthly_fee_per_fte as number) ?? 25}
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    <select
                      value={co.plan_tier as string}
                      onChange={(e) => updatePlan(co.id as string, e.target.value)}
                      className="px-2 py-1 rounded font-sans text-xs bg-zynq-pale border border-zynq-mid/30"
                    >
                      <option value="free">Free</option>
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block text-xs font-sans px-2 py-1 rounded ${
                      co.status === 'active' ? 'bg-zynq-pale text-zynq-green' :
                      co.status === 'suspended' ? 'bg-zynq-red/10 text-zynq-red' :
                      'bg-zynq-amber/10 text-zynq-amber'
                    }`}>
                      {co.status === 'active' ? 'Actief' :
                       co.status === 'suspended' ? 'Opgeschort' :
                       co.status === 'pending' ? 'In behandeling' :
                       co.status as string}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {(co.status as string) !== 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(co.id as string, 'active')}
                          className="font-sans text-zynq-green border-zynq-green/30"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Activeren
                        </Button>
                      )}
                      {(co.status as string) !== 'suspended' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(co.id as string, 'suspended')}
                          className="font-sans text-zynq-red border-zynq-red/30"
                        >
                          <Ban className="w-3 h-3 mr-1" />
                          Opschorten
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-zynq-muted font-sans">
            Geen bedrijven gevonden
          </div>
        )}
      </div>
    </div>
  );
}
