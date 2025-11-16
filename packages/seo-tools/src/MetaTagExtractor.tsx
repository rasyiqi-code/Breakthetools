'use client'

import { useState } from 'react'
import { Search, Globe, Copy, Check, ExternalLink } from 'lucide-react'

export function MetaTagExtractor() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [metaData, setMetaData] = useState<{
    title: string
    description: string
    keywords: string
    ogTitle: string
    ogDescription: string
    ogImage: string
    canonical: string
  } | null>(null)
  const [error, setError] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const extractMeta = async () => {
    if (!url) {
      alert('Masukkan URL terlebih dahulu!')
      return
    }

    setLoading(true)
    setError('')
    setMetaData(null)

    try {
      // Use CORS proxy untuk fetch (client-side)
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl)
      const data = await response.json()
      
      if (!data.contents) {
        throw new Error('Gagal mengambil data dari URL')
      }

      // Parse HTML
      const parser = new DOMParser()
      const doc = parser.parseFromString(data.contents, 'text/html')

      const extractContent = (selector: string, attribute?: string) => {
        const element = doc.querySelector(selector)
        if (attribute) {
          return element?.getAttribute(attribute) || ''
        }
        return element?.textContent || ''
      }

      setMetaData({
        title: extractContent('title') || extractContent('meta[property="og:title"]', 'content'),
        description: extractContent('meta[name="description"]', 'content') || extractContent('meta[property="og:description"]', 'content'),
        keywords: extractContent('meta[name="keywords"]', 'content'),
        ogTitle: extractContent('meta[property="og:title"]', 'content'),
        ogDescription: extractContent('meta[property="og:description"]', 'content'),
        ogImage: extractContent('meta[property="og:image"]', 'content'),
        canonical: extractContent('link[rel="canonical"]', 'href')
      })
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil meta tags. Pastikan URL valid dan dapat diakses.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-5xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Meta Tag Extractor</h1>
        <p className="text-sm sm:text-base text-neutral-600">Ekstrak meta tags, Open Graph, dan informasi SEO dari website</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Masukkan URL Website
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="input-field flex-1 text-sm sm:text-base min-h-[44px]"
          />
          <button
            onClick={extractMeta}
            disabled={loading || !url}
            className="btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Mengambil...' : 'Ekstrak'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="text-xs sm:text-sm text-red-800">{error}</div>
        </div>
      )}

      {metaData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="tool-card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              Basic Meta Tags
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-neutral-600">Title</label>
                  <button
                    onClick={() => handleCopy(metaData.title, 'title')}
                    className="text-xs text-primary-600 hover:text-primary-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    {copiedField === 'title' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="bg-neutral-50 p-2 sm:p-3 rounded border border-neutral-200 text-xs sm:text-sm break-words">
                  {metaData.title || <span className="text-neutral-400">Tidak ditemukan</span>}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-neutral-600">Description</label>
                  <button
                    onClick={() => handleCopy(metaData.description, 'description')}
                    className="text-xs text-primary-600 hover:text-primary-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    {copiedField === 'description' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="bg-neutral-50 p-2 sm:p-3 rounded border border-neutral-200 text-xs sm:text-sm break-words">
                  {metaData.description || <span className="text-neutral-400">Tidak ditemukan</span>}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-neutral-600">Keywords</label>
                  <button
                    onClick={() => handleCopy(metaData.keywords, 'keywords')}
                    className="text-xs text-primary-600 hover:text-primary-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    {copiedField === 'keywords' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="bg-neutral-50 p-2 sm:p-3 rounded border border-neutral-200 text-xs sm:text-sm break-words">
                  {metaData.keywords || <span className="text-neutral-400">Tidak ditemukan</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="tool-card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              Open Graph Tags
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-600 mb-2 block">OG Title</label>
                <div className="bg-neutral-50 p-2 sm:p-3 rounded border border-neutral-200 text-xs sm:text-sm break-words">
                  {metaData.ogTitle || <span className="text-neutral-400">Tidak ditemukan</span>}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600 mb-2 block">OG Description</label>
                <div className="bg-neutral-50 p-2 sm:p-3 rounded border border-neutral-200 text-xs sm:text-sm break-words">
                  {metaData.ogDescription || <span className="text-neutral-400">Tidak ditemukan</span>}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600 mb-2 block">OG Image</label>
                <div className="bg-neutral-50 p-2 sm:p-3 rounded border border-neutral-200 text-xs sm:text-sm break-all">
                  {metaData.ogImage ? (
                    <a href={metaData.ogImage} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      {metaData.ogImage}
                    </a>
                  ) : (
                    <span className="text-neutral-400">Tidak ditemukan</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600 mb-2 block">Canonical URL</label>
                <div className="bg-neutral-50 p-2 sm:p-3 rounded border border-neutral-200 text-xs sm:text-sm break-all">
                  {metaData.canonical || <span className="text-neutral-400">Tidak ditemukan</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

