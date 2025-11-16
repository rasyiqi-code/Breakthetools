'use client'

import { useState, useRef } from 'react'
import { Upload, FileCode, Download, Copy, Check, Zap } from 'lucide-react'

export function SVGOptimizer() {
  const [originalSvg, setOriginalSvg] = useState('')
  const [optimizedSvg, setOptimizedSvg] = useState('')
  const [originalSize, setOriginalSize] = useState(0)
  const [optimizedSize, setOptimizedSize] = useState(0)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.svg')) {
      alert('File harus berupa SVG!')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setOriginalSvg(content)
      setOriginalSize(content.length)
      setOptimizedSvg('')
      setOptimizedSize(0)
    }
    reader.readAsText(file)
  }

  const optimizeSVG = () => {
    if (!originalSvg) {
      alert('Masukkan atau upload SVG terlebih dahulu!')
      return
    }

    let optimized = originalSvg

    // Remove comments
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, '')

    // Remove unnecessary whitespace
    optimized = optimized.replace(/\s+/g, ' ')
    optimized = optimized.replace(/>\s+</g, '><')

    // Remove empty lines
    optimized = optimized.split('\n').filter(line => line.trim()).join('\n')

    // Remove default attributes that can be omitted
    optimized = optimized.replace(/\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '')
    optimized = optimized.replace(/\s+version="[^"]*"/g, '')

    // Remove unnecessary spaces around = in attributes
    optimized = optimized.replace(/\s*=\s*/g, '=')

    // Trim
    optimized = optimized.trim()

    setOptimizedSvg(optimized)
    setOptimizedSize(optimized.length)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(optimizedSvg)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!optimizedSvg) return

    const blob = new Blob([optimizedSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'optimized.svg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const savings = originalSize > 0 && optimizedSize > 0
    ? ((1 - optimizedSize / originalSize) * 100).toFixed(1)
    : 0

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">SVG Optimizer</h1>
        <p className="text-sm sm:text-base text-neutral-600">Optimalkan dan bersihkan kode SVG - Semua proses di browser</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Input SVG
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Upload File SVG
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary w-full flex items-center justify-center gap-2 mb-3 min-h-[44px] text-sm sm:text-base"
              >
                <FileCode className="w-4 h-4" />
                Upload SVG File
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Atau Paste Kode SVG
              </label>
              <textarea
                value={originalSvg}
                onChange={(e) => {
                  setOriginalSvg(e.target.value)
                  setOriginalSize(e.target.value.length)
                }}
                placeholder="<svg>...</svg>"
                className="input-field font-mono text-xs sm:text-sm min-h-[200px]"
              />
            </div>

            <button
              onClick={optimizeSVG}
              disabled={!originalSvg}
              className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
            >
              <Zap className="w-4 h-4" />
              Optimalkan SVG
            </button>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <FileCode className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Optimized SVG
          </h3>

          {optimizedSvg ? (
            <div className="space-y-4">
              <div className="bg-green-50 p-2 sm:p-3 rounded-lg border border-green-200">
                <div className="text-xs sm:text-sm font-semibold text-green-800 mb-1">
                  Penghematan: {savings}%
                </div>
                <div className="text-xs text-green-700">
                  Dari {originalSize} bytes menjadi {optimizedSize} bytes
                </div>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-2">
                  <label className="text-sm font-medium text-neutral-700">Kode SVG Teroptimasi:</label>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 min-h-[44px] px-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={optimizedSvg}
                  readOnly
                  className="input-field font-mono text-xs sm:text-sm min-h-[250px] sm:min-h-[300px]"
                />
              </div>

              <button
                onClick={handleDownload}
                className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                Download SVG
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[250px] sm:min-h-[300px] text-neutral-400">
              <div className="text-center">
                <FileCode className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-sm">Upload atau paste kode SVG</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

