'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export function CaseConverter() {
  const t = useTranslations('tools')
  const [text, setText] = useState('')

  const convertCase = (type: string) => {
    let result = text

    switch (type) {
      case 'uppercase':
        result = text.toUpperCase()
        break
      case 'lowercase':
        result = text.toLowerCase()
        break
      case 'titlecase':
        result = text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
        break
      case 'sentencecase':
        result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (char) => char.toUpperCase())
        break
      case 'camelcase':
        result = text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
          .replace(/^[A-Z]/, (char) => char.toLowerCase())
        break
      case 'pascalcase':
        result = text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
          .replace(/^[a-z]/, (char) => char.toUpperCase())
        break
      case 'snakecase':
        result = text
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '')
        break
      case 'kebabcase':
        result = text
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
        break
      case 'toggle':
        result = text
          .split('')
          .map((char) => (char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()))
          .join('')
        break
    }

    setText(result)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('caseConverter.title')}</h1>
        <p className="text-sm sm:text-base text-neutral-600">{t('caseConverter.description')}</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">{t('caseConverter.enterText')}</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('caseConverter.placeholder')}
          className="textarea-field text-sm sm:text-base"
          rows={10}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        <button
          onClick={() => convertCase('uppercase')}
          className="btn-secondary py-2.5 sm:py-3 text-xs sm:text-sm min-h-[44px]"
          disabled={!text}
        >
          {t('caseConverter.cases.uppercase')}
        </button>
        <button
          onClick={() => convertCase('lowercase')}
          className="btn-secondary py-2.5 sm:py-3 text-xs sm:text-sm min-h-[44px]"
          disabled={!text}
        >
          {t('caseConverter.cases.lowercase')}
        </button>
        <button
          onClick={() => convertCase('titlecase')}
          className="btn-secondary py-2.5 sm:py-3 text-xs sm:text-sm min-h-[44px]"
          disabled={!text}
        >
          {t('caseConverter.cases.titlecase')}
        </button>
        <button
          onClick={() => convertCase('sentencecase')}
          className="btn-secondary py-2.5 sm:py-3 text-xs sm:text-sm min-h-[44px]"
          disabled={!text}
        >
          {t('caseConverter.cases.sentencecase')}
        </button>
        <button
          onClick={() => convertCase('camelcase')}
          className="btn-secondary py-2.5 sm:py-3 text-xs sm:text-sm min-h-[44px]"
          disabled={!text}
        >
          {t('caseConverter.cases.camelcase')}
        </button>
        <button
          onClick={() => convertCase('pascalcase')}
          className="btn-secondary py-2.5 sm:py-3 text-xs sm:text-sm min-h-[44px]"
          disabled={!text}
        >
          {t('caseConverter.cases.pascalcase')}
        </button>
        <button
          onClick={() => convertCase('snakecase')}
          className="btn-secondary py-2.5 sm:py-3 text-xs sm:text-sm min-h-[44px]"
          disabled={!text}
        >
          {t('caseConverter.cases.snakecase')}
        </button>
        <button
          onClick={() => convertCase('kebabcase')}
          className="btn-secondary py-2.5 sm:py-3 text-xs sm:text-sm min-h-[44px]"
          disabled={!text}
        >
          {t('caseConverter.cases.kebabcase')}
        </button>
        <button
          onClick={() => convertCase('toggle')}
          className="btn-secondary py-2.5 sm:py-3 text-xs sm:text-sm min-h-[44px]"
          disabled={!text}
        >
          {t('caseConverter.cases.toggle')}
        </button>
      </div>
    </div>
  )
}

