'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';

const categories = [
  { id: 'fitness', label: 'Fitness' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'coaching', label: 'Coaching' },
  { id: 'nutrition', label: 'Voeding' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'other', label: 'Anders' },
];

export default function RegisterProviderPage() {
  const locale = useLocale();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('fitness');
  const [contactEmail, setContactEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/provider/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, category, contactEmail, websiteUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Er ging iets mis');
      } else {
        setSuccess('Aanvraag succesvol ingediend! We nemen zo snel mogelijk contact op.');
      }
    } catch {
      setError('Netwerkfout. Probeer het opnieuw.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zynq-warm text-zynq-dark">
      <Header />

      <main className="pt-20 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-lg">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="font-sans font-bold text-3xl text-zynq-green text-center mb-2">
              Aanbieder Aanmelden
            </h1>
            <p className="text-center text-zynq-muted font-sans mb-6">
              Word partner van Zynq en bereik duizenden werknemers
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

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                    Bedrijfsnaam
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
                  <label htmlFor="description" className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                    Beschrijving
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium text-zynq-dark mb-2">
                    Categorie
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-2 border rounded text-center font-sans text-sm transition-colors ${
                          category === cat.id
                            ? 'border-zynq-green bg-zynq-pale text-zynq-green'
                            : 'border-zynq-mid hover:border-zynq-green'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                    Contact e-mail
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value.toLowerCase())}
                    required
                    className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
                  />
                </div>

                <div>
                  <label htmlFor="websiteUrl" className="block text-sm font-sans font-medium text-zynq-dark mb-1">
                    Website (optioneel)
                  </label>
                  <input
                    id="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
                  />
                </div>

                <Button type="submit" className="w-full font-sans" disabled={loading}>
                  {loading ? 'Bezig...' : 'Aanvraag Indienen'}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm font-sans text-zynq-muted">
              Terug naar{' '}
              <Link href={`/${locale}`} className="text-zynq-green hover:underline">
                Home
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
