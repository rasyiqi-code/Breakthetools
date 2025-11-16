'use client'

import { useState } from 'react'
import { TrendingUp, Calculator } from 'lucide-react'

export function CompoundInterestCalculator() {
  const [modalAwal, setModalAwal] = useState('')
  const [setoranBulanan, setSetoranBulanan] = useState('')
  const [bungaTahunan, setBungaTahunan] = useState('')
  const [waktu, setWaktu] = useState('')
  const [result, setResult] = useState<{
    totalInvestasi: number
    totalBunga: number
    totalAkhir: number
  } | null>(null)

  const calculate = () => {
    const principal = parseFloat(modalAwal) || 0
    const monthlyDeposit = parseFloat(setoranBulanan) || 0
    const annualRate = parseFloat(bungaTahunan) || 0
    const years = parseFloat(waktu) || 0

    if (principal < 0 || monthlyDeposit < 0 || annualRate < 0 || years <= 0) {
      alert('Mohon isi semua field dengan nilai yang valid!')
      return
    }

    const monthlyRate = annualRate / 100 / 12
    const months = years * 12
    let balance = principal
    let totalDeposits = principal

    // Calculate compound interest with monthly deposits
    for (let i = 0; i < months; i++) {
      balance = balance * (1 + monthlyRate) + monthlyDeposit
      totalDeposits += monthlyDeposit
    }

    const totalInterest = balance - totalDeposits

    setResult({
      totalInvestasi: totalDeposits,
      totalBunga: totalInterest,
      totalAkhir: balance
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
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Kalkulator Bunga Majemuk</h1>
        <p className="text-sm sm:text-base text-neutral-600">Hitung pertumbuhan investasi dengan compound interest</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Input Data
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Modal Awal
              </label>
              <input
                type="number"
                value={modalAwal}
                onChange={(e) => setModalAwal(e.target.value)}
                placeholder="10000000"
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Setoran Bulanan (Opsional)
              </label>
              <input
                type="number"
                value={setoranBulanan}
                onChange={(e) => setSetoranBulanan(e.target.value)}
                placeholder="1000000"
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
                value={bungaTahunan}
                onChange={(e) => setBungaTahunan(e.target.value)}
                placeholder="6.5"
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Waktu (Tahun)
              </label>
              <input
                type="number"
                value={waktu}
                onChange={(e) => setWaktu(e.target.value)}
                placeholder="10"
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <button
              onClick={calculate}
              className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
            >
              <Calculator className="w-4 h-4" />
              Hitung
            </button>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4">Hasil</h3>
          
          {result ? (
            <div className="space-y-4">
              <div className="bg-primary-50 p-4 sm:p-6 rounded-lg border border-primary-200">
                <div className="text-xs sm:text-sm text-neutral-600 mb-1">Total Akhir</div>
                <div className="text-2xl sm:text-3xl font-bold text-primary-600 break-words">
                  {formatCurrency(result.totalAkhir)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 py-2 border-b border-neutral-200">
                  <span className="text-xs sm:text-sm text-neutral-600">Total Investasi</span>
                  <span className="font-medium text-neutral-900 text-xs sm:text-sm break-words">{formatCurrency(result.totalInvestasi)}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 py-2 border-b border-neutral-200">
                  <span className="text-xs sm:text-sm text-neutral-600">Total Bunga</span>
                  <span className="font-medium text-green-600 text-xs sm:text-sm break-words">{formatCurrency(result.totalBunga)}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 py-2">
                  <span className="text-xs sm:text-sm text-neutral-600">Waktu</span>
                  <span className="font-medium text-neutral-900 text-xs sm:text-sm">{waktu} tahun</span>
                </div>
              </div>

              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-blue-800">
                💡 <strong>Compound Interest:</strong> Bunga yang dihasilkan akan menghasilkan bunga lagi di periode berikutnya.
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[250px] sm:min-h-[300px] text-neutral-400">
              <div className="text-center">
                <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-sm">Masukkan data dan klik "Hitung"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

