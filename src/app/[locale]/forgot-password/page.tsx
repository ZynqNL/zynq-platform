'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Reset link verzonden! Check je e-mail.');
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
              Wachtwoord Vergeten
            </h1>
            <p className="text-center text-zynq-muted font-sans mb-6">
              Vul je e-mailadres in en we sturen je een reset link.
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
                <label htmlFor="email" className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                  E-mailadres
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

              <Button type="submit" className="w-full font-sans" disabled={loading}>
                {loading ? 'Bezig...' : 'Reset Link Versturen'}
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
