'use client'

/**
 * Wrapper untuk react-intl yang kompatibel dengan next-intl API
 * Ini memungkinkan tools tetap menggunakan useTranslations dari 'next-intl'
 * tapi sebenarnya menggunakan react-intl di bawahnya
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
  // Try-catch untuk handle error saat IntlProvider belum tersedia
  let intl
  try {
    intl = useIntl()
  } catch (error) {
    // Fallback saat IntlProvider belum tersedia (saat static generation)
    // Return function yang hanya return key
    return (key: string, params?: Record<string, any>) => {
      const messageKey = `${namespace}.${key}`
      return messageKey
    }
  }

  return (key: string, params?: Record<string, any>) => {
    const messageKey = `${namespace}.${key}`
    
    // Format message dengan react-intl
    try {
      return intl.formatMessage(
        { id: messageKey },
        params as any
      )
    } catch (error) {
      // Fallback ke key jika message tidak ditemukan
      return messageKey
    }
  }
}

/**
 * Hook untuk mendapatkan locale - kompatibel dengan next-intl
 * Dengan fallback untuk saat IntlProvider belum tersedia (static generation)
 */
export function useLocale() {
  try {
    const intl = useIntl()
    return intl.locale
  } catch (error) {
    // Fallback saat IntlProvider belum tersedia (saat static generation)
    return 'en'
  }
}

