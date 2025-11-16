'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function GradientGenerator() {
  const [color1, setColor1] = useState('#f2711c')
  const [color2, setColor2] = useState('#e35814')
  const [angle, setAngle] = useState(90)
  const [type, setType] = useState<'linear' | 'radial'>('linear')
  const [copied, setCopied] = useState(false)

  const gradientCSS = type === 'linear'
    ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
    : `radial-gradient(circle, ${color1}, ${color2})`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`background: ${gradientCSS};`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-5xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">CSS Gradient Generator</h1>
        <p className="text-sm sm:text-base text-neutral-600">Buat gradient CSS dengan visual dan salin kodenya</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-sm font-medium text-neutral-700 mb-4">Preview</h3>
          
          <div
            className="w-full h-48 sm:h-64 rounded-lg border-4 border-neutral-200"
            style={{ background: gradientCSS }}
          />
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-sm font-medium text-neutral-700 mb-4">Pengaturan</h3>
          
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="text-sm text-neutral-600 mb-2 block">Tipe Gradient</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setType('linear')}
                  className={`flex-1 py-2 px-3 sm:px-4 rounded font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${
                    type === 'linear'
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
                >
                  Linear
                </button>
                <button
                  onClick={() => setType('radial')}
                  className={`flex-1 py-2 px-3 sm:px-4 rounded font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${
                    type === 'radial'
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
                >
                  Radial
                </button>
              </div>
            </div>

            {type === 'linear' && (
              <div>
                <label className="text-sm text-neutral-600 mb-2 block">
                  Angle: {angle}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-neutral-600 mb-2 block">Color 1</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="w-12 sm:w-16 h-10 cursor-pointer rounded border border-neutral-300 flex-shrink-0"
                />
                <input
                  type="text"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="input-field flex-1 text-sm sm:text-base min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-neutral-600 mb-2 block">Color 2</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-12 sm:w-16 h-10 cursor-pointer rounded border border-neutral-300 flex-shrink-0"
                />
                <input
                  type="text"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="input-field flex-1 text-sm sm:text-base min-h-[44px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tool-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
          <h3 className="text-sm font-medium text-neutral-700">CSS Code</h3>
          <button
            onClick={handleCopy}
            className="btn-secondary text-sm flex items-center space-x-2 min-h-[44px] px-4"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>
        <code className="block bg-neutral-900 text-green-400 p-3 sm:p-4 rounded font-mono text-xs sm:text-sm break-all">
          background: {gradientCSS};
        </code>
      </div>
    </div>
  )
}

