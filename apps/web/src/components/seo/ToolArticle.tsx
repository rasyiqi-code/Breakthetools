'use client'

import { articles, fullArticles, i18nArticles } from '@/content/articles'
import { ArticleContent, LegacyArticle } from '@/content/articles/types'
import Link from 'next/link'
import { getArticleByLocale } from '@/content/articles/i18n'

interface ToolArticleProps {
    toolId: string
    toolName: string
}

export function ToolArticle({ toolId, toolName }: ToolArticleProps) {
    // Try to get i18n article first (default to 'en')
    const i18nArticle = i18nArticles[toolId]
    const fullArticle = i18nArticle
        ? getArticleByLocale(i18nArticles, toolId, 'en')
        : (fullArticles[toolId] as ArticleContent | undefined)

    const legacyArticle = articles[toolId] as LegacyArticle | undefined

    // Use full article if available, otherwise use legacy or default
    if (fullArticle) {
        return (
            <article className="max-w-4xl mx-auto mt-12 sm:mt-16 px-[5px]">
                {/* Main Title */}
                <div className="mb-8 sm:mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4 sm:mb-6">
                        {fullArticle.title}
                    </h2>
                    <p className="text-base sm:text-lg text-neutral-700 leading-relaxed">
                        {fullArticle.description}
                    </p>
                </div>

                {/* Main Content */}
                <div className="prose prose-neutral max-w-none mb-8 sm:mb-12">
                    {fullArticle.mainContent.map((paragraph, index) => (
                        <p
                            key={index}
                            className="text-neutral-700 leading-relaxed mb-4 text-sm sm:text-base"
                        >
                            {paragraph}
                        </p>
                    ))}
                </div>

                {/* How To Section */}
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 sm:p-8 mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6">
                        {fullArticle.howToTitle}
                    </h3>
                    {fullArticle.howToIntro && (
                        <p className="text-neutral-700 mb-6 text-sm sm:text-base">
                            {fullArticle.howToIntro.split('contact page').map((part, index, array) => {
                                if (index === array.length - 1) {
                                    return <span key={index}>{part}</span>
                                }
                                return (
                                    <span key={index}>
                                        {part}
                                        {fullArticle.contactLink && (
                                            <Link
                                                href={fullArticle.contactLink}
                                                className="text-primary-600 hover:text-primary-700 underline"
                                            >
                                                contact page
                                            </Link>
                                        )}
                                    </span>
                                )
                            })}
                        </p>
                    )}
                    <div className="space-y-4 sm:space-y-6">
                        {fullArticle.steps.map((step) => (
                            <div key={step.number} className="flex gap-4 sm:gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                                        {step.number}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-neutral-900 mb-2 text-base sm:text-lg">
                                        <strong>{step.number}. {step.title}:</strong> {step.description}
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Device Compatibility */}
                {fullArticle.deviceCompatibility && (
                    <div className="bg-neutral-50 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
                        <p className="text-neutral-700 leading-relaxed text-sm sm:text-base">
                            {fullArticle.deviceCompatibility}
                        </p>
                    </div>
                )}

                {/* Tips Section */}
                {fullArticle.tips && fullArticle.tips.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 sm:p-8 mb-6 sm:mb-8">
                        <h4 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-4">
                            Tips & Best Practices
                        </h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {fullArticle.tips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="text-primary-600 mt-1">•</span>
                                    <span className="text-neutral-700 text-sm sm:text-base">{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Additional Info */}
                {fullArticle.additionalInfo && fullArticle.additionalInfo.length > 0 && (
                    <div className="bg-neutral-50 rounded-lg p-6 sm:p-8">
                        <h4 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-4">
                            Additional Information
                        </h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {fullArticle.additionalInfo.map((info, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="text-primary-600 mt-1">•</span>
                                    <span className="text-neutral-700 text-sm sm:text-base">{info}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </article>
        )
    }

    // Legacy article format
    if (legacyArticle) {
        return (
            <article className="max-w-4xl mx-auto mt-12 sm:mt-16 px-[5px]">
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 sm:p-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">
                        {legacyArticle.title}
                    </h2>
                    <div className="prose prose-neutral max-w-none">
                        {legacyArticle.content.map((paragraph, index) => (
                            <p
                                key={index}
                                className="text-neutral-700 leading-relaxed mb-4 text-sm sm:text-base"
                            >
                                {paragraph}
                            </p>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-neutral-200">
                        <p className="text-sm text-neutral-600">
                            <strong>Tips:</strong> Make sure to save your work before processing. All processing happens in your browser for maximum privacy.
                        </p>
                    </div>
                </div>
            </article>
        )
    }

    // Default fallback
    return (
        <article className="max-w-4xl mx-auto mt-12 sm:mt-16 px-[5px]">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">
                    About {toolName}
                </h2>
                <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-700 leading-relaxed mb-4 text-sm sm:text-base">
                        {toolName} is a free online tool that helps you {toolName.toLowerCase()} quickly and easily. No registration required, all processing happens in your browser.
                    </p>
                    <p className="text-neutral-700 leading-relaxed mb-4 text-sm sm:text-base">
                        Our {toolName.toLowerCase()} tool is designed to be fast, secure, and user-friendly. Simply input your data and get instant results.
                    </p>
                    <p className="text-neutral-700 leading-relaxed mb-4 text-sm sm:text-base">
                        All processing happens locally in your browser, ensuring your data never leaves your device.
                    </p>
                    <p className="text-neutral-700 leading-relaxed mb-4 text-sm sm:text-base">
                        This tool is completely free to use with no hidden costs or registration requirements.
                    </p>
                </div>
                <div className="mt-8 pt-6 border-t border-neutral-200">
                    <p className="text-sm text-neutral-600">
                        <strong>Tips:</strong> Make sure to save your work before processing. All processing happens in your browser for maximum privacy.
                    </p>
                </div>
            </div>
        </article>
    )
}

