'use client'

import { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'

export function UUIDGenerator() {
  const [uuids, setUuids] = useState<string[]>([])
  const [count, setCount] = useState(1)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const handleGenerate = () => {
    const newUuids = Array.from({ length: count }, () => generateUUID())
    setUuids(newUuids)
    setCopiedIndex(null)
  }

  const handleCopy = async (uuid: string, index: number) => {
    await navigator.clipboard.writeText(uuid)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(uuids.join('\n'))
    setCopiedIndex(-1)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">UUID / GUID Generator</h1>
        <p className="text-sm sm:text-base text-neutral-600">Generate UUID v4 untuk identifier unik dalam development</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-end gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 w-full sm:w-auto">
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Jumlah UUID
            </label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              min="1"
              max="100"
              className="input-field text-sm sm:text-base min-h-[44px]"
            />
          </div>
          <button
            onClick={handleGenerate}
            className="btn-primary flex items-center justify-center space-x-2 min-h-[44px] w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm sm:text-base">Generate</span>
          </button>
        </div>

        {uuids.length > 0 && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
              <label className="text-sm font-medium text-neutral-700">
                Hasil ({uuids.length} UUID)
              </label>
              <button
                onClick={handleCopyAll}
                className="btn-secondary text-sm flex items-center space-x-2 min-h-[44px] px-4"
              >
                {copiedIndex === -1 ? (
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

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uuids.map((uuid, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-neutral-50 p-2 sm:p-3 rounded border border-neutral-200 gap-2"
                >
                  <code className="font-mono text-xs sm:text-sm text-neutral-900 break-all flex-1">{uuid}</code>
                  <button
                    onClick={() => handleCopy(uuid, index)}
                    className="ml-2 text-neutral-600 hover:text-primary-600 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Tentang UUID v4</h3>
        <p className="text-blue-800">
          UUID (Universally Unique Identifier) v4 menggunakan angka random untuk menghasilkan identifier yang unik.
          Kemungkinan collision sangat kecil (1 dalam 5.3 × 10³⁶).
        </p>
      </div>
    </div>
  )
}

