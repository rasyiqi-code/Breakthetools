'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function TextCleaner() {
  const t = useTranslations('tools')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const [options, setOptions] = useState({
    removeExtraSpaces: true,
    removeDuplicateLines: true,
    removeEmptyLines: true,
    trimLines: true,
    sortLines: false
  })

  const cleanText = () => {
    let result = input

    if (options.trimLines) {
      result = result.split('\n').map(line => line.trim()).join('\n')
    }

    if (options.removeExtraSpaces) {
      result = result.replace(/ +/g, ' ')
    }

    if (options.removeEmptyLines) {
      result = result.split('\n').filter(line => line.trim() !== '').join('\n')
    }

    if (options.removeDuplicateLines) {
      const lines = result.split('\n')
      result = [...new Set(lines)].join('\n')
    }

    if (options.sortLines) {
      const lines = result.split('\n')
      result = lines.sort().join('\n')
    }

    setOutput(result)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('textCleaner.title')}</h1>
        <p className="text-sm sm:text-base text-neutral-600">{t('textCleaner.description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <label className="text-sm font-medium text-neutral-700 mb-3 block">{t('textCleaner.inputText')}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('textCleaner.inputPlaceholder')}
            className="textarea-field text-sm sm:text-base"
            rows={12}
          />
        </div>

        <div className="tool-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
            <label className="text-sm font-medium text-neutral-700">{t('textCleaner.outputText')}</label>
            <button
              onClick={handleCopy}
              className="btn-secondary text-sm flex items-center space-x-2 min-h-[44px] px-4"
              disabled={!output}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t('textCleaner.copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t('textCleaner.copy')}</span>
                </>
              )}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder={t('textCleaner.outputPlaceholder')}
            className="textarea-field bg-neutral-50 text-sm sm:text-base"
            rows={12}
          />
        </div>
      </div>

      <div className="mt-4 sm:mt-6 tool-card p-4 sm:p-6">
        <h3 className="text-sm font-medium text-neutral-700 mb-4">{t('textCleaner.cleaningOptions')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <label className="flex items-center space-x-3 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={options.removeExtraSpaces}
              onChange={(e) => setOptions({ ...options, removeExtraSpaces: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700">{t('textCleaner.options.removeExtraSpaces')}</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={options.removeDuplicateLines}
              onChange={(e) => setOptions({ ...options, removeDuplicateLines: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700">{t('textCleaner.options.removeDuplicateLines')}</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={options.removeEmptyLines}
              onChange={(e) => setOptions({ ...options, removeEmptyLines: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700">{t('textCleaner.options.removeEmptyLines')}</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={options.trimLines}
              onChange={(e) => setOptions({ ...options, trimLines: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700">{t('textCleaner.options.trimLines')}</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={options.sortLines}
              onChange={(e) => setOptions({ ...options, sortLines: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700">{t('textCleaner.options.sortLines')}</span>
          </label>
        </div>
        <button
          onClick={cleanText}
          className="btn-primary mt-4 sm:mt-6 w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
        >
          {t('textCleaner.cleanText')}
        </button>
      </div>
    </div>
  )
}

