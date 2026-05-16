'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const categories = [
  { id: 'fitness', label: 'Fitness' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'coaching', label: 'Coaching' },
  { id: 'nutrition', label: 'Voeding' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'other', label: 'Anders' },
];

const types = [
  { id: 'one_time', label: 'Eenmalig' },
  { id: 'subscription', label: 'Abonnement' },
  { id: 'voucher', label: 'Voucher' },
  { id: 'package', label: 'Pakket' },
];

export default function NewOfferingPage() {
  const locale = useLocale();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('fitness');
  const [type, setType] = useState('one_time');
  const [durationMonths, setDurationMonths] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/provider/offerings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          category,
          type,
          duration_months: durationMonths ? parseInt(durationMonths) : null,
          image_url: imageUrl || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Er ging iets mis');
      } else {
        router.push(`/${locale}/provider/offerings`);
      }
    } catch {
      setError('Netwerkfout. Probeer het opnieuw.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href={`/${locale}/provider/offerings`}
        className="inline-flex items-center gap-2 text-zynq-muted hover:text-zynq-green transition-colors font-sans"
      >
        <ArrowLeft className="w-4 h-4" />
        Terug naar Aanbod
      </Link>

      <div>
        <h1 className="font-sans font-bold text-3xl text-zynq-green">
          Nieuw Aanbod
        </h1>
        <p className="text-zynq-muted font-sans mt-1">
          Voeg een nieuw product of dienst toe
        </p>
      </div>

      {error && (
        <div className="p-3 bg-zynq-red/10 text-zynq-red rounded text-sm font-sans">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-zynq-mid/20 space-y-4">
        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            Naam
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
          />
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            Beschrijving
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
              Prijs (€)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min={0}
              step={0.01}
              className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
            />
          </div>

          <div>
            <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
              Duur (maanden, optioneel)
            </label>
            <input
              type="number"
              value={durationMonths}
              onChange={(e) => setDurationMonths(e.target.value)}
              min={1}
              className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
            />
          </div>
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
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-2">
            Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`p-2 border rounded text-center font-sans text-sm transition-colors ${
                  type === t.id
                    ? 'border-zynq-green bg-zynq-pale text-zynq-green'
                    : 'border-zynq-mid hover:border-zynq-green'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-zynq-dark mb-1">
            Afbeelding URL (optioneel)
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-zynq-mid rounded font-sans focus:outline-none focus:ring-2 focus:ring-zynq-green"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="font-sans" disabled={loading}>
            {loading ? 'Opslaan...' : 'Aanbod Opslaan'}
          </Button>
          <Link
            href={`/${locale}/provider/offerings`}
            className="px-4 py-2 border border-zynq-mid rounded font-sans text-zynq-dark hover:bg-zynq-pale transition-colors"
          >
            Annuleren
          </Link>
        </div>
      </form>
    </div>
  );
}
