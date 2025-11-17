'use client'

/**
 * Wrapper untuk react-intl yang kompatibel dengan next-intl API
 * Ini memungkinkan tools tetap menggunakan useTranslations dari 'next-intl'
 * tapi sebenarnya menggunakan react-intl di bawahnya
 * 
 * File ini di-alias sebagai 'next-intl' di webpack config
 */

import { useIntl } from 'react-intl'
import { useContext, createContext } from 'react'

// Context untuk check apakah IntlProvider tersedia
const IntlContext = createContext<any>(null)

/**
 * Hook yang kompatibel dengan next-intl useTranslations API
 * Dengan fallback untuk saat IntlProvider belum tersedia (static generation)
 * 
 * Usage:
 * const t = useTranslations('tools.wordCounter')
 * t('title') // akan mencari tools.wordCounter.title
 */
export function useTranslations(namespace: string) {
  // Hooks HARUS dipanggil di top level (Rules of Hooks)
  // Tidak bisa di dalam try-catch atau conditional
  // IntlProvider sudah tersedia di layout, jadi useIntl() seharusnya selalu berhasil
  const intl = useIntl()

  // Return translation function
  return (key: string, params?: Record<string, any>) => {
    const messageKey = `${namespace}.${key}`

    // Format message dengan react-intl
    try {
      const result = intl.formatMessage(
        { id: messageKey },
        params as any
      )
      return result || messageKey
    } catch (error: any) {
      // Fallback ke key jika message tidak ditemukan
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn('[react-intl-wrapper] Translation not found:', messageKey, error?.message)
      }
      return messageKey
    }
  }
}

/**
 * Hook untuk mendapatkan locale - kompatibel dengan next-intl
 * Dengan fallback untuk saat IntlProvider belum tersedia (static generation)
 */
export function useLocale() {
  // Hooks HARUS dipanggil di top level (Rules of Hooks)
  // IntlProvider sudah tersedia di layout, jadi useIntl() seharusnya selalu berhasil
  const intl = useIntl()
  return intl.locale || 'en'
}

// Export default untuk kompatibilitas dengan beberapa import styles
export default {
  useTranslations,
  useLocale
}
