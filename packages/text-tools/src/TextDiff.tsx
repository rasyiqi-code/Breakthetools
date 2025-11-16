'use client'

import { useState } from 'react'

export function TextDiff() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [showDiff, setShowDiff] = useState(false)

  const getDiff = () => {
    const lines1 = text1.split('\n')
    const lines2 = text2.split('\n')

    const maxLength = Math.max(lines1.length, lines2.length)
    const diff: Array<{ line1: string; line2: string; isDifferent: boolean }> = []

    for (let i = 0; i < maxLength; i++) {
      const line1 = lines1[i] || ''
      const line2 = lines2[i] || ''
      diff.push({
        line1,
        line2,
        isDifferent: line1 !== line2
      })
    }

    return diff
  }

  const differences = showDiff ? getDiff() : []
  const diffCount = differences.filter(d => d.isDifferent).length

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Text Diff Checker</h1>
        <p className="text-sm sm:text-base text-neutral-600">Bandingkan dua teks dan lihat perbedaannya baris per baris</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="tool-card p-4 sm:p-6">
          <label className="text-sm font-medium text-neutral-700 mb-3 block">Text 1</label>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Tempel text pertama di sini..."
            className="textarea-field text-sm sm:text-base"
            rows={12}
          />
        </div>

        <div className="tool-card p-4 sm:p-6">
          <label className="text-sm font-medium text-neutral-700 mb-3 block">Text 2</label>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Tempel text kedua di sini..."
            className="textarea-field text-sm sm:text-base"
            rows={12}
          />
        </div>
      </div>

      <div className="text-center mb-4 sm:mb-6">
        <button
          onClick={() => setShowDiff(true)}
          className="btn-primary min-h-[44px] text-sm sm:text-base px-6"
          disabled={!text1 || !text2}
        >
          Bandingkan Text
        </button>
      </div>

      {showDiff && (
        <div className="tool-card p-4 sm:p-6">
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900">Hasil Perbandingan</h3>
            <div className="text-xs sm:text-sm text-neutral-600">
              <span className="font-medium text-red-600">{diffCount}</span> baris berbeda
            </div>
          </div>
          <div className="space-y-2 overflow-x-auto">
            {differences.map((diff, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 p-2 sm:p-3 rounded ${diff.isDifferent ? 'bg-red-50 border border-red-200' : 'bg-neutral-50'
                  }`}
              >
                <div className="font-mono text-xs sm:text-sm break-words">
                  <span className="text-neutral-400 mr-2">{index + 1}</span>
                  {diff.line1 || <span className="text-neutral-300 italic">(kosong)</span>}
                </div>
                <div className="font-mono text-xs sm:text-sm break-words">
                  <span className="text-neutral-400 mr-2">{index + 1}</span>
                  {diff.line2 || <span className="text-neutral-300 italic">(kosong)</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

