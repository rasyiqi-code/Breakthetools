'use client'

import { useState } from 'react'
import { Globe, Search, Copy, Check, Layers, Code, Server, Database, Cloud, Palette } from 'lucide-react'

type TechStackMode = 'analyze' | 'compose'

interface TechStack {
    frontend?: string[]
    backend?: string[]
    database?: string[]
    hosting?: string[]
    cms?: string[]
    cdn?: string[]
    other?: string[]
}

interface TechCategory {
    name: string
    icon: React.ReactNode
    technologies: string[]
}

const techCategories: TechCategory[] = [
    {
        name: 'frontend',
        icon: <Code className="w-4 h-4" />,
        technologies: ['React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte', 'Remix', 'Gatsby', 'Astro', 'Solid.js']
    },
    {
        name: 'backend',
        icon: <Server className="w-4 h-4" />,
        technologies: ['Node.js', 'Express', 'PHP', 'Laravel', 'Python', 'Django', 'Flask', 'Ruby', 'Rails', 'Java', 'Spring', 'Go', 'Rust', 'C#', '.NET']
    },
    {
        name: 'database',
        icon: <Database className="w-4 h-4" />,
        technologies: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'MariaDB', 'Firebase', 'Supabase', 'DynamoDB']
    },
    {
        name: 'hosting',
        icon: <Cloud className="w-4 h-4" />,
        technologies: ['Vercel', 'Netlify', 'AWS', 'Google Cloud', 'Azure', 'Heroku', 'DigitalOcean', 'Cloudflare Pages']
    },
    {
        name: 'cms',
        icon: <Layers className="w-4 h-4" />,
        technologies: ['WordPress', 'Drupal', 'Contentful', 'Strapi', 'Sanity', 'Ghost', 'Shopify']
    },
    {
        name: 'cdn',
        icon: <Cloud className="w-4 h-4" />,
        technologies: ['Cloudflare', 'AWS CloudFront', 'Fastly', 'Akamai', 'Vercel Edge']
    }
]

const categoryLabels: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    database: 'Database',
    hosting: 'Hosting',
    cms: 'CMS',
    cdn: 'CDN',
    other: 'Other',
}

export function TechStackAnalyzer() {

    const [mode, setMode] = useState<TechStackMode>('analyze')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [analyzedStack, setAnalyzedStack] = useState<TechStack | null>(null)
    const [composedStack, setComposedStack] = useState<TechStack>({})
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)

    const detectTechStack = (html: string, headers: Record<string, string>): TechStack => {
        const detected: TechStack = {}
        const htmlLower = html.toLowerCase()

        // Frontend Detection
        if (htmlLower.includes('react') || htmlLower.includes('__next') || htmlLower.includes('react-dom')) {
            if (!detected.frontend) detected.frontend = []
            if (htmlLower.includes('__next') || htmlLower.includes('next.js')) {
                detected.frontend.push('Next.js')
            } else {
                detected.frontend.push('React')
            }
        }
        if (htmlLower.includes('vue') || htmlLower.includes('vue.js')) {
            if (!detected.frontend) detected.frontend = []
            detected.frontend.push('Vue.js')
        }
        if (htmlLower.includes('angular') || htmlLower.includes('ng-')) {
            if (!detected.frontend) detected.frontend = []
            detected.frontend.push('Angular')
        }
        if (htmlLower.includes('svelte')) {
            if (!detected.frontend) detected.frontend = []
            detected.frontend.push('Svelte')
        }
        if (htmlLower.includes('nuxt') || htmlLower.includes('nuxt.js')) {
            if (!detected.frontend) detected.frontend = []
            detected.frontend.push('Nuxt.js')
        }
        if (htmlLower.includes('gatsby')) {
            if (!detected.frontend) detected.frontend = []
            detected.frontend.push('Gatsby')
        }
        if (htmlLower.includes('astro')) {
            if (!detected.frontend) detected.frontend = []
            detected.frontend.push('Astro')
        }

        // CMS Detection
        if (htmlLower.includes('wp-content') || htmlLower.includes('wordpress') || htmlLower.includes('/wp-admin/')) {
            if (!detected.cms) detected.cms = []
            detected.cms.push('WordPress')
        }
        if (htmlLower.includes('drupal')) {
            if (!detected.cms) detected.cms = []
            detected.cms.push('Drupal')
        }
        if (htmlLower.includes('shopify')) {
            if (!detected.cms) detected.cms = []
            detected.cms.push('Shopify')
        }
        if (htmlLower.includes('ghost')) {
            if (!detected.cms) detected.cms = []
            detected.cms.push('Ghost')
        }

        // Backend Detection (from headers)
        const serverHeader = headers['server'] || headers['x-powered-by'] || ''
        if (serverHeader.toLowerCase().includes('nginx')) {
            if (!detected.backend) detected.backend = []
            detected.backend.push('Nginx')
        }
        if (serverHeader.toLowerCase().includes('apache')) {
            if (!detected.backend) detected.backend = []
            detected.backend.push('Apache')
        }
        if (serverHeader.toLowerCase().includes('node')) {
            if (!detected.backend) detected.backend = []
            detected.backend.push('Node.js')
        }
        if (serverHeader.toLowerCase().includes('php')) {
            if (!detected.backend) detected.backend = []
            detected.backend.push('PHP')
        }

        // Hosting/CDN Detection (from headers)
        if (headers['x-vercel-id'] || headers['x-vercel-deployment-url']) {
            if (!detected.hosting) detected.hosting = []
            detected.hosting.push('Vercel')
        }
        if (headers['x-nf-request-id'] || headers['x-nf-cache-status']) {
            if (!detected.hosting) detected.hosting = []
            detected.hosting.push('Netlify')
        }
        if (headers['cf-ray'] || headers['server']?.toLowerCase().includes('cloudflare')) {
            if (!detected.cdn) detected.cdn = []
            detected.cdn.push('Cloudflare')
        }

        return detected
    }

    const analyzeTechStack = async () => {
        if (!url) {
            setError('Please enter a URL!')
            return
        }

        setLoading(true)
        setError('')
        setAnalyzedStack(null)

        try {
            let fullUrl = url
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                fullUrl = `https://${url}`
            }

            // Fetch HTML
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}`
            const response = await fetch(proxyUrl)
            const data = await response.json()

            if (!data.contents) {
                throw new Error('Failed to fetch website data. Make sure the URL is valid and accessible.')
            }

            // Try to get headers (limited due to CORS)
            const headers: Record<string, string> = {
                'server': response.headers.get('techStackAnalyzer.server') || '',
                'x-powered-by': response.headers.get('techStackAnalyzer.x-powered-by') || '',
                'cf-ray': response.headers.get('techStackAnalyzer.cf-ray') || '',
                'x-vercel-id': response.headers.get('techStackAnalyzer.x-vercel-id') || '',
                'x-nf-request-id': response.headers.get('techStackAnalyzer.x-nf-request-id') || '',
            }

            const detected = detectTechStack(data.contents, headers)
            setAnalyzedStack(detected)
        } catch (err: any) {
            setError(err.message || 'Failed to analyze tech stack. Please try again or use Compose mode to build manually.')
        } finally {
            setLoading(false)
        }
    }

    const toggleTech = (category: string, tech: string) => {
        setComposedStack(prev => {
            const newStack = { ...prev }
            const categoryKey = category as keyof TechStack

            if (!newStack[categoryKey]) {
                newStack[categoryKey] = []
            }

            const techs = newStack[categoryKey] || []
            if (techs.includes(tech)) {
                newStack[categoryKey] = techs.filter(t => t !== tech)
            } else {
                newStack[categoryKey] = [...techs, tech]
            }

            return newStack
        })
    }

    const generateBadges = (stack: TechStack): string => {
        const badges: string[] = []

        Object.entries(stack).forEach(([category, techs]) => {
            if (techs && techs.length > 0) {
                techs.forEach((tech: string) => {
                    const badgeUrl = `https://img.shields.io/badge/${encodeURIComponent(tech)}-000000?style=for-the-badge&logo=${encodeURIComponent(tech.toLowerCase())}&logoColor=white`
                    badges.push(`![${tech}](${badgeUrl})`)
                })
            }
        })

        return badges.join('\n')
    }

    const handleCopyBadges = async (stack: TechStack) => {
        const badges = generateBadges(stack)
        try {
            await navigator.clipboard.writeText(badges)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            // Fallback
            const textarea = document.createElement('textarea') as HTMLTextAreaElement
            textarea.value = badges
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const currentStack = mode === 'analyze' ? analyzedStack : composedStack
    const hasStack = currentStack && Object.values(currentStack).some(techs => techs && techs.length > 0)

    return (
        <div className="max-w-full sm:max-w-5xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <Layers className="w-6 h-6 text-primary-600" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                            Tech Stack Analyzer & Composer
                        </h1>
                    </div>
                    <p className="text-sm sm:text-base text-neutral-600">
                        Analyze or compose tech stack from website - Useful for developers
                    </p>
                </div>

                {/* Mode Selector */}
                <div className="flex gap-2 p-1 bg-neutral-100 rounded-lg">
                    <button
                        onClick={() => setMode('analyze')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'analyze'
                            ? 'bg-white text-primary-700 shadow-sm'
                            : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                    >
                        Analyze
                    </button>
                    <button
                        onClick={() => setMode('compose')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'compose'
                            ? 'bg-white text-primary-700 shadow-sm'
                            : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                    >
                        Compose
                    </button>
                </div>

                {/* Analyze Mode */}
                {mode === 'analyze' && (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && analyzeTechStack()}
                            />
                            <button
                                onClick={analyzeTechStack}
                                disabled={loading}
                                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Search className="w-4 h-4" />
                                {loading ? 'Analyzing...' : 'Analyze'}
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {loading && (
                            <div className="text-center py-8 text-neutral-500">
                                Analyzing website tech stack...
                            </div>
                        )}
                    </div>
                )}

                {/* Compose Mode */}
                {mode === 'compose' && (
                    <div className="space-y-6">
                        <p className="text-sm text-neutral-600">
                            Select technologies to compose your tech stack. Click technologies to add/remove them.
                        </p>

                        <div className="space-y-4">
                            {techCategories.map(category => {
                                const categoryKey = category.name as keyof TechStack
                                const selectedTechs = composedStack[categoryKey] || []

                                return (
                                    <div key={category.name} className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                            {category.icon}
                                            {category.name === 'frontend' ? 'Frontend' : category.name === 'backend' ? 'Backend' : category.name === 'database' ? 'Database' : category.name === 'hosting' ? 'Hosting' : category.name === 'cms' ? 'CMS' : 'CDN'}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {category.technologies.map(tech => (
                                                <button
                                                    key={tech}
                                                    onClick={() => toggleTech(category.name, tech)}
                                                    className={`px-3 py-1 rounded-md text-sm transition-colors ${selectedTechs.includes(tech)
                                                        ? 'bg-primary-600 text-white'
                                                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                                        }`}
                                                >
                                                    {tech}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Results / Stack Display */}
                {hasStack && (
                    <div className="space-y-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-primary-900 flex items-center gap-2">
                                <Palette className="w-5 h-5" />
                                Tech Stack
                            </h2>
                            <button
                                onClick={() => handleCopyBadges(currentStack!)}
                                className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy Badges
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(currentStack!).map(([category, techs]) => {
                                if (!techs || techs.length === 0) return null

                                const categoryInfo = techCategories.find(c => c.name === category)

                                return (
                                    <div key={category} className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                                            {categoryInfo?.icon}
                                            {categoryLabels[category] || category}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {techs.map((tech: string) => (
                                                <span
                                                    key={tech}
                                                    className="px-3 py-1 bg-white border border-neutral-200 rounded-md text-sm"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Badges Preview */}
                        <div className="mt-4 p-3 bg-white rounded border border-neutral-200">
                            <label className="block text-xs font-medium text-neutral-500 mb-2">
                                Badges Preview
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {Object.values(currentStack!).flat().map(tech => (
                                    <span
                                        key={tech}
                                        className="px-2 py-1 bg-neutral-900 text-white rounded text-xs font-mono"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tips */}
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                        Tips
                    </h3>
                    <p className="text-sm text-neutral-600">
                        Use Analyze mode to automatically detect technologies from a website. Use Compose mode to manually build your tech stack and generate badges for README or documentation.
                    </p>
                </div>
            </div>
        </div>
    )
}

