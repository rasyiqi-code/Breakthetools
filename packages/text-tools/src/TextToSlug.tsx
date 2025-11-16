'use client'

import { useState } from 'react'
import {Link, Copy, Check} from 'lucide-react'

export function TextToSlug() {
  const [text, setText] = useState('')
  const [slug, setSlug] = useState('')
  const [copied, setCopied] = useState(false)

  const convertToSlug = (input: string): string => {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  }

  const handleTextChange = (value: string) => {
    setText(value)
    setSlug(convertToSlug(value))
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(slug)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Text to Slug Converter</h1>
        <p className="text-sm sm:text-base text-neutral-600">Convert text menjadi URL-friendly slug</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Input Text
        </label>
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Masukkan teks yang ingin di-convert ke slug..."
          rows={6}
          className="w-full px-3 sm:px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
        />
      </div>

      {slug && (
        <div className="tool-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
            <label className="text-sm font-medium text-neutral-700">
              URL-Friendly Slug
            </label>
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
          </div>
          <div className="p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="flex items-center gap-2 text-neutral-700">
              <Link className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <span className="font-mono text-xs sm:text-sm break-all">{slug}</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-neutral-500 break-all">
            <strong>Preview URL:</strong> https://example.com/{slug || 'your-slug-here'}
          </div>
        </div>
      )}
    </div>
  )
}

