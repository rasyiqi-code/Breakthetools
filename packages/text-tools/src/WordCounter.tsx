'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface WordCountStats {
  characters: number
  charactersNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  readingTime: number
}

export function WordCounter() {
  const t = useTranslations('tools.wordCounter')
  const [text, setText] = useState('')
  const [stats, setStats] = useState<WordCountStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0
  })

  useEffect(() => {
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0
    const paragraphs = text.trim() ? text.split(/\n\n+/).filter(p => p.trim()).length : 0
    const readingTime = Math.ceil(words / 200) // Asumsi 200 kata per menit

    setStats({
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime
    })
  }, [text])

  const handleClear = () => {
    setText('')
  }

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('title')}</h1>
        <p className="text-sm sm:text-base text-neutral-600">{t('description')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="tool-card p-3 sm:p-4">
          <div className="text-2xl sm:text-3xl font-bold text-primary-600">{stats.words.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-neutral-600">{t('words')}</div>
        </div>
        <div className="tool-card p-3 sm:p-4">
          <div className="text-2xl sm:text-3xl font-bold text-primary-600">{stats.characters.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-neutral-600">{t('characters')}</div>
        </div>
        <div className="tool-card p-3 sm:p-4">
          <div className="text-2xl sm:text-3xl font-bold text-primary-600">{stats.charactersNoSpaces.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-neutral-600">{t('charactersNoSpaces')}</div>
        </div>
        <div className="tool-card p-3 sm:p-4">
          <div className="text-2xl sm:text-3xl font-bold text-primary-600">{stats.sentences.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-neutral-600">{t('sentences')}</div>
        </div>
        <div className="tool-card p-3 sm:p-4">
          <div className="text-2xl sm:text-3xl font-bold text-primary-600">{stats.paragraphs.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-neutral-600">{t('paragraphs')}</div>
        </div>
        <div className="tool-card p-3 sm:p-4">
          <div className="text-2xl sm:text-3xl font-bold text-primary-600">{stats.readingTime}</div>
          <div className="text-xs sm:text-sm text-neutral-600">{t('readingTime')}</div>
        </div>
      </div>

      <div className="tool-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
          <label className="text-sm font-medium text-neutral-700">{t('enterOrPasteText')}</label>
          <button
            onClick={handleClear}
            className="btn-secondary text-sm min-h-[44px] px-4"
            disabled={!text}
          >
            {t('clear')}
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('placeholder')}
          className="textarea-field text-sm sm:text-base"
          rows={12}
        />
      </div>
    </div>
  )
}

