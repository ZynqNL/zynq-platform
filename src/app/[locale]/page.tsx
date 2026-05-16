import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default async function HomePage() {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-zynq-warm text-zynq-dark">
      <Header />

      <main className="pt-20">
        {/* HERO SECTION */}
        <section className="bg-zynq-warm py-20 px-4">
          <div className="max-w-[960px] mx-auto text-center">
            <h1 className="font-sans font-bold text-5xl sm:text-6xl text-zynq-green mb-8 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl leading-relaxed text-zynq-dark mb-10 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <Link
              href={`/${locale}/register/company`}
              className="inline-block bg-zynq-green text-white font-sans font-bold px-8 py-4 rounded hover:bg-zynq-deep transition-colors text-lg"
            >
              {t('hero.cta')}
            </Link>
          </div>
        </section>

        {/* DIENSTEN SECTIE */}
        <section id="diensten" className="bg-zynq-pale py-20 px-4">
          <div className="max-w-[960px] mx-auto">
            <h2 className="font-sans font-bold text-4xl text-zynq-green text-center mb-16">
              {t('services.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Dienst Kaart 1 */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="font-sans font-bold text-2xl text-zynq-green mb-4">
                  {t('services.cards.policy.title')}
                </h3>
                <p className="leading-relaxed text-zynq-dark">
                  {t('services.cards.policy.description')}
                </p>
              </div>

              {/* Dienst Kaart 2 */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="font-sans font-bold text-2xl text-zynq-green mb-4">
                  {t('services.cards.workshops.title')}
                </h3>
                <p className="leading-relaxed text-zynq-dark">
                  {t('services.cards.workshops.description')}
                </p>
              </div>

              {/* Dienst Kaart 3 */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="font-sans font-bold text-2xl text-zynq-green mb-4">
                  {t('services.cards.advice.title')}
                </h3>
                <p className="leading-relaxed text-zynq-dark">
                  {t('services.cards.advice.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTIE */}
        <section id="contact" className="bg-zynq-warm py-20 px-4">
          <div className="max-w-[960px] mx-auto text-center">
            <h2 className="font-sans font-bold text-4xl text-zynq-green mb-8">
              {t('common.tagline')}
            </h2>
            <p className="text-xl leading-relaxed text-zynq-dark mb-10 max-w-2xl mx-auto">
              {t('common.description')}
            </p>
            <a
              href="mailto:info@zynq.nl"
              className="inline-block bg-zynq-green text-white font-sans font-bold px-8 py-4 rounded hover:bg-zynq-deep transition-colors text-lg"
            >
              {t('common.buttons.contactUs')}
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
