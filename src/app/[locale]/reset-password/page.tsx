'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const locale = useLocale();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we have a session (user clicked reset link)
    supabase.auth.getSession().then(({ data }: { data: { session: unknown } }) => {
      if (!data.session) {
        setError('Geen geldige reset sessie. Vraag een nieuwe reset link aan.');
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens zijn');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Wachtwoord succesvol gewijzigd!');
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zynq-warm text-zynq-dark">
      <Header />

      <main className="pt-20 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="font-sans font-bold text-3xl text-zynq-green text-center mb-2">
              Nieuw Wachtwoord
            </h1>
            <p className="text-center text-zynq-muted font-sans mb-6">
              Vul je nieuwe wachtwoord in.
            </p>

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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                  Nieuw Wachtwoord
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                  Bevestig Wachtwoord
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
                />
              </div>

              <Button type="submit" className="w-full font-sans" disabled={loading}>
                {loading ? 'Bezig...' : 'Wachtwoord Wijzigen'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm font-sans text-zynq-muted">
              Terug naar{' '}
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
