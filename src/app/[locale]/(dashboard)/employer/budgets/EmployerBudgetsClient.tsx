'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Plus, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmployerBudgetsClient({
  period,
  employeeBudgets,
}: {
  period: Record<string, unknown> | null;
  employeeBudgets: Array<Record<string, unknown>>;
}) {
  const [bonuses, setBonuses] = useState<Record<string, number>>({});
  const [bulkBonus, setBulkBonus] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const applyBulkBonus = () => {
    const amount = parseFloat(bulkBonus);
    if (isNaN(amount) || amount <= 0) return;

    const updated: Record<string, number> = {};
    employeeBudgets.forEach((eb) => {
      updated[eb.id as string] = amount;
    });
    setBonuses(updated);
  };

  const setIndividualBonus = (id: string, amount: number) => {
    setBonuses((prev) => ({ ...prev, [id]: amount }));
  };

  const allocateBonuses = async () => {
    if (!period) return;
    setProcessing(true);

    const entries = Object.entries(bonuses).filter(([, amount]) => amount > 0);

    for (const [budgetId, amount] of entries) {
      // Update the employee_budgets bonus_amount and total_amount
      const eb = employeeBudgets.find((e) => e.id === budgetId);
      if (!eb) continue;

      const currentTotal = (eb.total_amount as number) ?? 0;
      const currentBonus = (eb.bonus_amount as number) ?? 0;
      const newBonus = currentBonus + amount;
      const newTotal = currentTotal + amount;
      const remaining = (eb.remaining_amount as number) ?? 0;

      await supabase
        .from('employee_budgets')
        .update({
          bonus_amount: newBonus,
          total_amount: newTotal,
          remaining_amount: remaining + amount,
        })
        .eq('id', budgetId);

      // Record budget transaction
      await supabase.from('budget_transactions').insert({
        employee_budget_id: budgetId,
        type: 'bonus',
        amount,
        description: `Bonus toegevoegd door werkgever`,
      });
    }

    setProcessing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setBonuses({});
    setBulkBonus('');
  };

  if (!period) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-sans font-bold text-3xl text-zynq-green">Budgetten</h1>
          <p className="text-zynq-muted font-sans mt-1">
            Bonus budget toewijzen
          </p>
        </div>
        <div className="bg-white p-12 rounded-lg shadow-sm border border-zynq-mid/20 text-center">
          <p className="text-zynq-muted font-sans">
            Geen open budget periode. Budgetten worden automatisch aangemaakt aan het begin van elke maand.
          </p>
        </div>
      </div>
    );
  }

  const periodStart = period.period_start as string;
  const periodEnd = period.period_end as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">Budgetten</h1>
        <p className="text-zynq-muted font-sans mt-1">
          Bonus budget toewijzen voor periode{' '}
          {new Date(periodStart).toLocaleDateString('nl-NL')} -{' '}
          {new Date(periodEnd).toLocaleDateString('nl-NL')}
        </p>
      </div>

      {success && (
        <div className="bg-zynq-pale border border-zynq-green/30 rounded-lg p-4 text-zynq-green font-sans">
          Bonus succesvol toegewezen!
        </div>
      )}

      {/* Bulk Bonus */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20">
        <h2 className="font-sans font-semibold text-lg text-zynq-dark mb-4">
          Bulk Bonus
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-sans text-zynq-muted mb-1">
              Bedrag per werknemer (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={bulkBonus}
              onChange={(e) => setBulkBonus(e.target.value)}
              className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans"
              placeholder="50.00"
            />
          </div>
          <Button
            onClick={applyBulkBonus}
            variant="outline"
            className="font-sans mt-6"
          >
            Toepassen
          </Button>
        </div>
        {Object.keys(bonuses).length > 0 && (
          <p className="text-sm text-zynq-green font-sans mt-3">
            €{bulkBonus} bonus ingesteld voor {Object.keys(bonuses).length} werknemers
            (totaal: €{(parseFloat(bulkBonus) * Object.keys(bonuses).length).toFixed(2)})
          </p>
        )}
      </div>

      {/* Individual Bonuses */}
      <div className="bg-white rounded-lg shadow-sm border border-zynq-mid/20">
        <div className="p-6 border-b border-zynq-mid/20">
          <h2 className="font-sans font-semibold text-lg text-zynq-dark">
            Individuele Bonussen
          </h2>
        </div>
        <div className="divide-y divide-zynq-mid/10">
          {employeeBudgets.map((eb) => {
            const emp = eb.employees as Record<string, string> | null;
            const budgetId = eb.id as string;
            const currentBonus = (eb.bonus_amount as number) ?? 0;
            const bonus = bonuses[budgetId] ?? 0;

            return (
              <div key={budgetId} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-sans font-medium text-zynq-dark">
                    {emp?.name ?? 'Onbekend'}
                  </p>
                  <p className="text-sm text-zynq-muted font-sans">
                    Huidige bonus: €{currentBonus.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-zynq-muted" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={bonus || ''}
                    onChange={(e) =>
                      setIndividualBonus(budgetId, parseFloat(e.target.value) || 0)
                    }
                    className="w-24 px-2 py-1 border border-zynq-mid/50 rounded font-sans text-right"
                    placeholder="0.00"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          onClick={allocateBonuses}
          disabled={processing || Object.values(bonuses).every((v) => v === 0)}
          className="font-sans bg-zynq-green hover:bg-zynq-deep"
        >
          <Plus className="w-4 h-4 mr-2" />
          {processing ? 'Verwerken...' : 'Bonussen Toewijzen'}
        </Button>
      </div>
    </div>
  );
}
