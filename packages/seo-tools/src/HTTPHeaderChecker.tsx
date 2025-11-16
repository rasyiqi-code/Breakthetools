'use client'

import { useState } from 'react'
import { Globe, Search, Copy, Check } from 'lucide-react'

export function HTTPHeaderChecker() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [headers, setHeaders] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const checkHeaders = async () => {
    if (!url) {
      alert('Masukkan URL terlebih dahulu!')
      return
    }

    setLoading(true)
    setError('')
    setHeaders({})

    try {
      // Fetch headers menggunakan API
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, {
        method: 'HEAD',
        mode: 'cors'
      })

      // Get headers from response
      const headerMap: Record<string, string> = {}
      
      // Note: CORS proxy mungkin tidak return semua headers
      // Untuk production, perlu backend API
      headerMap['Status'] = `${response.status} ${response.statusText}`
      headerMap['Content-Type'] = response.headers.get('content-type') || 'N/A'
      headerMap['Content-Length'] = response.headers.get('content-length') || 'N/A'
      
      // Try to get more info via fetch
      try {
        const fullResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
        const data = await fullResponse.json()
        
        if (data.status) {
          headerMap['HTTP Status'] = `${data.status.http_code} ${data.status.http_code_message || ''}`
        }
      } catch {}

      setHeaders(headerMap)
    } catch (err: any) {
      setError('Gagal mengambil headers. Coba URL lain atau gunakan browser extension untuk melihat headers lengkap.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    const headersText = Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
    await navigator.clipboard.writeText(headersText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">HTTP Header Checker</h1>
        <p className="text-sm sm:text-base text-neutral-600">Cek HTTP response headers dari website</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Masukkan URL
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
            onClick={checkHeaders}
            disabled={loading || !url}
            className="btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Checking...' : 'Check'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="text-xs sm:text-sm text-yellow-800">
            ⚠️ {error}
            <br />
            <span className="text-xs mt-2 block">
              Catatan: Karena CORS restrictions, tidak semua headers bisa diambil dari browser. 
              Untuk hasil lengkap, gunakan browser DevTools atau backend API.
            </span>
          </div>
        </div>
      )}

      {Object.keys(headers).length > 0 && (
        <div className="tool-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              Response Headers
            </h3>
            <button
              onClick={handleCopy}
              className="btn-secondary text-sm flex items-center space-x-2 min-h-[44px] px-4"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Semua</span>
                </>
              )}
            </button>
          </div>
          
          <div className="space-y-2">
            {Object.entries(headers).map(([key, value]) => (
              <div
                key={key}
                className="flex flex-col sm:flex-row items-start sm:items-start gap-2 sm:gap-4 p-2 sm:p-3 bg-neutral-50 rounded border border-neutral-200"
              >
                <div className="font-mono text-xs sm:text-sm font-semibold text-neutral-700 sm:min-w-[200px]">
                  {key}:
                </div>
                <div className="font-mono text-xs sm:text-sm text-neutral-900 break-all flex-1">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

