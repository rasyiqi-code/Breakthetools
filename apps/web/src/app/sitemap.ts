import { MetadataRoute } from 'next'
import { toolCategories } from '@/config/tools'
import { routing } from '@/i18n/routing'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app'
  
  // Generate homepage URLs for all locales
  const homepageUrls: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `${baseUrl}/${loc}`])
      ),
    },
  }))
  
  // Generate tool URLs for all locales
  const allTools = toolCategories.flatMap(cat => cat.tools)
  const toolUrls: MetadataRoute.Sitemap = []
  
  routing.locales.forEach((locale) => {
    allTools.forEach((tool) => {
      toolUrls.push({
        url: `${baseUrl}/${locale}/tools/${tool.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/tools/${tool.id}`])
          ),
        },
      })
    })
  })
  
  return [...homepageUrls, ...toolUrls]
}

