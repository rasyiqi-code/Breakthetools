'use client'

import { useState } from 'react'
import { Home, Calculator } from 'lucide-react'

export function KPRCalculator() {
  const [hargaProperti, setHargaProperti] = useState('')
  const [dp, setDp] = useState('')
  const [bunga, setBunga] = useState('')
  const [tenor, setTenor] = useState('')
  const [result, setResult] = useState<{
    pokok: number
    bunga: number
    total: number
    totalBayar: number
  } | null>(null)

  const calculate = () => {
    const harga = parseFloat(hargaProperti) || 0
    const dpAmount = parseFloat(dp) || 0
    const bungaRate = parseFloat(bunga) || 0
    const tenorYears = parseFloat(tenor) || 0

    if (harga <= 0 || dpAmount < 0 || bungaRate < 0 || tenorYears <= 0) {
      alert('Mohon isi semua field dengan nilai yang valid!')
      return
    }

    const pokokPinjaman = harga - dpAmount
    const bungaBulanan = bungaRate / 100 / 12
    const jumlahBulan = tenorYears * 12

    // Formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    const pembilang = pokokPinjaman * bungaBulanan * Math.pow(1 + bungaBulanan, jumlahBulan)
    const penyebut = Math.pow(1 + bungaBulanan, jumlahBulan) - 1
    const cicilanBulanan = pembilang / penyebut

    const totalBayar = cicilanBulanan * jumlahBulan
    const totalBunga = totalBayar - pokokPinjaman

    setResult({
      pokok: pokokPinjaman,
      bunga: totalBunga,
      total: cicilanBulanan,
      totalBayar: totalBayar
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Kalkulator KPR / Cicilan</h1>
        <p className="text-sm sm:text-base text-neutral-600">Hitung cicilan bulanan untuk KPR atau pinjaman Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Input Data
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Harga Properti
              </label>
              <input
                type="number"
                value={hargaProperti}
                onChange={(e) => setHargaProperti(e.target.value)}
                placeholder="500000000"
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Uang Muka (DP)
              </label>
              <input
                type="number"
                value={dp}
                onChange={(e) => setDp(e.target.value)}
                placeholder="100000000"
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Bunga Tahunan (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={bunga}
                onChange={(e) => setBunga(e.target.value)}
                placeholder="6.5"
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Tenor (Tahun)
              </label>
              <input
                type="number"
                value={tenor}
                onChange={(e) => setTenor(e.target.value)}
                placeholder="15"
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <button
              onClick={calculate}
              className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
            >
              <Calculator className="w-4 h-4" />
              Hitung Cicilan
            </button>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4">Hasil Perhitungan</h3>
          
          {result ? (
            <div className="space-y-4">
              <div className="bg-primary-50 p-3 sm:p-4 rounded-lg border border-primary-200">
                <div className="text-xs sm:text-sm text-neutral-600 mb-1">Cicilan Bulanan</div>
                <div className="text-xl sm:text-2xl font-bold text-primary-600 break-words">
                  {formatCurrency(result.total)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 py-2 border-b border-neutral-200">
                  <span className="text-xs sm:text-sm text-neutral-600">Pokok Pinjaman</span>
                  <span className="font-medium text-neutral-900 text-xs sm:text-sm break-words">{formatCurrency(result.pokok)}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 py-2 border-b border-neutral-200">
                  <span className="text-xs sm:text-sm text-neutral-600">Total Bunga</span>
                  <span className="font-medium text-neutral-900 text-xs sm:text-sm break-words">{formatCurrency(result.bunga)}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 py-2 border-b border-neutral-200">
                  <span className="text-xs sm:text-sm text-neutral-600">Total yang Dibayar</span>
                  <span className="font-medium text-primary-600 text-xs sm:text-sm break-words">{formatCurrency(result.totalBayar)}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 py-2">
                  <span className="text-xs sm:text-sm text-neutral-600">Tenor</span>
                  <span className="font-medium text-neutral-900 text-xs sm:text-sm">{tenor} tahun</span>
                </div>
              </div>

              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-blue-800">
                💡 <strong>Tips:</strong> Cicilan ini belum termasuk biaya administrasi, asuransi, dan biaya lainnya.
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[250px] sm:min-h-[300px] text-neutral-400">
              <div className="text-center">
                <Calculator className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-sm">Masukkan data dan klik "Hitung Cicilan"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

