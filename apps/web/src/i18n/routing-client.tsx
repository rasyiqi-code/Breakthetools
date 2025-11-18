'use client'

/**
 * Client-side safe routing exports
 * Wrapper untuk Link dan navigation hooks yang kompatibel dengan routing
 * Tapi tidak memerlukan next-intl context provider
 */

import NextLink from 'next/link'
import { usePathname as useNextPathname, useRouter as useNextRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { routing } from './routing'
import { ComponentProps } from 'react'

// Localized Link component yang menambahkan locale prefix
export function Link(props: ComponentProps<typeof NextLink>) {
  const locale = useLocale()
  const { href, ...restProps } = props
  
  // Helper untuk localize href
  const localizeHref = (inputHref: string | { pathname?: string; query?: any; hash?: string }): string | { pathname?: string; query?: any; hash?: string } => {
    // Jika href adalah object, handle sesuai kebutuhan
    if (typeof inputHref === 'object' && inputHref !== null) {
      if (inputHref.pathname) {
        return {
          ...inputHref,
          pathname: `/${locale}${inputHref.pathname === '/' ? '' : inputHref.pathname}`
        }
      }
      return inputHref
    }
    
    // Jika href sudah memiliki locale prefix, gunakan langsung
    if (typeof inputHref === 'string' && (inputHref.startsWith(`/${locale}/`) || inputHref === `/${locale}`)) {
      return inputHref
    }
    
    // Jika href adalah absolute URL, gunakan langsung
    if (typeof inputHref === 'string' && (inputHref.startsWith('http') || inputHref.startsWith('//'))) {
      return inputHref
    }
    
    // Jika href dimulai dengan #, gunakan langsung (anchor link)
    if (typeof inputHref === 'string' && inputHref.startsWith('#')) {
      return inputHref
    }
    
    // Tambahkan locale prefix
    return typeof inputHref === 'string' 
      ? `/${locale}${inputHref === '/' ? '' : inputHref}`
      : inputHref
  }
  
  const localizedHref = localizeHref(href as string | { pathname?: string; query?: any; hash?: string })
  const hrefValue: any = localizedHref
  
  return <NextLink href={hrefValue} {...restProps} />
}

// usePathname hook yang menghapus locale prefix
export function usePathname() {
  const fullPathname = useNextPathname()
  
  if (!fullPathname) return '/'
  
  // Remove locale prefix
  const pathname = fullPathname.replace(/^\/[^/]+/, '') || '/'
  return pathname
}

// useRouter hook wrapper
export function useRouter() {
  const nextRouter = useNextRouter()
  const locale = useLocale()
  
  return {
    ...nextRouter,
    push: (href: string) => {
      // Tambahkan locale prefix jika belum ada
      const localizedHref = href.startsWith(`/${locale}/`) || href.startsWith('http') || href.startsWith('//')
        ? href
        : `/${locale}${href === '/' ? '' : href}`
      return nextRouter.push(localizedHref)
    },
    replace: (href: string) => {
      const localizedHref = href.startsWith(`/${locale}/`) || href.startsWith('http') || href.startsWith('//')
        ? href
        : `/${locale}${href === '/' ? '' : href}`
      return nextRouter.replace(localizedHref)
    },
  }
}

// redirect function (untuk server-side)
export function redirect(href: string) {
  // Ini hanya untuk type compatibility, sebenarnya redirect dilakukan di server
  throw new Error('redirect should be called from server components only')
}

// Export routing config
export { routing }
