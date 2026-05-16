'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/employee/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      window.location.href = `/${locale}/employee/dashboard`;
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

            {magicLinkSent ? (
              <div className="text-center">
                <p className="text-zynq-green font-sans mb-4">
                  Magic link verzonden! Check je e-mail.
                </p>
                <Button
                  variant="ghost"
                  onClick={() => setMagicLinkSent(false)}
                  className="font-sans"
                >
                  Terug
                </Button>
              </div>
            ) : (
              <>
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                      {t('email')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full font-sans"
                    disabled={loading}
                  >
                    {loading ? 'Bezig...' : t('magicLink')}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zynq-mid/30"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-zynq-muted font-sans">of</span>
                  </div>
                </div>

                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                      {t('password')}
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full font-sans"
                    disabled={loading}
                  >
                    {loading ? 'Bezig...' : t('submit')}
                  </Button>
                </form>
              </>
            )}

            <p className="mt-6 text-center text-sm font-sans text-zynq-muted">
              {t('noAccount')}{' '}
              <Link href={`/${locale}/register/company`} className="text-zynq-green hover:underline">
                {t('register')}
              </Link>
            </p>

            <p className="mt-2 text-center text-sm font-sans">
              <Link href={`/${locale}/forgot-password`} className="text-zynq-muted hover:text-zynq-green transition-colors">
                Wachtwoord vergeten?
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
