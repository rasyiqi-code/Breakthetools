'use client'

import { useState, useEffect } from 'react'
import { Globe, Copy, Check } from 'lucide-react'

export function IPChecker() {
  const [ip, setIp] = useState<string>('')
  const [userAgent, setUserAgent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Get User Agent (client-side only)
    setUserAgent(navigator.userAgent)

    // Fetch IP from external API
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        setIp(data.ip)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">What's My IP?</h1>
        <p className="text-sm sm:text-base text-neutral-600">Cek alamat IP publik dan User Agent browser Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900">IP Address</h3>
          </div>
          
          {loading ? (
            <div className="text-center py-6 sm:py-8 text-neutral-400">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
              <p className="text-xs sm:text-sm">Mengambil IP address...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200">
                <div className="text-xs sm:text-sm text-neutral-600 mb-2">IP Publik Anda</div>
                <div className="text-xl sm:text-2xl font-mono font-bold text-neutral-900 break-all">{ip || 'Tidak ditemukan'}</div>
              </div>
              
              <button
                onClick={() => handleCopy(ip)}
                className="btn-secondary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
                disabled={!ip}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin IP</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="tool-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900">User Agent</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200">
              <div className="text-xs sm:text-sm text-neutral-600 mb-2">Browser & OS Info</div>
              <div className="text-xs font-mono text-neutral-700 break-all">
                {userAgent}
              </div>
            </div>
            
            <button
              onClick={() => handleCopy(userAgent)}
              className="btn-secondary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin User Agent</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Info</h3>
        <p className="text-blue-800">
          IP Address yang ditampilkan adalah IP publik Anda (yang terlihat oleh website). 
          User Agent menunjukkan informasi browser dan sistem operasi Anda.
        </p>
      </div>
    </div>
  )
}

