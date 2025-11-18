'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const locale = params?.locale as string || 'en'

  useEffect(() => {
    // Set lang and dir attributes dynamically based on locale
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale])

  return <>{children}</>
}
