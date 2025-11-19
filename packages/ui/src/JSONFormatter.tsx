'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function JSONFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      setError('')
    } catch (e: any) {
      setError(e.message)
      setOutput('')
    }
  }

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setError('')
    } catch (e: any) {
      setError(e.message)
      setOutput('')
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
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">JSON Formatter</h1>
        <p className="text-sm sm:text-base text-neutral-600">Format, validate, and minify JSON data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <label className="text-sm font-medium text-neutral-700 mb-3 block">Input JSON</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            className="textarea-field font-mono text-sm sm:text-base"
            rows={15}
          />
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={formatJSON}
              className="btn-primary flex-1 min-h-[44px] text-sm sm:text-base"
              disabled={!input}
            >
              Format & Validate
            </button>
            <button
              onClick={minifyJSON}
              className="btn-secondary flex-1 min-h-[44px] text-sm sm:text-base"
              disabled={!input}
            >
              Minify
            </button>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
            <label className="text-sm font-medium text-neutral-700">Output</label>
            {output && (
              <button
                onClick={handleCopy}
                className="btn-secondary text-sm flex items-center space-x-2 min-h-[44px] px-4"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 sm:p-4 mb-4">
              <div className="text-xs sm:text-sm font-semibold text-red-900 mb-1">Error:</div>
              <code className="text-xs text-red-700 break-all">{error}</code>
            </div>
          )}

          <textarea
            value={output}
            readOnly
            placeholder="Formatted JSON will appear here..."
            className="textarea-field font-mono bg-neutral-50 text-sm sm:text-base"
            rows={error ? 12 : 15}
          />
        </div>
      </div>
    </div>
  )
}

