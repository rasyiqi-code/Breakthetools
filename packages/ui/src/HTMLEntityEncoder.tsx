'use client'

import { useState } from 'react'
import { Code, ArrowLeftRight, Copy, Check } from 'lucide-react'

export function HTMLEntityEncoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [encodeMode, setEncodeMode] = useState<'special' | 'all'>('special')
  const [copied, setCopied] = useState(false)

  const encodeHTML = (text: string, encodeAll: boolean = false): string => {
    if (!text) return ''

    if (encodeAll) {
      // Encode semua karakter sebagai numeric entities
      return text.split('').map(char => {
        const code = char.charCodeAt(0)
        return `&#${code};`
      }).join('')
    }

    // Map karakter khusus ke HTML entities
    const entityMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    }

    // Encode karakter khusus
    let encoded = text.replace(/[&<>"'`=\/]/g, (char) => entityMap[char] || char)

    // Encode karakter non-ASCII
    encoded = encoded.replace(/[\u0080-\uFFFF]/g, (char) => {
      return '&#x' + char.charCodeAt(0).toString(16).toUpperCase() + ';'
    })

    return encoded
  }

  const decodeHTML = (text: string): string => {
    if (!text) return ''

    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value || textarea.textContent || ''
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    if (mode === 'encode') {
      setOutput(encodeHTML(value, encodeMode === 'all'))
    } else {
      setOutput(decodeHTML(value))
    }
  }

  const handleEncodeModeChange = (newMode: 'special' | 'all') => {
    setEncodeMode(newMode)
    if (mode === 'encode' && input) {
      setOutput(encodeHTML(input, newMode === 'all'))
    }
  }

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode)
    // Swap input and output
    const temp = input
    setInput(output)
    setOutput(temp)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">HTML Entity Encoder/Decoder</h1>
        <p className="text-sm sm:text-base text-neutral-600">Encode dan decode HTML entities</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
          <button
            onClick={() => handleModeChange('encode')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${mode === 'encode'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
          >
            Encode
          </button>
          <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
          <button
            onClick={() => handleModeChange('decode')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${mode === 'decode'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
          >
            Decode
          </button>
        </div>

        {mode === 'encode' && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4 p-3 bg-neutral-50 rounded-lg">
            <label className="text-xs text-neutral-600 font-medium">Encode Mode:</label>
            <button
              onClick={() => handleEncodeModeChange('special')}
              className={`px-3 py-1.5 rounded text-xs sm:text-sm transition-colors min-h-[44px] ${encodeMode === 'special'
                ? 'bg-primary-600 text-white font-medium'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300'
                }`}
            >
              Karakter Khusus
            </button>
            <button
              onClick={() => handleEncodeModeChange('all')}
              className={`px-3 py-1.5 rounded text-xs sm:text-sm transition-colors min-h-[44px] ${encodeMode === 'all'
                ? 'bg-primary-600 text-white font-medium'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300'
                }`}
            >
              Semua Karakter
            </button>
          </div>
        )}

        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          {mode === 'encode' ? 'Plain Text' : 'HTML Entities'}
        </label>
        <textarea
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={mode === 'encode' ? 'Masukkan teks untuk di-encode...' : 'Masukkan HTML entities untuk di-decode...'}
          rows={8}
          className="w-full px-3 sm:px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-xs sm:text-sm"
        />
      </div>

      {(output || (input && mode === 'encode')) && (
        <div className="tool-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
            <label className="text-sm font-medium text-neutral-700">
              {mode === 'encode' ? 'HTML Entities' : 'Plain Text'}
            </label>
            {output && (
              <button
                onClick={copyToClipboard}
                className="btn-secondary flex items-center gap-2 text-sm min-h-[44px] px-4"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>
          <div className="p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap break-words">
              {output || (mode === 'encode' ? encodeHTML(input, encodeMode === 'all') : '')}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

