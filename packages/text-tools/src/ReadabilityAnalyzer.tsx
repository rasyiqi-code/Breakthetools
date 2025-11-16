'use client'

import { useState } from 'react'
import { FileText, TrendingUp } from 'lucide-react'

interface ReadabilityScore {
  fleschKincaid: number
  gradeLevel: string
  readingEase: string
  avgWordsPerSentence: number
  avgSyllablesPerWord: number
}

export function ReadabilityAnalyzer() {
  const [text, setText] = useState('')
  const [score, setScore] = useState<ReadabilityScore | null>(null)

  const countSyllables = (word: string): number => {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    word = word.replace(/^y/, '')
    const matches = word.match(/[aeiouy]{1,2}/g)
    return matches ? Math.max(1, matches.length) : 1
  }

  const analyze = () => {
    if (!text.trim()) {
      alert('Masukkan teks terlebih dahulu!')
      return
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = text.toLowerCase().match(/\b\w+\b/g) || []
    const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0)

    const avgWordsPerSentence = words.length / sentences.length
    const avgSyllablesPerWord = totalSyllables / words.length

    // Flesch Reading Ease Score
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)

    // Flesch-Kincaid Grade Level
    const gradeLevel = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59

    let readingEase = ''
    if (fleschScore >= 90) readingEase = 'Sangat Mudah (Siswa kelas 5)'
    else if (fleschScore >= 80) readingEase = 'Mudah (Siswa kelas 6)'
    else if (fleschScore >= 70) readingEase = 'Cukup Mudah (Siswa kelas 7)'
    else if (fleschScore >= 60) readingEase = 'Standar (Siswa kelas 8-9)'
    else if (fleschScore >= 50) readingEase = 'Agak Sulit (Siswa kelas 10-12)'
    else if (fleschScore >= 30) readingEase = 'Sulit (Perguruan Tinggi)'
    else readingEase = 'Sangat Sulit (Perguruan Tinggi Lanjutan)'

    let gradeLevelText = ''
    if (gradeLevel <= 6) gradeLevelText = 'Kelas 1-6 (SD)'
    else if (gradeLevel <= 9) gradeLevelText = 'Kelas 7-9 (SMP)'
    else if (gradeLevel <= 12) gradeLevelText = 'Kelas 10-12 (SMA)'
    else gradeLevelText = 'Perguruan Tinggi'

    setScore({
      fleschKincaid: Math.round(fleschScore * 10) / 10,
      gradeLevel: gradeLevelText,
      readingEase,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100
    })
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Readability Analyzer</h1>
        <p className="text-sm sm:text-base text-neutral-600">Analisis tingkat keterbacaan teks menggunakan Flesch-Kincaid</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Input Teks
          </h3>

          <div className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste atau ketik teks yang ingin dianalisis..."
              className="input-field min-h-[300px] sm:min-h-[400px] text-sm sm:text-base"
            />
            <button
              onClick={analyze}
              disabled={!text.trim()}
              className="btn-primary w-full min-h-[44px] text-sm sm:text-base"
            >
              Analisis Keterbacaan
            </button>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Hasil Analisis
          </h3>

          {score ? (
            <div className="space-y-4">
              <div className="bg-primary-50 p-4 sm:p-6 rounded-lg border border-primary-200 text-center">
                <div className="text-xs sm:text-sm text-neutral-600 mb-1">Flesch Reading Ease Score</div>
                <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">{score.fleschKincaid}</div>
                <div className="text-xs sm:text-sm text-neutral-700">{score.readingEase}</div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 py-2 border-b border-neutral-200">
                  <span className="text-xs sm:text-sm text-neutral-600">Grade Level</span>
                  <span className="font-medium text-neutral-900 text-xs sm:text-sm">{score.gradeLevel}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 py-2 border-b border-neutral-200">
                  <span className="text-xs sm:text-sm text-neutral-600">Rata-rata Kata per Kalimat</span>
                  <span className="font-medium text-neutral-900 text-xs sm:text-sm">{score.avgWordsPerSentence}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 py-2">
                  <span className="text-xs sm:text-sm text-neutral-600">Rata-rata Suku Kata per Kata</span>
                  <span className="font-medium text-neutral-900 text-xs sm:text-sm">{score.avgSyllablesPerWord}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-blue-800">
                💡 <strong>Tips:</strong> Skor lebih tinggi = lebih mudah dibaca. Target 60-70 untuk konten umum.
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[300px] sm:min-h-[400px] text-neutral-400">
              <div className="text-center">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-sm">Masukkan teks dan klik "Analisis"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

