'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();

  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zynq-warm flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="font-sans font-bold text-8xl text-zynq-red">500</h1>
        <h2 className="font-sans font-semibold text-2xl text-zynq-dark mt-4">
          Er ging iets mis
        </h2>
        <p className="text-zynq-muted font-sans mt-2">
          Een onverwachte fout is opgetreden. Probeer het opnieuw of neem contact op met support.
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={reset}
            className="px-6 py-3 bg-zynq-green text-white font-sans font-medium rounded-lg hover:bg-zynq-deep transition-colors"
          >
            Opnieuw proberen
          </button>
          <Link
            href={`/${locale}`}
            className="px-6 py-3 border border-zynq-mid/50 text-zynq-dark font-sans font-medium rounded-lg hover:bg-zynq-pale transition-colors"
          >
            Terug naar home
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-zynq-muted font-sans mt-6">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
