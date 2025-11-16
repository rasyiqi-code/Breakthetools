'use client'

import { useState } from 'react'
import { Globe, Copy, Check, RefreshCw } from 'lucide-react'

export function URLParser() {
  const [url, setUrl] = useState('')
  const [parsedUrl, setParsedUrl] = useState<any>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const parseURL = () => {
    if (!url.trim()) {
      setError('Masukkan URL terlebih dahulu!')
      return
    }

    try {
      // Tambahkan protocol jika tidak ada
      let urlToParse = url.trim()
      if (!urlToParse.match(/^https?:\/\//)) {
        urlToParse = 'https://' + urlToParse
      }

      const urlObj = new URL(urlToParse)
      
      const parsed = {
        fullUrl: urlObj.href,
        protocol: urlObj.protocol.replace(':', ''),
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80'),
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        origin: urlObj.origin,
        queryParams: {} as Record<string, string>,
        username: urlObj.username || '',
        password: urlObj.password || '',
      }

      // Parse query parameters
      urlObj.searchParams.forEach((value, key) => {
        parsed.queryParams[key] = value
      })

      setParsedUrl(parsed)
      setError('')
    } catch (err: any) {
      setError('URL tidak valid: ' + (err.message || 'Format URL salah'))
      setParsedUrl(null)
    }
  }

  const buildURL = () => {
    if (!parsedUrl) return

    try {
      const urlObj = new URL(parsedUrl.origin + parsedUrl.pathname)
      
      // Add query parameters
      Object.entries(parsedUrl.queryParams).forEach(([key, value]) => {
        if (key && value) {
          urlObj.searchParams.set(key, value as string)
        }
      })

      // Add hash
      if (parsedUrl.hash) {
        urlObj.hash = parsedUrl.hash
      }

      setUrl(urlObj.href)
      setError('')
    } catch (err: any) {
      setError('Gagal membangun URL: ' + (err.message || 'Format tidak valid'))
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const addQueryParam = () => {
    if (!parsedUrl) return
    
    const key = prompt('Masukkan nama parameter:')
    const value = prompt('Masukkan nilai parameter:')
    
    if (key && value) {
      setParsedUrl({
        ...parsedUrl,
        queryParams: {
          ...parsedUrl.queryParams,
          [key]: value
        }
      })
    }
  }

  const removeQueryParam = (key: string) => {
    if (!parsedUrl) return
    
    const newParams = { ...parsedUrl.queryParams }
    delete newParams[key]
    
    setParsedUrl({
      ...parsedUrl,
      queryParams: newParams
    })
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">URL Parser & Builder</h1>
        <p className="text-sm sm:text-base text-neutral-600">Parse URL menjadi komponen atau build URL dari komponen</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Masukkan URL
        </label>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/path?key=value#hash"
            className="flex-1 px-3 sm:px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base min-h-[44px]"
            onKeyDown={(e) => e.key === 'Enter' && parseURL()}
          />
          <button
            onClick={parseURL}
            className="btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
          >
            <Globe className="w-4 h-4" />
            Parse
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 mb-4">
            <div className="text-xs sm:text-sm text-red-800">⚠️ {error}</div>
          </div>
        )}
      </div>

      {parsedUrl && (
        <>
          <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-neutral-900">URL Components</h2>
              <button
                onClick={buildURL}
                className="btn-secondary flex items-center justify-center gap-2 text-sm min-h-[44px] px-4"
              >
                <RefreshCw className="w-4 h-4" />
                Rebuild URL
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-600 mb-1 block">Protocol</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={parsedUrl.protocol}
                      onChange={(e) => setParsedUrl({ ...parsedUrl, protocol: e.target.value })}
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(parsedUrl.protocol, 'protocol')}
                      className="p-2 hover:bg-neutral-100 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      {copied === 'protocol' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-600 mb-1 block">Hostname</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={parsedUrl.hostname}
                      onChange={(e) => setParsedUrl({ ...parsedUrl, hostname: e.target.value })}
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(parsedUrl.hostname, 'hostname')}
                      className="p-2 hover:bg-neutral-100 rounded"
                    >
                      {copied === 'hostname' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-600 mb-1 block">Port</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={parsedUrl.port}
                      onChange={(e) => setParsedUrl({ ...parsedUrl, port: e.target.value })}
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(parsedUrl.port, 'port')}
                      className="p-2 hover:bg-neutral-100 rounded"
                    >
                      {copied === 'port' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-600 mb-1 block">Pathname</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={parsedUrl.pathname}
                      onChange={(e) => setParsedUrl({ ...parsedUrl, pathname: e.target.value })}
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(parsedUrl.pathname, 'pathname')}
                      className="p-2 hover:bg-neutral-100 rounded"
                    >
                      {copied === 'pathname' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-600 mb-1 block">Hash</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={parsedUrl.hash}
                      onChange={(e) => setParsedUrl({ ...parsedUrl, hash: e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value })}
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(parsedUrl.hash, 'hash')}
                      className="p-2 hover:bg-neutral-100 rounded"
                    >
                      {copied === 'hash' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-600 mb-1 block">Full URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={parsedUrl.fullUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-neutral-50"
                    />
                    <button
                      onClick={() => copyToClipboard(parsedUrl.fullUrl, 'full')}
                      className="p-2 hover:bg-neutral-100 rounded"
                    >
                      {copied === 'full' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="tool-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-neutral-900">Query Parameters</h2>
              <button
                onClick={addQueryParam}
                className="btn-secondary text-sm min-h-[44px] px-4"
              >
                + Tambah Parameter
              </button>
            </div>

            {Object.keys(parsedUrl.queryParams).length === 0 ? (
              <div className="text-sm text-neutral-500 text-center py-4">
                Tidak ada query parameters
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(parsedUrl.queryParams).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newParams = { ...parsedUrl.queryParams }
                        delete newParams[key]
                        newParams[e.target.value] = value as string
                        setParsedUrl({ ...parsedUrl, queryParams: newParams })
                      }}
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded text-sm"
                      placeholder="Parameter name"
                    />
                    <span className="text-neutral-400">=</span>
                    <input
                      type="text"
                      value={value as string}
                      onChange={(e) => setParsedUrl({
                        ...parsedUrl,
                        queryParams: { ...parsedUrl.queryParams, [key]: e.target.value }
                      })}
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded text-sm"
                      placeholder="Parameter value"
                    />
                    <button
                      onClick={() => removeQueryParam(key)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

