'use client'

import { useState, useEffect } from 'react'
import { Maximize2, Monitor } from 'lucide-react'

const commonRatios = [
  { name: '16:9', value: 16/9 },
  { name: '4:3', value: 4/3 },
  { name: '1:1', value: 1 },
  { name: '21:9', value: 21/9 },
  { name: '9:16', value: 9/16 },
  { name: '3:2', value: 3/2 },
]

export function AspectRatioCalculator() {
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [selectedRatio, setSelectedRatio] = useState<string>('')
  const [result, setResult] = useState<{
    width: number
    height: number
    ratio: string
  } | null>(null)

  const simplifyRatio = (w: number, h: number): string => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
    const divisor = gcd(w, h)
    return `${w / divisor}:${h / divisor}`
  }

  const calculateFromRatio = () => {
    const ratio = commonRatios.find(r => r.name === selectedRatio)
    if (!ratio || !width) return

    const w = parseFloat(width)
    if (w <= 0) return

    const h = w / ratio.value
    setHeight(h.toFixed(0))
    setResult({
      width: w,
      height: h,
      ratio: selectedRatio
    })
  }

  const calculateFromDimensions = () => {
    const w = parseFloat(width) || 0
    const h = parseFloat(height) || 0

    if (w <= 0 || h <= 0) {
      setResult(null)
      return
    }

    const simplified = simplifyRatio(w, h)
    
    setResult({
      width: w,
      height: h,
      ratio: simplified
    })
  }

  useEffect(() => {
    if (selectedRatio && width) {
      calculateFromRatio()
    } else if (width && height) {
      calculateFromDimensions()
    } else {
      setResult(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, selectedRatio])

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Kalkulator Aspect Ratio</h1>
        <p className="text-sm sm:text-base text-neutral-600">Hitung dimensi berdasarkan aspect ratio atau sebaliknya</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Input
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Lebar (Width)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="1920"
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Tinggi (Height)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="1080"
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Atau Pilih Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {commonRatios.map((ratio) => (
                  <button
                    key={ratio.name}
                    onClick={() => {
                      setSelectedRatio(ratio.name)
                      if (width) calculateFromRatio()
                    }}
                    className={`py-2 px-2 sm:px-3 rounded-lg font-medium transition-all min-h-[44px] text-xs sm:text-sm ${
                      selectedRatio === ratio.name
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {ratio.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Hasil
          </h3>
          
          {result ? (
            <div className="space-y-4">
              <div className="bg-primary-50 p-4 sm:p-6 rounded-lg border border-primary-200 text-center">
                <div className="text-xs sm:text-sm text-neutral-600 mb-2">Aspect Ratio</div>
                <div className="text-2xl sm:text-3xl font-bold text-primary-600">{result.ratio}</div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 py-2 border-b border-neutral-200">
                  <span className="text-xs sm:text-sm text-neutral-600">Lebar</span>
                  <span className="font-medium text-neutral-900 text-xs sm:text-sm">{result.width.toFixed(0)} px</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 py-2">
                  <span className="text-xs sm:text-sm text-neutral-600">Tinggi</span>
                  <span className="font-medium text-neutral-900 text-xs sm:text-sm">{result.height.toFixed(0)} px</span>
                </div>
              </div>

              <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200">
                <div className="text-xs text-neutral-600 mb-2">Preview</div>
                <div 
                  className="bg-primary-200 rounded mx-auto"
                  style={{
                    width: '100%',
                    maxWidth: '200px',
                    aspectRatio: result.ratio,
                    margin: '0 auto'
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[250px] sm:min-h-[300px] text-neutral-400">
              <div className="text-center">
                <Maximize2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-sm">Masukkan dimensi atau pilih ratio</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

