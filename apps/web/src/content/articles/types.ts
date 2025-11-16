// Types for SEO articles
export interface ArticleStep {
    number: number
    title: string
    description: string
}

export interface ArticleContent {
    title: string
    description: string
    mainContent: string[]
    howToTitle: string
    howToIntro?: string
    steps: ArticleStep[]
    deviceCompatibility?: string
    tips?: string[]
    additionalInfo?: string[]
    contactLink?: string
}

// Legacy format for backward compatibility
export interface LegacyArticle {
    title: string
    content: string[]
}

