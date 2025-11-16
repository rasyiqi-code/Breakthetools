'use client'

import { useState } from 'react'
import { User, Copy, Check, RefreshCw } from 'lucide-react'

const firstNames = [
  'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gunawan', 'Hani', 'Indra', 'Joko',
  'Kartika', 'Lina', 'Maya', 'Nina', 'Omar', 'Putri', 'Rudi', 'Sari', 'Tono', 'Umi',
  'Vina', 'Wati', 'Yoga', 'Zara', 'Alya', 'Bayu', 'Cinta', 'Dian', 'Eka', 'Fajar'
]

const lastNames = [
  'Santoso', 'Wijaya', 'Kurniawan', 'Prasetyo', 'Sari', 'Putra', 'Sari', 'Hidayat',
  'Rahayu', 'Saputra', 'Lestari', 'Purnama', 'Sari', 'Maulana', 'Indrawan', 'Kusuma',
  'Wibowo', 'Sari', 'Nugroho', 'Sari', 'Ahmad', 'Sari', 'Rahman', 'Sari'
]

const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'mail.com']

export function RandomNameGenerator() {
  const [count, setCount] = useState(5)
  const [includeEmail, setIncludeEmail] = useState(false)
  const [names, setNames] = useState<Array<{ name: string; email?: string }>>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generateName = () => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    return `${firstName} ${lastName}`
  }

  const generateEmail = (name: string) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '.')
    const domain = domains[Math.floor(Math.random() * domains.length)]
    return `${cleanName}@${domain}`
  }

  const handleGenerate = () => {
    const newNames = Array.from({ length: count }, () => {
      const name = generateName()
      return {
        name,
        email: includeEmail ? generateEmail(name) : undefined
      }
    })
    setNames(newNames)
    setCopiedIndex(null)
  }

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Random Name Generator</h1>
        <p className="text-sm sm:text-base text-neutral-600">Generate nama acak untuk testing, placeholder, atau kreativitas</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6">
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              Jumlah Nama
            </label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              min="1"
              max="50"
              className="input-field text-sm sm:text-base min-h-[44px]"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeEmail}
                onChange={(e) => setIncludeEmail(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 min-h-[44px]"
              />
              <span className="text-sm text-neutral-700">Include Email</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
        >
          <RefreshCw className="w-4 h-4" />
          Generate Names
        </button>
      </div>

      {names.length > 0 && (
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-sm font-medium text-neutral-700 mb-4">
            Generated Names ({names.length})
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
            {names.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-neutral-50 p-2 sm:p-3 rounded border border-neutral-200 gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900 text-sm sm:text-base truncate">{item.name}</div>
                  {item.email && (
                    <div className="text-xs sm:text-sm text-neutral-600 font-mono truncate">{item.email}</div>
                  )}
                </div>
                <button
                  onClick={() => handleCopy(item.email || item.name, index)}
                  className="ml-2 text-neutral-600 hover:text-primary-600 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

