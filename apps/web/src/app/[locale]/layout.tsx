import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import Script from 'next/script'

// Optimasi font loading dengan display swap dan preload
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})
import { SpeedInsights } from '@vercel/speed-insights/next'
import '../globals.css'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { messages } from '@/lib/messages'
import { IntlProviderWrapper } from '@/components/IntlProviderWrapper'
import { generateWebsiteStructuredData, generateOrganizationStructuredData } from '@/lib/structuredData'

// Base metadata untuk SEO - akan di-override di page level
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app'

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: 'Breaktools - Free Online Tools & Utilities',
      template: '%s | Breaktools'
    },
    description: 'Free online tools and utilities for developers, designers, and everyone. Text tools, image tools, PDF tools, converters, generators, and more. 100% free, no registration required.',
    keywords: ['online tools', 'free tools', 'text tools', 'image tools', 'PDF tools', 'converters', 'generators', 'utilities', 'developer tools'],
    authors: [{ name: 'Breaktools' }],
    creator: 'Breaktools',
    publisher: 'Breaktools',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#f2711c' },
      ],
    },
    manifest: '/site.webmanifest',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: `${baseUrl}/${locale}`,
      siteName: 'Breaktools',
      title: 'Breaktools - Free Online Tools & Utilities',
      description: 'Free online tools and utilities for developers, designers, and everyone. 100% free, no registration required.',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Breaktools - Free Online Tools',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Breaktools - Free Online Tools & Utilities',
      description: 'Free online tools and utilities for developers, designers, and everyone.',
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'en': `${baseUrl}/en`,
        'id': `${baseUrl}/id`,
        'ar': `${baseUrl}/ar`,
        'zh': `${baseUrl}/zh`,
      },
    },
    other: {
      'dns-prefetch': 'https://unpkg.com',
    },
  }
}


export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  // Get messages for current locale
  const localeMessages = messages[locale as keyof typeof messages] || messages.en
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app'

  // Generate structured data
  const websiteStructuredData = generateWebsiteStructuredData({ baseUrl, locale })
  const organizationStructuredData = generateOrganizationStructuredData({ baseUrl, locale })

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`${inter.className} ${inter.variable}`}>
        {/* Structured Data */}
        <Script
          id="website-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
        <Script
          id="organization-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />
        <IntlProviderWrapper
          locale={locale}
          messages={localeMessages}
        >
          <div className="min-h-screen bg-neutral-50">
            <Header />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 px-[5px] sm:px-[5px] py-4 sm:py-6 lg:py-8 w-full lg:w-auto">
                {children}
              </main>
            </div>
          </div>
        </IntlProviderWrapper>
        <SpeedInsights />
      </body>
    </html>
  )
}
