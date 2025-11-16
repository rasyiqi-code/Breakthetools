'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function URLEncoderDecoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [copied, setCopied] = useState(false)

  const handleEncode = () => {
    const encoded = encodeURIComponent(input)
    setOutput(encoded)
  }

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(input)
      setOutput(decoded)
    } catch (e) {
      setOutput('Error: Invalid URL encoding')
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
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">URL Encoder / Decoder</h1>
        <p className="text-sm sm:text-base text-neutral-600">Encode dan decode URL atau query parameters</p>
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
              {mode === 'encode' ? 'Original URL' : 'Encoded URL'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'encode' 
                  ? 'https://example.com/search?query=hello world'
                  : 'https://example.com/search?query=hello%20world'
              }
              className="textarea-field font-mono text-sm sm:text-base"
              rows={12}
            />
          </div>

          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
              <label className="text-sm font-medium text-neutral-700">
                {mode === 'encode' ? 'Encoded URL' : 'Decoded URL'}
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
            <textarea
              value={output}
              readOnly
              placeholder="Output akan muncul di sini..."
              className="textarea-field font-mono bg-neutral-50 text-sm sm:text-base"
              rows={12}
            />
          </div>
        </div>

        <button
          onClick={handleProcess}
          className="btn-primary w-full sm:w-auto mt-4 min-h-[44px] text-sm sm:text-base"
          disabled={!input}
        >
          {mode === 'encode' ? 'Encode URL' : 'Decode URL'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Info</h3>
        <p className="text-blue-800">
          URL encoding mengubah karakter khusus menjadi format %XX. Misalnya, spasi menjadi %20,
          dan karakter & menjadi %26. Ini penting untuk memastikan URL tetap valid.
        </p>
      </div>
    </div>
  )
}

