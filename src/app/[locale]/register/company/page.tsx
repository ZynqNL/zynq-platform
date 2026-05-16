'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';

const plans = [
  { id: 'starter', name: 'Starter', price: '€25' },
  { id: 'professional', name: 'Professional', price: '€50' },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom' },
];

export default function RegisterCompanyPage() {
  const t = useTranslations('auth.register.company');
  const locale = useLocale();
  const [companyName, setCompanyName] = useState('');
  const [domain, setDomain] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [plan, setPlan] = useState('starter');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // TODO: Implement actual registration with Supabase
    // For now, just show a success message
    alert(`Bedrijf "${companyName}" aangemeld! (Demo)`);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zynq-warm text-zynq-dark">
      <Header />

      <main className="pt-20 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="font-sans font-bold text-3xl text-zynq-green text-center mb-6">
              {t('title')}
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-zynq-red/10 text-zynq-red rounded text-sm font-sans">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                  {t('companyName')}
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
                />
              </div>

              <div>
                <label htmlFor="domain" className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                  {t('domain')}
                </label>
                <input
                  id="domain"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value.toLowerCase())}
                  placeholder="bijv. zynq.nl"
                  required
                  className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
                />
                <p className="mt-1 text-xs text-zynq-muted font-sans">{t('domainHint')}</p>
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                  {t('contactEmail')}
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
                />
              </div>

              <div>
                <label className="block text-sm font-sans font-medium text-zynq-dark mb-2">
                  {t('plan')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlan(p.id)}
                      className={`p-3 border rounded text-center font-sans transition-colors ${
                        plan === p.id
                          ? 'border-zynq-green bg-zynq-pale text-zynq-green'
                          : 'border-zynq-mid hover:border-zynq-green'
                      }`}
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-zynq-muted">{p.price}/maand</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full font-sans" disabled={loading}>
                {loading ? 'Bezig...' : t('submit')}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm font-sans text-zynq-muted">
              Al een account?{' '}
              <Link href={`/${locale}/login`} className="text-zynq-green hover:underline">
                Inloggen
              </Link>
            </p>

            <p className="mt-2 text-center text-sm font-sans">
              Werknemer?{' '}
              <Link href={`/${locale}/register/employee`} className="text-zynq-green hover:underline">
                Registreer hier
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
