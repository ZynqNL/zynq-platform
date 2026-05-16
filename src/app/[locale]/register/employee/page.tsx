'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

export default function RegisterEmployeePage() {
  const t = useTranslations('auth.register.employee');
  const locale = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [noCompany, setNoCompany] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setNoCompany(false);

    const domain = email.split('@')[1];
    if (!domain) {
      setError('Ongeldig e-mailadres');
      setLoading(false);
      return;
    }

    // Check if company exists with this domain
    const { data: company } = await supabase
      .from('companies')
      .select('id, name')
      .eq('domain', domain)
      .eq('status', 'active')
      .maybeSingle();

    if (!company) {
      setNoCompany(true);
      setLoading(false);
      return;
    }

    // Create employee record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comp = company as any;
    const { error: insertError } = await supabase
      .from('employees')
      .insert({
        company_id: comp.id,
        email,
        name,
        locale,
        status: 'active',
      });

    if (insertError) {
      if (insertError.code === '23505') {
        setError('Dit e-mailadres is al geregistreerd');
      } else {
        setError(insertError.message);
      }
      setLoading(false);
      return;
    }

    // Send magic link
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/employee/dashboard`,
        data: { name, company_id: company.id },
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess('Registratie gelukt! Check je e-mail om in te loggen.');
    }
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

            {success && (
              <div className="mb-4 p-3 bg-zynq-green/10 text-zynq-green rounded text-sm font-sans">
                {success}
              </div>
            )}

            {noCompany ? (
              <div className="text-center">
                <div className="p-4 bg-zynq-amber/10 text-zynq-amber rounded mb-4 font-sans">
                  <p className="font-medium">{t('noCompany')}</p>
                </div>
                <p className="text-zynq-muted font-sans mb-4">
                  {t('requestCompany')}
                </p>
                <Link href={`/${locale}/register/company`}>
                  <Button className="font-sans">
                    Bedrijf Aanmelden
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                    {t('name')}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                    {t('email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    required
                    className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
                  />
                </div>

                <Button type="submit" className="w-full font-sans" disabled={loading}>
                  {loading ? 'Bezig...' : t('submit')}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm font-sans text-zynq-muted">
              Al een account?{' '}
              <Link href={`/${locale}/login`} className="text-zynq-green hover:underline">
                Inloggen
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
