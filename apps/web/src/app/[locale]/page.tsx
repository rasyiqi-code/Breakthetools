// Server wrapper for client home page to avoid calling client hooks during prerender
import { Metadata } from 'next'
import HomePageClient from './pageClient'
import { routing } from '@/i18n/routing'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app'
  
  // Get locale-specific messages
  const messages = {
    en: {
      title: 'Breaktools - Free Online Tools & Utilities',
      description: 'Free online tools and utilities for developers, designers, and everyone. Text tools, image tools, PDF tools, converters, generators, and more. 100% free, no registration required.',
    },
    id: {
      title: 'Breaktools - Tools Online Gratis & Utilitas',
      description: 'Tools online gratis dan utilitas untuk developer, designer, dan semua orang. Text tools, image tools, PDF tools, converter, generator, dan lainnya. 100% gratis, tidak perlu registrasi.',
    },
    ar: {
      title: 'Breaktools - أدوات مجانية على الإنترنت',
      description: 'أدوات ومرافق مجانية على الإنترنت للمطورين والمصممين والجميع. أدوات النصوص، أدوات الصور، أدوات PDF، المحولات، المولدات، والمزيد. مجاني 100%، لا حاجة للتسجيل.',
    },
    zh: {
      title: 'Breaktools - 免费在线工具和实用程序',
      description: '为开发人员、设计师和所有人提供免费在线工具和实用程序。文本工具、图像工具、PDF工具、转换器、生成器等。100%免费，无需注册。',
    },
  }
  
  const localeMessages = messages[locale as keyof typeof messages] || messages.en
  
  return {
    title: localeMessages.title,
    description: localeMessages.description,
    openGraph: {
      title: localeMessages.title,
      description: localeMessages.description,
      url: `${baseUrl}/${locale}`,
      locale: locale,
    },
    twitter: {
      title: localeMessages.title,
      description: localeMessages.description,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
    },
  }
}

export default function HomePage() {
    return <HomePageClient />
}

