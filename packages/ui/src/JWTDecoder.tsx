'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function JWTDecoder() {
  const [jwt, setJwt] = useState('')
  const [header, setHeader] = useState<any>(null)
  const [payload, setPayload] = useState<any>(null)
  const [error, setError] = useState('')
  const [copiedPart, setCopiedPart] = useState<string | null>(null)

  const decodeJWT = () => {
    try {
      const parts = jwt.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format')
      }

      const decodeBase64 = (str: string) => {
        // Add padding if needed
        const padding = '='.repeat((4 - (str.length % 4)) % 4)
        const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/')
        return JSON.parse(atob(base64))
      }

      const decodedHeader = decodeBase64(parts[0])
      const decodedPayload = decodeBase64(parts[1])

      setHeader(decodedHeader)
      setPayload(decodedPayload)
      setError('')
    } catch (e: any) {
      setError('Invalid JWT token')
      setHeader(null)
      setPayload(null)
    }
  }

  const handleCopy = async (data: any, part: string) => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopiedPart(part)
    setTimeout(() => setCopiedPart(null), 2000)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('id-ID')
  }

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">JWT Decoder</h1>
        <p className="text-sm sm:text-base text-neutral-600">Decode dan inspect JWT (JSON Web Token)</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Paste JWT Token
        </label>
        <textarea
          value={jwt}
          onChange={(e) => setJwt(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          className="textarea-field font-mono text-xs sm:text-sm"
          rows={4}
        />
        <button
          onClick={decodeJWT}
          className="btn-primary mt-4 min-h-[44px] text-sm sm:text-base w-full sm:w-auto"
          disabled={!jwt}
        >
          Decode JWT
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="text-xs sm:text-sm font-semibold text-red-900">{error}</div>
        </div>
      )}

      {header && payload && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="tool-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900">Header</h3>
              <button
                onClick={() => handleCopy(header, 'header')}
                className="btn-secondary text-sm flex items-center space-x-2 min-h-[44px] px-4"
              >
                {copiedPart === 'header' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-neutral-900 text-green-400 p-3 sm:p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(header, null, 2)}
            </pre>
          </div>

          <div className="tool-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900">Payload</h3>
              <button
                onClick={() => handleCopy(payload, 'payload')}
                className="btn-secondary text-sm flex items-center space-x-2 min-h-[44px] px-4"
              >
                {copiedPart === 'payload' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-neutral-900 text-green-400 p-3 sm:p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(payload, null, 2)}
            </pre>
            
            {(payload.iat || payload.exp || payload.nbf) && (
              <div className="mt-4 space-y-2 text-xs sm:text-sm">
                {payload.iat && (
                  <div className="flex flex-col sm:flex-row justify-between gap-1">
                    <span className="text-neutral-600">Issued At:</span>
                    <span className="font-medium">{formatDate(payload.iat)}</span>
                  </div>
                )}
                {payload.exp && (
                  <div className="flex flex-col sm:flex-row justify-between gap-1">
                    <span className="text-neutral-600">Expires:</span>
                    <span className={`font-medium ${
                      Date.now() / 1000 > payload.exp ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatDate(payload.exp)}
                    </span>
                  </div>
                )}
                {payload.nbf && (
                  <div className="flex flex-col sm:flex-row justify-between gap-1">
                    <span className="text-neutral-600">Not Before:</span>
                    <span className="font-medium">{formatDate(payload.nbf)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 sm:mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Peringatan</h3>
        <p className="text-yellow-800">
          Tool ini hanya men-decode JWT, tidak memverifikasi signature. Jangan gunakan token JWT yang sensitive di sini.
          Semua proses dilakukan di browser Anda (client-side).
        </p>
      </div>
    </div>
  )
}

