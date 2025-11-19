import { Inter } from 'next/font/google'
import './globals.css'
import { Metadata } from 'next'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { generateWebsiteStructuredData, generateOrganizationStructuredData } from '@/lib/structuredData'
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper'

// Optimasi font loading dengan display swap dan preload
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

// Base metadata untuk SEO
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app'),
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
    locale: 'en',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app',
    siteName: 'Breaktools',
    title: 'Breaktools - Free Online Tools & Utilities',
    description: 'Free online tools and utilities for developers, designers, and everyone. 100% free, no registration required.',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app'}/og-image.png`,
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
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app'}/og-image.png`],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app',
  },
  verification: {
    google: 'bed3200569488cf4',
  },
  other: {
    'dns-prefetch': 'https://unpkg.com, https://www.googletagmanager.com, https://pagead2.googlesyndication.com',
    'google-adsense-account': 'ca-pub-1647155857669632',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app'

  // Generate structured data
  const websiteStructuredData = generateWebsiteStructuredData({ baseUrl, locale: 'en' })
  const organizationStructuredData = generateOrganizationStructuredData({ baseUrl, locale: 'en' })

  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable}`}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-S41BPCD7QF"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-S41BPCD7QF');
            `,
          }}
        />
        {/* Google AdSense */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1647155857669632"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
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
        <ErrorBoundaryWrapper>
          <div className="min-h-screen bg-neutral-50">
            <Header />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 px-[5px] sm:px-[5px] py-4 sm:py-6 lg:py-8 w-full lg:w-auto">
                {children}
              </main>
            </div>
          </div>
        </ErrorBoundaryWrapper>
        <SpeedInsights />
      </body>
    </html>
  )
}

