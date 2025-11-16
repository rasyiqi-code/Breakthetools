import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match only internationalized pathnames
  // Support all locales: en (default), id, ar, zh
  matcher: ['/', '/(en|id|ar|zh)/:path*']
}

