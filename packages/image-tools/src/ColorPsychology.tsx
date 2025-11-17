'use client'

import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, FileImage, Brain, Palette, Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { colorPsychology, getColorName } from './utils/colorPsychologyData'
import { extractDominantColors, resizeImageForAnalysis } from './utils/colorExtraction'
import { rgbToHsl } from '@breaktools/generator-tools'

interface ColorInfo {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  percentage: number
  psychology: {
    emotion: string[]
    meaning: string
    use: string[]
  }
}

export function ColorPsychology() {
  const t = useTranslations('tools.colorPsychology')
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [colors, setColors] = useState<ColorInfo[]>([])
  const [numColors, setNumColors] = useState(5)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert(t('errors.invalidFileType'))
      return
    }

    setOriginalFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setColors([])
  }

  const analyzeColors = () => {
    if (!preview) {
      alert(t('errors.noFileSelected'))
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Resize untuk performa
      const { width, height } = resizeImageForAnalysis(img, 300)

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      const imageData = ctx.getImageData(0, 0, width, height)
      const pixels = imageData.data

      // Extract dominant colors
      const dominantColors = extractDominantColors(pixels, width, height, numColors)

      // Get top N colors with psychology
      const totalPixels = width * height
      const topColors = dominantColors.map((color) => {
        const [r, g, b] = color.rgb
        const hex = `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
        const hsl = rgbToHsl(r, g, b)
        const colorName = getColorName(r, g, b, rgbToHsl)
        const psychology = colorPsychology[colorName] || {
          emotion: ['Neutral'],
          meaning: 'Warna netral yang dapat digunakan dalam berbagai konteks.',
          use: ['General use']
        }

        return {
          hex: hex.toUpperCase(),
          rgb: { r, g, b },
          hsl,
          percentage: (color.count / totalPixels) * 100,
          psychology
        }
      })

      setColors(topColors)
    }
    img.src = preview
  }

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('title')}</h1>
        <p className="text-sm sm:text-base text-neutral-600">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            {t('uploadAndAnalyze')}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                {t('selectImage')}
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
                {t('selectImage')}
              </button>
              {originalFile && (
                <div className="mt-2 text-xs sm:text-sm text-neutral-600 break-words">
                  {originalFile.name}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                {t('numColors')}: {numColors}
              </label>
              <input
                type="range"
                min="3"
                max="10"
                value={numColors}
                onChange={(e) => setNumColors(parseInt(e.target.value))}
                className="w-full h-2 accent-primary-500"
              />
            </div>

            <button
              onClick={analyzeColors}
              disabled={!originalFile}
              className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
            >
              <Brain className="w-4 h-4" />
              {t('analyzeColors')}
            </button>

            {preview && (
              <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200">
                <div className="text-xs text-neutral-600 mb-2">{t('preview')}</div>
                <img src={preview} alt={t('preview')} className="max-w-full h-auto rounded" />
              </div>
            )}
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            {t('colorAnalysis')}
          </h3>

          {colors.length > 0 ? (
            <div className="space-y-4">
              {colors.map((color, index) => (
                <div key={index} className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 border-neutral-300 flex-shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs sm:text-sm font-semibold text-neutral-900 mb-1">
                        {color.hex}
                      </div>
                      <div className="text-xs text-neutral-600">
                        RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b}) • {color.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div>
                      <div className="text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {t('emotionsAndFeelings')}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {color.psychology.emotion.map((emotion, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium"
                          >
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        {t('meaning')}
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                        {color.psychology.meaning}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-neutral-700 mb-1">
                        {t('bestUseCases')}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {color.psychology.use.map((use, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-neutral-200 text-neutral-700 rounded text-xs"
                          >
                            {use}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[250px] sm:min-h-[300px] text-neutral-400">
              <div className="text-center">
                <Palette className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-sm">{t('selectImageAndAnalyze')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
        <h3 className="font-semibold text-blue-900 mb-2">💡 {t('aboutTitle')}</h3>
        <p className="text-blue-800">
          {t('aboutDescription')}
        </p>
      </div>
    </div>
  )
}

