// i18n support for articles
import { ArticleContent } from './types'

export interface ArticleI18n {
  [locale: string]: ArticleContent
}

// Helper to get article by locale
export function getArticleByLocale(
  articles: Record<string, ArticleI18n>,
  toolId: string,
  locale: string
): ArticleContent | undefined {
  const toolArticles = articles[toolId]
  if (!toolArticles) return undefined
  
  // Try exact locale match first
  if (toolArticles[locale as keyof ArticleI18n]) {
    return toolArticles[locale as keyof ArticleI18n]
  }
  
  // Fallback to default locale (en)
  if (toolArticles['en']) {
    return toolArticles['en']
  }
  
  // Fallback to first available locale
  const availableLocales = Object.keys(toolArticles) as Array<keyof ArticleI18n>
  if (availableLocales.length > 0) {
    return toolArticles[availableLocales[0]]
  }
  
  return undefined
}

