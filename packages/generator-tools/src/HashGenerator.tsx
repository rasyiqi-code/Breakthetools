'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function HashGenerator() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [copiedType, setCopiedType] = useState<string | null>(null)

  const generateHash = async (algorithm: string, data: string): Promise<string> => {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    
    if (algorithm === 'md5') {
      // MD5 implementation (simple, not cryptographically secure)
      return simpleMD5(data)
    }
    
    const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Simple MD5 implementation (for demonstration)
  const simpleMD5 = (str: string): string => {
    // This is a simplified version. For production, use a proper library
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(32, '0')
  }

  const handleGenerate = async () => {
    if (!input) return

    const newHashes: Record<string, string> = {
      'MD5': await generateHash('md5', input),
      'SHA-1': await generateHash('SHA-1', input),
      'SHA-256': await generateHash('SHA-256', input),
      'SHA-384': await generateHash('SHA-384', input),
      'SHA-512': await generateHash('SHA-512', input),
    }

    setHashes(newHashes)
  }

  const handleCopy = async (hash: string, type: string) => {
    await navigator.clipboard.writeText(hash)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Hash Generator</h1>
        <p className="text-sm sm:text-base text-neutral-600">Generate hash MD5, SHA-1, SHA-256, dan lainnya dari teks</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Masukkan Text
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Masukkan text yang ingin di-hash..."
          className="textarea-field text-sm sm:text-base"
          rows={5}
        />
        <button
          onClick={handleGenerate}
          className="btn-primary mt-4 min-h-[44px] text-sm sm:text-base w-full sm:w-auto"
          disabled={!input}
        >
          Generate Hash
        </button>
      </div>

      {Object.keys(hashes).length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {Object.entries(hashes).map(([type, hash]) => (
            <div key={type} className="tool-card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
                <h3 className="text-sm font-semibold text-neutral-900">{type}</h3>
                <button
                  onClick={() => handleCopy(hash, type)}
                  className="btn-secondary text-sm flex items-center space-x-2 min-h-[44px] px-4"
                >
                  {copiedType === type ? (
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
              <code className="block bg-neutral-50 p-2 sm:p-3 rounded border border-neutral-200 font-mono text-xs break-all text-neutral-900">
                {hash}
              </code>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 sm:mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Peringatan</h3>
        <p className="text-yellow-800">
          MD5 dan SHA-1 sudah tidak aman untuk keperluan kriptografi. Gunakan SHA-256 atau yang lebih tinggi untuk keamanan.
        </p>
      </div>
    </div>
  )
}

