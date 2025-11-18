import { toolCategories } from '@/config/tools'

export interface StructuredDataConfig {
  baseUrl: string
  locale: string
  toolId?: string
  toolName?: string
  toolDescription?: string
}

export function generateWebsiteStructuredData(config: StructuredDataConfig) {
  const { baseUrl, locale } = config
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Breaktools',
    url: `${baseUrl}/${locale}`,
    description: 'Free online tools and utilities for developers, designers, and everyone',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateOrganizationStructuredData(config: StructuredDataConfig) {
  const { baseUrl } = config
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Breaktools',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Free online tools and utilities platform',
    sameAs: [
      // Add social media links if available
    ],
  }
}

export function generateToolStructuredData(config: StructuredDataConfig) {
  const { baseUrl, locale, toolId, toolName, toolDescription } = config
  
  if (!toolId || !toolName) {
    return null
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: toolName,
    description: toolDescription || `Free online ${toolName} tool`,
    url: `${baseUrl}/${locale}/tools/${toolId}`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '1',
    },
  }
}

export function generateBreadcrumbStructuredData(config: StructuredDataConfig) {
  const { baseUrl, locale, toolId, toolName } = config
  
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${baseUrl}/${locale}`,
    },
  ]
  
  if (toolId && toolName) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: toolName,
      item: `${baseUrl}/${locale}/tools/${toolId}`,
    })
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

export function generateItemListStructuredData(config: StructuredDataConfig) {
  const { baseUrl, locale } = config
  
  const allTools = toolCategories.flatMap(cat => cat.tools)
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Breaktools - All Tools',
    description: 'List of all free online tools available on Breaktools',
    numberOfItems: allTools.length,
    itemListElement: allTools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      description: tool.description,
      url: `${baseUrl}/${locale}/tools/${tool.id}`,
    })),
  }
}

