// Centralized article imports
import { backgroundRemoverArticle } from './background-remover'
import { youtubeDownloaderArticle } from './youtube-downloader'
import { wordCounterArticle } from './word-counter'
import { colorConverterArticle } from './color-converter'
import { imageConverterArticle } from './image-converter'
import { pdfMergerArticle } from './pdf-merger'
import { qrCodeArticle } from './qr-code'
import { passwordGeneratorArticle } from './password-generator'
import { jsonFormatterArticle } from './json-formatter'
import { youtubeDownloaderArticleFull } from './youtube-downloader-full'
import { ArticleContent, LegacyArticle } from './types'

// Legacy articles (backward compatibility)
export interface Article {
    title: string
    content: string[]
}

export const articles: Record<string, LegacyArticle> = {
    'background-remover': backgroundRemoverArticle,
    'youtube-downloader': youtubeDownloaderArticle,
    'word-counter': wordCounterArticle,
    'color-converter': colorConverterArticle,
    'image-converter': imageConverterArticle,
    'pdf-merger': pdfMergerArticle,
    'qr-code': qrCodeArticle,
    'password-generator': passwordGeneratorArticle,
    'json-formatter': jsonFormatterArticle,
}

// Full articles with complete SEO structure
import { wordCounterArticleFull } from './word-counter-full'
import { qrCodeArticleFull } from './qr-code-full'

export const fullArticles: Record<string, ArticleContent> = {
    'youtube-downloader': youtubeDownloaderArticleFull,
    'word-counter': wordCounterArticleFull,
    'qr-code': qrCodeArticleFull,
}

// i18n articles (multi-language support)
import { youtubeDownloaderArticleI18n } from './youtube-downloader-i18n'
import { backgroundRemoverArticleI18n } from './background-remover-i18n'
import { ArticleI18n } from './i18n'

export const i18nArticles: Record<string, ArticleI18n> = {
    'youtube-downloader': youtubeDownloaderArticleI18n,
    'background-remover': backgroundRemoverArticleI18n,
}

