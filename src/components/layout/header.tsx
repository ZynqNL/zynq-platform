'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const locales = [
  { code: 'nl', label: 'NL' },
  { code: 'en', label: 'EN' },
];

export function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <nav className="max-w-[960px] mx-auto flex items-center justify-between py-4 px-4">
        <Link href={`/${locale}`} className="text-zynq-green font-sans font-bold text-2xl tracking-tight">
          Zynq
        </Link>

        <div className="flex items-center gap-6">
          <ul className="hidden sm:flex items-center gap-6 font-sans text-base font-medium">
            <li>
              <Link href={`/${locale}`} className="text-zynq-dark hover:text-zynq-green transition-colors">
                {t('nav.home')}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}#diensten`} className="text-zynq-dark hover:text-zynq-green transition-colors">
                {t('nav.services')}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}#contact`} className="text-zynq-dark hover:text-zynq-green transition-colors">
                {t('nav.contact')}
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-zynq-mid rounded px-1">
              <Globe className="w-4 h-4 text-zynq-green" />
              {locales.map((loc) => (
                <button
                  key={loc.code}
                  onClick={() => switchLocale(loc.code)}
                  className={`px-2 py-1 text-xs font-sans font-medium rounded transition-colors ${
                    locale === loc.code
                      ? 'bg-zynq-green text-white'
                      : 'text-zynq-muted hover:text-zynq-green'
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            <Link href={`/${locale}/login`}>
              <Button variant="outline" size="sm" className="font-sans">
                {t('nav.login')}
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
