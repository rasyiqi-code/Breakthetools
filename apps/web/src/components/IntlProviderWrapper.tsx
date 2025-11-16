'use client'

import { IntlProvider } from 'react-intl'
import { ReactNode } from 'react'

interface IntlProviderWrapperProps {
  locale: string
  messages: Record<string, string>
  children: ReactNode
}

/**
 * Client Component wrapper untuk IntlProvider
 * react-intl's IntlProvider memerlukan Client Component karena menggunakan React Context
 */
export function IntlProviderWrapper({ locale, messages, children }: IntlProviderWrapperProps) {
  return (
    <IntlProvider 
      locale={locale} 
      messages={messages}
      defaultLocale="en"
    >
      {children}
    </IntlProvider>
  )
}

