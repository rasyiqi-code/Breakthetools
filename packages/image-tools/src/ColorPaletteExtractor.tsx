'use client'

import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, FileImage, Palette, Copy, Check } from 'lucide-react'

interface ColorInfo {
  hex: string
  rgb: string
  percentage: number
}

export function ColorPaletteExtractor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [palette, setPalette] = useState<ColorInfo[]>([])
  const [numColors, setNumColors] = useState(8)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar!')
      return
    }

    setOriginalFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setPalette([])
  }

  const extractPalette = () => {
    if (!preview) {
      alert('Pilih gambar terlebih dahulu!')
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Resize untuk performa
      const maxSize = 200
      let width = img.width
      let height = img.height
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      const imageData = ctx.getImageData(0, 0, width, height)
      const pixels = imageData.data
      const colorMap = new Map<string, number>()

      // Count color frequencies
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        // Skip transparent/very dark pixels
        if (pixels[i + 3] < 128) continue
        
        // Quantize colors (reduce to 32 levels per channel for grouping)
        const qr = Math.floor(r / 8) * 8
        const qg = Math.floor(g / 8) * 8
        const qb = Math.floor(b / 8) * 8
        const key = `${qr},${qg},${qb}`
        colorMap.set(key, (colorMap.get(key) || 0) + 1)
      }

      // Convert to array and sort by frequency
      const colors: Array<{ rgb: [number, number, number], count: number }> = []
      colorMap.forEach((count, key) => {
        const [r, g, b] = key.split(',').map(Number)
        colors.push({ rgb: [r, g, b], count })
      })

      colors.sort((a, b) => b.count - a.count)

      // Get top N colors
      const totalPixels = width * height
      const topColors = colors.slice(0, numColors).map(color => {
        const [r, g, b] = color.rgb
        const hex = `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
        return {
          hex: hex.toUpperCase(),
          rgb: `rgb(${r}, ${g}, ${b})`,
          percentage: parseFloat((color.count / totalPixels * 100).toFixed(1))
        }
      })

      setPalette(topColors)
    }
    img.src = preview
  }

  const handleCopy = async (color: string) => {
    await navigator.clipboard.writeText(color)
    setCopiedColor(color)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Color Palette Extractor</h1>
        <p className="text-sm sm:text-base text-neutral-600">Ekstrak palet warna dominan dari gambar - Semua proses di browser</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Upload & Ekstrak
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Pilih Gambar
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
              >
                <FileImage className="w-4 h-4" />
                Pilih Gambar
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Jumlah Warna: {numColors}
              </label>
              <input
                type="range"
                min="3"
                max="15"
                value={numColors}
                onChange={(e) => setNumColors(parseInt(e.target.value))}
                className="w-full h-2 accent-primary-500"
              />
            </div>

            <button
              onClick={extractPalette}
              disabled={!preview}
              className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
            >
              <Palette className="w-4 h-4" />
              Ekstrak Palet Warna
            </button>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Preview & Palet
          </h3>

          {preview ? (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200">
                <img src={preview} alt="Original" className="max-w-full h-auto rounded" />
              </div>

              {palette.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs sm:text-sm font-medium text-neutral-700">Palet Warna Dominan:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {palette.map((color, index) => (
                      <div
                        key={index}
                        className="bg-neutral-50 p-2 sm:p-3 rounded-lg border border-neutral-200"
                      >
                        <div
                          className="w-full h-12 sm:h-16 rounded mb-2 border border-neutral-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-mono font-semibold truncate">{color.hex}</span>
                            <button
                              onClick={() => handleCopy(color.hex)}
                              className="text-neutral-500 hover:text-primary-600 flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            >
                              {copiedColor === color.hex ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-xs text-neutral-600 break-words">{color.rgb}</div>
                          <div className="text-xs text-neutral-500">{color.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[250px] sm:min-h-[300px] text-neutral-400">
              <div className="text-center">
                <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-sm">Pilih gambar untuk memulai</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

