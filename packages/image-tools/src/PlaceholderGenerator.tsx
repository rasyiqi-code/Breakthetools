'use client'

import { useState } from 'react'
import { Download, Image as ImageIcon, Maximize2 } from 'lucide-react'

export function PlaceholderGenerator() {
  const [width, setWidth] = useState('800')
  const [height, setHeight] = useState('600')
  const [bgColor, setBgColor] = useState('#cccccc')
  const [textColor, setTextColor] = useState('#666666')
  const [text, setText] = useState('')
  const [placeholderUrl, setPlaceholderUrl] = useState('')

  const generatePlaceholder = () => {
    const w = parseInt(width) || 800
    const h = parseInt(height) || 600
    const displayText = text || `${w} × ${h}`

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fill background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, w, h)

    // Draw text
    ctx.fillStyle = textColor
    ctx.font = `bold ${Math.min(w, h) / 10}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(displayText, w / 2, h / 2)

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png')
    setPlaceholderUrl(dataUrl)
  }

  const handleDownload = () => {
    if (!placeholderUrl) return

    const link = document.createElement('a')
    link.href = placeholderUrl
    link.download = `placeholder-${width}x${height}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Placeholder Image Generator</h1>
        <p className="text-sm sm:text-base text-neutral-600">Generate gambar placeholder untuk prototyping - Semua proses di browser</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Settings
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Lebar (px)
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="800"
                  className="input-field text-sm sm:text-base min-h-[44px]"
                  min="1"
                  max="5000"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Tinggi (px)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="600"
                  className="input-field text-sm sm:text-base min-h-[44px]"
                  min="1"
                  max="5000"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Warna Background
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-10 sm:w-16 sm:h-10 rounded border border-neutral-300 flex-shrink-0"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  placeholder="#cccccc"
                  className="input-field flex-1 font-mono text-sm sm:text-base min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Warna Teks
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-10 sm:w-16 sm:h-10 rounded border border-neutral-300 flex-shrink-0"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  placeholder="#666666"
                  className="input-field flex-1 font-mono text-sm sm:text-base min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Teks Kustom (opsional)
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Kosongkan untuk menggunakan dimensi"
                className="input-field text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <button
              onClick={generatePlaceholder}
              className="btn-primary w-full min-h-[44px] text-sm sm:text-base"
            >
              Generate Placeholder
            </button>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Preview & Download
          </h3>

          {placeholderUrl ? (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200">
                <img
                  src={placeholderUrl}
                  alt="Placeholder"
                  className="max-w-full h-auto rounded"
                />
              </div>

              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-800 mb-2">Data URL (untuk embed langsung):</div>
                <div className="text-xs font-mono text-blue-900 break-all bg-white p-2 rounded">
                  {placeholderUrl.substring(0, 100)}...
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                Download Placeholder
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[250px] sm:min-h-[300px] text-neutral-400">
              <div className="text-center">
                <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-sm">Klik "Generate Placeholder" untuk membuat gambar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

