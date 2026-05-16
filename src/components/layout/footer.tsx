'use client';

import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="bg-zynq-dark py-16 px-4 text-zynq-warm">
      <div className="max-w-[960px] mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <p className="font-sans font-bold text-2xl tracking-tight mb-4 md:mb-0">
          Zynq
        </p>
        <div className="flex flex-col items-center md:items-end gap-2">
          <p className="font-serif text-sm leading-relaxed">
            &copy; {new Date().getFullYear()} Zynq VOF. {t('rights')}.
          </p>
          <div className="flex gap-4 font-sans text-sm">
            <a href={`/${locale}/privacy`} className="hover:text-zynq-mid transition-colors">
              {t('privacy')}
            </a>
            <a href={`/${locale}/terms`} className="hover:text-zynq-mid transition-colors">
              {t('terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
