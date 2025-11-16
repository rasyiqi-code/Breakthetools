'use client'

import { useState, useEffect } from 'react'
import { Percent, TrendingDown } from 'lucide-react'

export function DiscountCalculator() {
  const [hargaAsli, setHargaAsli] = useState('')
  const [diskon, setDiskon] = useState('')
  const [result, setResult] = useState<{
    hargaDiskon: number
    hemat: number
  } | null>(null)

  useEffect(() => {
    const harga = parseFloat(hargaAsli) || 0
    const diskonPercent = parseFloat(diskon) || 0

    if (harga > 0 && diskonPercent >= 0 && diskonPercent <= 100) {
      const hemat = (harga * diskonPercent) / 100
      const hargaDiskon = harga - hemat
      setResult({ hargaDiskon, hemat })
    } else {
      setResult(null)
    }
  }, [hargaAsli, diskon])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="max-w-full sm:max-w-3xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Kalkulator Diskon</h1>
        <p className="text-sm sm:text-base text-neutral-600">Hitung harga setelah diskon dan jumlah yang dihemat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Percent className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Input
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Harga Asli
              </label>
              <input
                type="number"
                value={hargaAsli}
                onChange={(e) => setHargaAsli(e.target.value)}
                placeholder="100000"
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Diskon (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={diskon}
                onChange={(e) => setDiskon(e.target.value)}
                placeholder="20"
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Hasil
          </h3>
          
          {result ? (
            <div className="space-y-4">
              <div className="bg-primary-50 p-4 sm:p-6 rounded-lg border border-primary-200">
                <div className="text-xs sm:text-sm text-neutral-600 mb-1">Harga Setelah Diskon</div>
                <div className="text-2xl sm:text-3xl font-bold text-primary-600 break-words">
                  {formatCurrency(result.hargaDiskon)}
                </div>
              </div>

              <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                <div className="text-xs sm:text-sm text-neutral-600 mb-1">Anda Hemat</div>
                <div className="text-xl sm:text-2xl font-bold text-green-600 break-words">
                  {formatCurrency(result.hemat)}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-neutral-200">
                <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
                  <span className="text-neutral-600">Harga Asli</span>
                  <span className="font-medium text-neutral-900 line-through">
                    {formatCurrency(parseFloat(hargaAsli))}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
                  <span className="text-neutral-600">Diskon</span>
                  <span className="font-medium text-neutral-900">{diskon}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[250px] sm:min-h-[300px] text-neutral-400">
              <div className="text-center">
                <Percent className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-sm">Masukkan harga dan diskon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

