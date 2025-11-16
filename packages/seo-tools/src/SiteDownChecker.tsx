'use client'

import { useState } from 'react'
import { Globe, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export function SiteDownChecker() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{
    isUp: boolean
    statusCode?: number
    responseTime?: number
    error?: string
  } | null>(null)

  const checkSite = async () => {
    if (!url) {
      alert('Masukkan URL terlebih dahulu!')
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const startTime = Date.now()
      let fullUrl = url
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = `https://${url}`
      }

      // Use CORS proxy untuk bypass CORS
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}`
      const response = await fetch(proxyUrl, { method: 'HEAD' })
      const endTime = Date.now()
      const responseTime = endTime - startTime

      if (response.ok) {
        setStatus({
          isUp: true,
          statusCode: 200,
          responseTime
        })
      } else {
        setStatus({
          isUp: false,
          statusCode: response.status,
          responseTime
        })
      }
    } catch (err: any) {
      setStatus({
        isUp: false,
        error: err.message || 'Gagal mengakses situs'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Site Down Checker</h1>
        <p className="text-sm sm:text-base text-neutral-600">Cek apakah website down atau tidak dapat diakses</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Masukkan URL
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com atau https://example.com"
            className="input-field flex-1 text-sm sm:text-base min-h-[44px]"
          />
          <button
            onClick={checkSite}
            disabled={loading || !url}
            className="btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Checking...' : 'Check'}
          </button>
        </div>
      </div>

      {status && (
        <div className="tool-card p-4 sm:p-6">
          <div className={`p-4 sm:p-6 rounded-lg border-2 ${
            status.isUp
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              {status.isUp ? (
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xl sm:text-2xl font-bold text-neutral-900">
                  {status.isUp ? 'Situs UP' : 'Situs DOWN'}
                </div>
                <div className="text-xs sm:text-sm text-neutral-600 break-words">{url}</div>
              </div>
            </div>

            {status.statusCode && (
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0">
                  <span className="text-neutral-600">Status Code:</span>
                  <span className="font-medium text-neutral-900">{status.statusCode}</span>
                </div>
                {status.responseTime && (
                  <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0">
                    <span className="text-neutral-600">Response Time:</span>
                    <span className="font-medium text-neutral-900">{status.responseTime}ms</span>
                  </div>
                )}
              </div>
            )}

            {status.error && (
              <div className="mt-3 flex items-start gap-2 text-xs sm:text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="break-words">{status.error}</span>
              </div>
            )}
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800">
            ⚠️ <strong>Catatan:</strong> Hasil ini berdasarkan akses dari browser Anda. Jika situs down untuk Anda tapi up untuk orang lain, mungkin ada masalah dengan koneksi atau firewall lokal.
          </div>
        </div>
      )}
    </div>
  )
}

