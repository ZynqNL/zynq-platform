'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Globe, User } from 'lucide-react';

const locales = [
  { code: 'nl', label: 'NL' },
  { code: 'en', label: 'EN' },
];

export function DashboardHeader() {
  const { user } = useAuth();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname?.replace(`/${locale}`, `/${newLocale}`);
    if (newPath) router.push(newPath);
  };

  return (
    <header className="h-16 bg-white border-b border-zynq-mid/20 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
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
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-zynq-dark">
          <User className="w-4 h-4 text-zynq-muted" />
          <span className="text-sm font-sans">{user?.email}</span>
        </div>
      </div>
    </header>
  );
}
