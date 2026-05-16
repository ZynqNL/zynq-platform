import { type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import createI18nMiddleware from 'next-intl/middleware';

const i18nMiddleware = createI18nMiddleware({
  locales: ['nl', 'en'],
  defaultLocale: 'nl',
  localePrefix: 'always',
});

export async function middleware(request: NextRequest) {
  i18nMiddleware(request);

  const { response } = await updateSession(request);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
