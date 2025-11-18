// Server Component wrapper untuk ToolPageClient
// Ini memungkinkan kita menggunakan generateStaticParams untuk skip static generation
import { Metadata } from 'next'
import Script from 'next/script'
import { ToolPageClient } from './ToolPageClient'
import { toolCategories } from '@/config/tools'
import { routing } from '@/i18n/routing'
import { getToolName } from '@/lib/toolTranslations'
import { messages } from '@/lib/messages'
import { generateToolStructuredData, generateBreadcrumbStructuredData } from '@/lib/structuredData'

// Force dynamic rendering untuk tools karena menggunakan client-side features dan IntlProvider
// Ini akan memaksa Next.js untuk render page ini sebagai dynamic route dan skip static generation
export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string; toolId: string }> 
}): Promise<Metadata> {
  const { locale, toolId } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app'
  
  // Find tool
  const allTools = toolCategories.flatMap(cat => cat.tools)
  const tool = allTools.find(t => t.id === toolId)
  
  if (!tool) {
    return {
      title: 'Tool Not Found',
    }
  }
  
  // Get translations
  const localeMessages = messages[locale as keyof typeof messages] || messages.en
  const toolName = getToolName(toolId, localeMessages.tools || {})
  
  const title = `${toolName} - Free Online Tool | Breaktools`
  const description = `${tool.description} Free online tool. No registration required. Use ${toolName} now!`
  
  return {
    title,
    description,
    keywords: [
      toolName.toLowerCase(),
      tool.description,
      'free online tool',
      'online utility',
      'web tool',
      'no registration',
    ],
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/tools/${toolId}`,
      locale: locale,
      type: 'website',
      siteName: 'Breaktools',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: toolName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/tools/${toolId}`,
      languages: {
        'en': `${baseUrl}/en/tools/${toolId}`,
        'id': `${baseUrl}/id/tools/${toolId}`,
        'ar': `${baseUrl}/ar/tools/${toolId}`,
        'zh': `${baseUrl}/zh/tools/${toolId}`,
      },
    },
  }
}

export default async function ToolPage({ 
  params 
}: { 
  params: Promise<{ locale: string; toolId: string }> 
}) {
  const { locale, toolId } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app'
  
  // Find tool
  const allTools = toolCategories.flatMap(cat => cat.tools)
  const tool = allTools.find(t => t.id === toolId)
  
  if (!tool) {
    return <ToolPageClient />
  }
  
  // Get translations
  const localeMessages = messages[locale as keyof typeof messages] || messages.en
  const toolName = getToolName(toolId, localeMessages.tools || {})
  
  // Generate structured data
  const toolStructuredData = generateToolStructuredData({
    baseUrl,
    locale,
    toolId,
    toolName,
    toolDescription: tool.description,
  })
  
  const breadcrumbStructuredData = generateBreadcrumbStructuredData({
    baseUrl,
    locale,
    toolId,
    toolName,
  })
  
  return (
    <>
      {/* Structured Data */}
      {toolStructuredData && (
        <Script
          id="tool-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(toolStructuredData),
          }}
        />
      )}
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <ToolPageClient />
    </>
  )
}

