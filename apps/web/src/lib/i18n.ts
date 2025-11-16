// i18n helper functions
import { getLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'

export async function getCurrentLocale() {
  try {
    return await getLocale()
  } catch {
    return routing.defaultLocale
  }
}

export function getLocalizedPath(path: string, locale: string) {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // If path already starts with locale, return as is
  if (routing.locales.some(loc => cleanPath.startsWith(`${loc}/`))) {
    return `/${cleanPath}`
  }
  
  // Add locale prefix
  return `/${locale}/${cleanPath}`
}

