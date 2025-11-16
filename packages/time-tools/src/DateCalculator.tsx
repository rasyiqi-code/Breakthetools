'use client'

import { useState } from 'react'
import { Calendar, Clock } from 'lucide-react'

export function DateCalculator() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [result, setResult] = useState<{
    days: number
    hours: number
    minutes: number
    weeks: number
    months: number
  } | null>(null)

  const calculate = () => {
    if (!startDate || !endDate) {
      alert('Pilih kedua tanggal!')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert('Format tanggal tidak valid!')
      return
    }

    const diffMs = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)

    setResult({
      days: diffDays,
      hours: diffHours,
      minutes: diffMinutes,
      weeks: diffWeeks,
      months: diffMonths
    })
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Kalkulator Durasi</h1>
        <p className="text-sm sm:text-base text-neutral-600">Hitung jumlah hari, jam, dan menit antara dua tanggal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Input
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <button
              onClick={calculate}
              className="btn-primary w-full min-h-[44px] text-sm sm:text-base"
            >
              Hitung Durasi
            </button>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Hasil
          </h3>
          
          {result ? (
            <div className="space-y-4">
              <div className="bg-primary-50 p-4 sm:p-6 rounded-lg border border-primary-200 text-center">
                <div className="text-xs sm:text-sm text-neutral-600 mb-1">Total Durasi</div>
                <div className="text-2xl sm:text-3xl font-bold text-primary-600">{result.days} Hari</div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200 text-center">
                  <div className="text-xs text-neutral-600 mb-1">Minggu</div>
                  <div className="text-lg sm:text-xl font-bold text-neutral-900">{result.weeks}</div>
                </div>
                <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200 text-center">
                  <div className="text-xs text-neutral-600 mb-1">Bulan</div>
                  <div className="text-lg sm:text-xl font-bold text-neutral-900">{result.months}</div>
                </div>
                <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200 text-center">
                  <div className="text-xs text-neutral-600 mb-1">Jam</div>
                  <div className="text-lg sm:text-xl font-bold text-neutral-900 break-words">{result.hours.toLocaleString()}</div>
                </div>
                <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200 text-center">
                  <div className="text-xs text-neutral-600 mb-1">Menit</div>
                  <div className="text-lg sm:text-xl font-bold text-neutral-900 break-words">{result.minutes.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[250px] sm:min-h-[300px] text-neutral-400">
              <div className="text-center">
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-sm">Pilih kedua tanggal</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

