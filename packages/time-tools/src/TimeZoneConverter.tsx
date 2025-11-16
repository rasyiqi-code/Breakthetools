'use client'

import { useState } from 'react'
import { Globe, Clock } from 'lucide-react'

const timeZones = [
  { name: 'Jakarta (WIB)', offset: 7, city: 'Jakarta' },
  { name: 'Singapore (SGT)', offset: 8, city: 'Singapore' },
  { name: 'Tokyo (JST)', offset: 9, city: 'Tokyo' },
  { name: 'London (GMT)', offset: 0, city: 'London' },
  { name: 'New York (EST)', offset: -5, city: 'New York' },
  { name: 'Los Angeles (PST)', offset: -8, city: 'Los Angeles' },
  { name: 'Sydney (AEDT)', offset: 11, city: 'Sydney' },
  { name: 'Dubai (GST)', offset: 4, city: 'Dubai' },
]

export function TimeZoneConverter() {
  const [sourceTime, setSourceTime] = useState('')
  const [sourceZone, setSourceZone] = useState('Jakarta (WIB)')
  const [results, setResults] = useState<Array<{ name: string; time: string }>>([])

  const convert = () => {
    if (!sourceTime) {
      alert('Masukkan waktu terlebih dahulu!')
      return
    }

    const [hours, minutes] = sourceTime.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) {
      alert('Format waktu tidak valid! Gunakan format HH:MM')
      return
    }

    const sourceTZ = timeZones.find(tz => tz.name === sourceZone)
    if (!sourceTZ) return

    const sourceOffset = sourceTZ.offset
    const sourceTotalMinutes = hours * 60 + minutes

    const converted = timeZones.map(tz => {
      const offsetDiff = tz.offset - sourceOffset
      let targetMinutes = sourceTotalMinutes + (offsetDiff * 60)
      
      // Handle day overflow
      if (targetMinutes < 0) targetMinutes += 24 * 60
      if (targetMinutes >= 24 * 60) targetMinutes -= 24 * 60
      
      const targetHours = Math.floor(targetMinutes / 60) % 24
      const targetMins = targetMinutes % 60
      
      return {
        name: tz.name,
        time: `${String(targetHours).padStart(2, '0')}:${String(targetMins).padStart(2, '0')}`
      }
    })

    setResults(converted)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Time Zone Converter</h1>
        <p className="text-sm sm:text-base text-neutral-600">Konversi waktu antar zona waktu di seluruh dunia</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Waktu
            </label>
            <input
              type="time"
              value={sourceTime}
              onChange={(e) => setSourceTime(e.target.value)}
              className="input-field text-sm sm:text-base min-h-[44px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Zona Waktu Sumber
            </label>
            <select
              value={sourceZone}
              onChange={(e) => setSourceZone(e.target.value)}
              className="input-field text-sm sm:text-base min-h-[44px]"
            >
              {timeZones.map(tz => (
                <option key={tz.name} value={tz.name}>{tz.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={convert}
          className="btn-primary w-full sm:w-auto mt-4 min-h-[44px] text-sm sm:text-base"
        >
          Konversi
        </button>
      </div>

      {results.length > 0 && (
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Hasil Konversi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 sm:p-4 rounded-lg border ${
                  result.name === sourceZone
                    ? 'bg-primary-50 border-primary-200'
                    : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="text-xs text-neutral-600 mb-1">{result.name}</div>
                <div className="text-xl sm:text-2xl font-bold text-neutral-900">{result.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

