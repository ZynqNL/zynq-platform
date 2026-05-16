import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  /* Hostinger Node.js hosting: standaard build, geen standalone nodig */
};

export default withNextIntl(nextConfig);
