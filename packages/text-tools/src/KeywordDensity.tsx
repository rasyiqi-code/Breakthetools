'use client'

import { useState } from 'react'
import { Search, TrendingUp } from 'lucide-react'

interface KeywordData {
  keyword: string
  count: number
  density: number
}

export function KeywordDensity() {
  const [text, setText] = useState('')
  const [targetKeyword, setTargetKeyword] = useState('')
  const [results, setResults] = useState<KeywordData[]>([])
  const [topKeywords, setTopKeywords] = useState<KeywordData[]>([])

  const analyze = () => {
    if (!text.trim()) {
      alert('Masukkan teks terlebih dahulu!')
      return
    }

    const words = text.toLowerCase().match(/\b\w+\b/g) || []
    const totalWords = words.length

    if (totalWords === 0) {
      alert('Teks tidak mengandung kata yang valid!')
      return
    }

    // Analyze target keyword if provided
    if (targetKeyword.trim()) {
      const keyword = targetKeyword.toLowerCase().trim()
      const keywordWords = keyword.split(/\s+/)
      
      if (keywordWords.length === 1) {
        // Single word keyword
        const count = words.filter(w => w === keyword).length
        const density = (count / totalWords) * 100
        setResults([{ keyword, count, density }])
      } else {
        // Phrase keyword
        const phrase = keywordWords.join(' ')
        const textLower = text.toLowerCase()
        const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
        const matches = textLower.match(regex) || []
        const count = matches.length
        const density = (count / totalWords) * 100
        setResults([{ keyword, count, density }])
      }
    } else {
      setResults([])
    }

    // Get top keywords
    const wordCount: Record<string, number> = {}
    words.forEach(word => {
      if (word.length > 3) { // Ignore short words
        wordCount[word] = (wordCount[word] || 0) + 1
      }
    })

    const top = Object.entries(wordCount)
      .map(([keyword, count]) => ({
        keyword,
        count,
        density: (count / totalWords) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    setTopKeywords(top)
  }

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Keyword Density Checker</h1>
        <p className="text-sm sm:text-base text-neutral-600">Analisis kepadatan kata kunci dalam teks untuk SEO</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Masukkan Teks
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste atau ketik teks yang ingin dianalisis..."
              className="input-field min-h-[200px] text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Kata Kunci Target (opsional)
            </label>
            <input
              type="text"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              placeholder="Masukkan kata kunci yang ingin dicek"
              className="input-field text-sm sm:text-base min-h-[44px]"
            />
          </div>

          <button
            onClick={analyze}
            disabled={!text.trim()}
            className="btn-primary w-full min-h-[44px] text-sm sm:text-base"
          >
            Analisis Kepadatan Kata Kunci
          </button>
        </div>
      </div>

      {(results.length > 0 || topKeywords.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {results.length > 0 && (
            <div className="tool-card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                Hasil Kata Kunci Target
              </h3>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="bg-primary-50 p-3 sm:p-4 rounded-lg border border-primary-200">
                    <div className="text-xs sm:text-sm font-semibold text-neutral-900 mb-2">{result.keyword}</div>
                    <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
                      <span className="text-neutral-600">Jumlah:</span>
                      <span className="font-medium text-neutral-900">{result.count}x</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
                      <span className="text-neutral-600">Kepadatan:</span>
                      <span className="font-medium text-primary-600">{result.density.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topKeywords.length > 0 && (
            <div className="tool-card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                Top 20 Kata Kunci
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {topKeywords.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 sm:p-3 bg-neutral-50 rounded border border-neutral-200 gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-neutral-900 text-xs sm:text-sm truncate">{item.keyword}</div>
                      <div className="text-xs text-neutral-500">{item.count}x</div>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-primary-600 flex-shrink-0">
                      {item.density.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

