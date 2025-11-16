'use client'

import { useState } from 'react'
import { Link } from '@/i18n/routing-client'
import { useTranslations } from '@/lib/react-intl-wrapper'
import { useIntl } from 'react-intl'
import { toolCategories } from '@/config/tools'
import { Sparkles, Zap, Shield, TrendingUp } from 'lucide-react'
import { CommandPalette } from '@/components/CommandPalette'
import { getToolName } from '@/lib/toolTranslations'

export default function HomePageClient() {
    const t = useTranslations('common')
    const tNav = useTranslations('nav')
    const intl = useIntl()
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

    return (
        <div className="min-h-[calc(100vh-73px)] flex flex-col">
            {/* Hero Section - Browser Inspired */}
            <div className="flex-1 flex flex-col items-center justify-center px-[5px] py-12 sm:py-16 md:py-20">
                {/* Logo & Title */}
                <div className="text-center mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-3 sm:mb-4 tracking-tight">
                        {t('appName')}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-2">
                        {t('tagline')}
                    </p>
                </div>

                {/* Command Palette - Main Focus */}
                <div className="w-full max-w-3xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                    <CommandPalette onOpenChange={setIsCommandPaletteOpen} />
                </div>

                {/* Stats Bar - Hidden when command palette is open */}
                <div className={`mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-3xl w-full px-4 transition-opacity duration-300 ${isCommandPaletteOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300'
                    }`}>
                    <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-primary-600">17+</div>
                        <div className="text-xs sm:text-sm text-neutral-600">{tNav('tools')}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-primary-600">100%</div>
                        <div className="text-xs sm:text-sm text-neutral-600">Free</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-primary-600">0ms</div>
                        <div className="text-xs sm:text-sm text-neutral-600">Upload</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-primary-600">∞</div>
                        <div className="text-xs sm:text-sm text-neutral-600">Usage</div>
                    </div>
                </div>
            </div>

            {/* Popular Tools Section */}
            <div className="py-12 sm:py-16 bg-gradient-to-b from-transparent to-neutral-50">
                <div className="max-w-7xl mx-auto px-[5px]">
                    <div className="text-center mb-8 sm:mb-10">
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-100 text-primary-700 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            Popular Tools
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                            Most Used Tools
                        </h2>
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {toolCategories.flatMap(cat => cat.tools.slice(0, 1)).slice(0, 8).map((tool, index) => {
                            const category = toolCategories.find(c => c.tools.some(t => t.id === tool.id))
                            return (
                                <Link
                                    key={tool.id}
                                    href={`/tools/${tool.id}`}
                                    className="group p-6 bg-white rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-3 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                                            {category && <category.icon className="w-5 h-5 text-primary-600" />}
                                        </div>
                                        <span className="text-xs text-neutral-400">#{index + 1}</span>
                                    </div>
                                    <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                                        {getToolName(tool.id, intl)}
                                    </h3>
                                    <p className="text-sm text-neutral-600 line-clamp-2">
                                        {tool.description}
                                    </p>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Features Section - Minimal */}
            <div className="py-12 sm:py-16 bg-neutral-50">
                <div className="max-w-5xl mx-auto px-[5px]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        <div className="text-center">
                            <div className="inline-flex p-4 bg-white rounded-2xl shadow-soft mb-4">
                                <Zap className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="font-semibold text-neutral-900 mb-2">Lightning Fast</h3>
                            <p className="text-sm text-neutral-600">
                                All processing in browser. Zero latency, maximum speed.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex p-4 bg-white rounded-2xl shadow-soft mb-4">
                                <Shield className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="font-semibold text-neutral-900 mb-2">100% Private</h3>
                            <p className="text-sm text-neutral-600">
                                Files never uploaded. Your data stays on your device.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex p-4 bg-white rounded-2xl shadow-soft mb-4">
                                <Sparkles className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="font-semibold text-neutral-900 mb-2">Always Free</h3>
                            <p className="text-sm text-neutral-600">
                                No hidden costs. No registration required.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
