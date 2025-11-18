'use client'

import { NextIntlClientProvider } from 'next-intl'
import { ReactNode } from 'react'

interface IntlProviderWrapperProps {
  locale: string
  messages: Record<string, any>  // next-intl menggunakan nested structure
  children: ReactNode
}

/**
 * Client Component wrapper untuk NextIntlClientProvider
 * next-intl's NextIntlClientProvider memerlukan Client Component karena menggunakan React Context
 */
export function IntlProviderWrapper({ locale, messages, children }: IntlProviderWrapperProps) {
  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={messages}
      timeZone="UTC"
    >
      {children}
    </NextIntlClientProvider>
  )
}

