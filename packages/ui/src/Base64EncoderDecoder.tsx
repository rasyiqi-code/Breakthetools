'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function Base64EncoderDecoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleEncode = () => {
    try {
      const encoded = btoa(input)
      setOutput(encoded)
      setError('')
    } catch (e: any) {
      setError(e.message)
      setOutput('')
    }
  }

  const handleDecode = () => {
    try {
      const decoded = atob(input)
      setOutput(decoded)
      setError('')
    } catch (e: any) {
      setError('Invalid Base64 string')
      setOutput('')
    }
  }

  const handleProcess = () => {
    if (mode === 'encode') {
      handleEncode()
    } else {
      handleDecode()
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Base64 Encoder / Decoder</h1>
        <p className="text-sm sm:text-base text-neutral-600">Encode dan decode text ke/dari Base64</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => setMode('encode')}
            className={`flex-1 py-2 px-3 sm:px-4 rounded font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${
              mode === 'encode'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`flex-1 py-2 px-3 sm:px-4 rounded font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${
              mode === 'decode'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
            }`}
          >
            Decode
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-3 block">
              {mode === 'encode' ? 'Text' : 'Base64'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Masukkan text...' : 'Masukkan Base64...'}
              className="textarea-field font-mono text-sm sm:text-base"
              rows={12}
            />
          </div>

          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
              <label className="text-sm font-medium text-neutral-700">
                {mode === 'encode' ? 'Base64' : 'Text'}
              </label>
              {output && (
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
                      <span>Salin</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-2 sm:p-3 mb-3 text-xs sm:text-sm text-red-700">
                {error}
              </div>
            )}
            
            <textarea
              value={output}
              readOnly
              placeholder="Output akan muncul di sini..."
              className="textarea-field font-mono bg-neutral-50 text-sm sm:text-base"
              rows={error ? 10 : 12}
            />
          </div>
        </div>

        <button
          onClick={handleProcess}
          className="btn-primary w-full sm:w-auto mt-4 min-h-[44px] text-sm sm:text-base"
          disabled={!input}
        >
          {mode === 'encode' ? 'Encode ke Base64' : 'Decode dari Base64'}
        </button>
      </div>
    </div>
  )
}

