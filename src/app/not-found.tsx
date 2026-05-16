import Link from 'next/link';
import { getLocale } from 'next-intl/server';

export default async function NotFound() {
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-zynq-warm flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="font-sans font-bold text-8xl text-zynq-green">404</h1>
        <h2 className="font-sans font-semibold text-2xl text-zynq-dark mt-4">
          Pagina niet gevonden
        </h2>
        <p className="text-zynq-muted font-sans mt-2">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>
        <Link
          href={`/${locale}`}
          className="inline-block mt-6 px-6 py-3 bg-zynq-green text-white font-sans font-medium rounded-lg hover:bg-zynq-deep transition-colors"
        >
          Terug naar home
        </Link>
      </div>
    </div>
  );
}
