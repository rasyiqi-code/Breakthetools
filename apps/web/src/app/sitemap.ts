import { MetadataRoute } from 'next'
import { toolCategories } from '@/config/tools'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.com'

  // Generate homepage URL
  const homepageUrl: MetadataRoute.Sitemap = [{
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  }]

  // Generate tool URLs
  const allTools = toolCategories.flatMap(cat => cat.tools)
  const toolUrls: MetadataRoute.Sitemap = allTools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...homepageUrl, ...toolUrls]
}

