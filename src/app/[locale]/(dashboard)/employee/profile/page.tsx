'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

const locales = [
  { code: 'nl', label: 'Nederlands' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
];

export default function EmployeeProfilePage() {
  const locale = useLocale();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [fteScore, setFteScore] = useState(1.0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      if (!user?.email) return;

      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const emp = employee as any;
      if (emp) {
        setName(emp.name ?? '');
        setSelectedLocale(emp.locale ?? locale);
        setFteScore(emp.fte_score ?? 1.0);
      }
    }
    loadProfile();
  }, [user, locale]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    if (!user?.email) {
      setError('Gebruiker niet gevonden');
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('employees')
      .update({
        name,
        locale: selectedLocale,
      })
      .eq('email', user.email);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Profiel succesvol bijgewerkt');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">
          Profiel
        </h1>
        <p className="text-zynq-muted font-sans mt-1">
          Beheer je persoonlijke instellingen
        </p>
      </div>

      {error && (
        <div className="p-3 bg-zynq-red/10 text-zynq-red rounded text-sm font-sans">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-zynq-green/10 text-zynq-green rounded text-sm font-sans">
          {success}
        </div>
      )}

      {/* Personal Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20 space-y-4">
        <h2 className="font-sans font-semibold text-lg text-zynq-dark">
          Persoonlijke Informatie
        </h2>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            Naam
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
          />
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            E-mailadres
          </label>
          <input
            type="email"
            value={user?.email ?? ''}
            disabled
            className="w-full px-3 py-2 border border-zynq-mid/50 rounded font-sans bg-zynq-pale text-zynq-muted"
          />
          <p className="text-xs text-zynq-muted font-sans mt-1">
            E-mailadres kan niet worden gewijzigd
          </p>
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            FTE Score
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={fteScore}
              disabled
              min={0}
              max={1}
              step={0.1}
              className="w-24 px-3 py-2 border border-zynq-mid/50 rounded font-sans bg-zynq-pale text-zynq-muted"
            />
            <p className="text-xs text-zynq-muted font-sans">
              Ingesteld door je werkgever
            </p>
          </div>
        </div>
      </div>

      {/* Language Preference */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20 space-y-4">
        <h2 className="font-sans font-semibold text-lg text-zynq-dark">
          Taalvoorkeur
        </h2>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-2">
            Interface Taal
          </label>
          <div className="grid grid-cols-2 gap-2">
            {locales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => setSelectedLocale(loc.code)}
                className={`p-3 border rounded text-left font-sans transition-colors ${
                  selectedLocale === loc.code
                    ? 'border-zynq-green bg-zynq-pale text-zynq-green'
                    : 'border-zynq-mid hover:border-zynq-green'
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="font-sans"
      >
        {saving ? 'Opslaan...' : 'Wijzigingen Opslaan'}
      </Button>
    </div>
  );
}
