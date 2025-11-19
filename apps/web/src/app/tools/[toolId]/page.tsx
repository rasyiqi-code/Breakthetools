// Server Component wrapper untuk ToolPageClient
// Ini memungkinkan kita menggunakan generateStaticParams untuk skip static generation
import { Metadata } from 'next'
import Script from 'next/script'
import { ToolPageClient } from './ToolPageClient'
import { toolCategories } from '@/config/tools'
import { generateToolStructuredData, generateBreadcrumbStructuredData } from '@/lib/structuredData'

// Force dynamic rendering untuk tools karena menggunakan client-side features
// Ini akan memaksa Next.js untuk render page ini sebagai dynamic route dan skip static generation
export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ toolId: string }> 
}): Promise<Metadata> {
  const { toolId } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app'
  
  // Find tool
  const allTools = toolCategories.flatMap(cat => cat.tools)
  const tool = allTools.find(t => t.id === toolId)
  
  if (!tool) {
    return {
      title: 'Tool Not Found',
    }
  }
  
  const title = `${tool.name} - Free Online Tool | Breaktools`
  const description = `${tool.description} Free online tool. No registration required. Use ${tool.name} now!`
  
  return {
    title,
    description,
    keywords: [
      tool.name.toLowerCase(),
      tool.description,
      'free online tool',
      'online utility',
      'web tool',
      'no registration',
    ],
    openGraph: {
      title,
      description,
      url: `${baseUrl}/tools/${toolId}`,
      locale: 'en',
      type: 'website',
      siteName: 'Breaktools',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: tool.name,
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
      canonical: `${baseUrl}/tools/${toolId}`,
    },
  }
}

export default async function ToolPage({ 
  params 
}: { 
  params: Promise<{ toolId: string }> 
}) {
  const { toolId } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app'
  
  // Find tool
  const allTools = toolCategories.flatMap(cat => cat.tools)
  const tool = allTools.find(t => t.id === toolId)
  
  if (!tool) {
    return <ToolPageClient />
  }
  
  // Generate structured data
  const toolStructuredData = generateToolStructuredData({
    baseUrl,
    locale: 'en',
    toolId,
    toolName: tool.name,
    toolDescription: tool.description,
  })
  
  const breadcrumbStructuredData = generateBreadcrumbStructuredData({
    baseUrl,
    locale: 'en',
    toolId,
    toolName: tool.name,
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
