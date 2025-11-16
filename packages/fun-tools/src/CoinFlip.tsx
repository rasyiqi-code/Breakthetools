'use client'

import { useState } from 'react'
import { Coins, RotateCw } from 'lucide-react'

export function CoinFlip() {
  const [flipping, setFlipping] = useState(false)
  const [result, setResult] = useState<'heads' | 'tails' | null>(null)
  const [history, setHistory] = useState<Array<'heads' | 'tails'>>([])

  const flip = () => {
    setFlipping(true)
    setResult(null)
    
    // Animate for 1 second
    setTimeout(() => {
      const random = Math.random()
      const newResult: 'heads' | 'tails' = random < 0.5 ? 'heads' : 'tails'
      setResult(newResult)
      setFlipping(false)
      setHistory(prev => ([newResult, ...prev].slice(0, 10) as Array<'heads' | 'tails'>))
    }, 1000)
  }

  return (
    <div className="max-w-full sm:max-w-3xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Lempar Koin</h1>
        <p className="text-sm sm:text-base text-neutral-600">Putar koin virtual untuk mengambil keputusan acak</p>
      </div>

      <div className="tool-card p-4 sm:p-8 mb-4 sm:mb-6">
        <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]">
          <div className={`relative w-32 h-32 sm:w-48 sm:h-48 mb-6 sm:mb-8 transition-transform duration-1000 ${
            flipping ? 'animate-spin' : ''
          }`}>
            <div className={`absolute inset-0 rounded-full border-4 sm:border-8 flex items-center justify-center ${
              result === 'heads' 
                ? 'bg-yellow-400 border-yellow-600' 
                : result === 'tails'
                ? 'bg-yellow-500 border-yellow-700'
                : 'bg-yellow-300 border-yellow-500'
            }`}>
              {result && (
                <div className="text-4xl sm:text-6xl font-bold text-yellow-900">
                  {result === 'heads' ? '👑' : '🪙'}
                </div>
              )}
            </div>
          </div>

          {result && !flipping && (
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">
                {result === 'heads' ? 'Kepala (Heads)' : 'Ekor (Tails)'}
              </div>
            </div>
          )}

          <button
            onClick={flip}
            disabled={flipping}
            className="btn-primary flex items-center justify-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[44px]"
          >
            <RotateCw className={`w-4 h-4 sm:w-5 sm:h-5 ${flipping ? 'animate-spin' : ''}`} />
            <span>{flipping ? 'Memutar...' : 'Putar Koin'}</span>
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-sm font-medium text-neutral-700 mb-4">Riwayat (10 Terakhir)</h3>
          <div className="flex flex-wrap gap-2">
            {history.map((item, index) => (
              <div
                key={index}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  item === 'heads'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-yellow-200 text-yellow-900'
                }`}
              >
                {item === 'heads' ? '👑' : '🪙'} {item === 'heads' ? 'Heads' : 'Tails'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

