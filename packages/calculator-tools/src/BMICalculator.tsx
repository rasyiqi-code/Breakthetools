'use client'

import { useState } from 'react'
import { Activity } from 'lucide-react'

export function BMICalculator() {
  const [tinggi, setTinggi] = useState('')
  const [berat, setBerat] = useState('')
  const [result, setResult] = useState<{
    bmi: number
    status: string
    color: string
  } | null>(null)

  const calculate = () => {
    const tinggiM = parseFloat(tinggi) / 100 // Convert cm to m
    const beratKg = parseFloat(berat)

    if (tinggiM <= 0 || beratKg <= 0) {
      alert('Mohon isi tinggi dan berat badan dengan nilai yang valid!')
      return
    }

    const bmi = beratKg / (tinggiM * tinggiM)
    
    let status = ''
    let color = ''
    
    if (bmi < 18.5) {
      status = 'Kurus (Underweight)'
      color = 'text-blue-600 bg-blue-50 border-blue-200'
    } else if (bmi < 25) {
      status = 'Normal (Ideal)'
      color = 'text-green-600 bg-green-50 border-green-200'
    } else if (bmi < 30) {
      status = 'Gemuk (Overweight)'
      color = 'text-yellow-600 bg-yellow-50 border-yellow-200'
    } else {
      status = 'Obesitas (Obese)'
      color = 'text-red-600 bg-red-50 border-red-200'
    }

    setResult({
      bmi: parseFloat(bmi.toFixed(1)),
      status,
      color
    })
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Kalkulator BMI</h1>
        <p className="text-sm sm:text-base text-neutral-600">Hitung Body Mass Index (BMI) untuk mengetahui status berat badan Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Data Diri
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Tinggi Badan (cm)
              </label>
              <input
                type="number"
                value={tinggi}
                onChange={(e) => setTinggi(e.target.value)}
                placeholder="170"
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Berat Badan (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={berat}
                onChange={(e) => setBerat(e.target.value)}
                placeholder="70"
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <button
              onClick={calculate}
              className="btn-primary w-full min-h-[44px] text-sm sm:text-base"
            >
              Hitung BMI
            </button>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4">Hasil</h3>
          
          {result ? (
            <div className="space-y-4 sm:space-y-6">
              <div className={`p-4 sm:p-6 rounded-lg border-2 text-center ${result.color}`}>
                <div className="text-xs sm:text-sm mb-2">BMI Anda</div>
                <div className="text-4xl sm:text-5xl font-bold mb-2">{result.bmi}</div>
                <div className="text-base sm:text-lg font-semibold">{result.status}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded flex-shrink-0"></div>
                  <span>Kurus: &lt; 18.5</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded flex-shrink-0"></div>
                  <span>Normal: 18.5 - 24.9</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded flex-shrink-0"></div>
                  <span>Gemuk: 25 - 29.9</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded flex-shrink-0"></div>
                  <span>Obesitas: ≥ 30</span>
                </div>
              </div>

              <div className="bg-neutral-50 p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-neutral-600">
                ⚠️ <strong>Catatan:</strong> BMI adalah indikator umum dan tidak memperhitungkan massa otot. Konsultasikan dengan dokter untuk penilaian yang lebih akurat.
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[250px] sm:min-h-[300px] text-neutral-400">
              <div className="text-center">
                <Activity className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-sm">Masukkan tinggi dan berat badan</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

