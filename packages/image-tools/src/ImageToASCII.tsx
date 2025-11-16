'use client'

import { useState, useRef } from 'react'
import { Upload, FileImage, Type, Copy, Check } from 'lucide-react'

const ASCII_CHARS = '@%#*+=-:. '

export function ImageToASCII() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [asciiArt, setAsciiArt] = useState('')
  const [width, setWidth] = useState(80)
  const [invert, setInvert] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)

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
    setAsciiArt('')
  }

  const convertToASCII = () => {
    if (!preview) {
      alert('Pilih gambar terlebih dahulu!')
      return
    }

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Calculate dimensions maintaining aspect ratio
      const aspectRatio = img.height / img.width
      const outputWidth = width
      const outputHeight = Math.floor(outputWidth * aspectRatio * 0.5) // 0.5 because chars are taller than wide

      canvas.width = outputWidth
      canvas.height = outputHeight
      ctx.drawImage(img, 0, 0, outputWidth, outputHeight)

      const imageData = ctx.getImageData(0, 0, outputWidth, outputHeight)
      const pixels = imageData.data
      let result = ''

      for (let y = 0; y < outputHeight; y++) {
        for (let x = 0; x < outputWidth; x++) {
          const idx = (y * outputWidth + x) * 4
          const r = pixels[idx]
          const g = pixels[idx + 1]
          const b = pixels[idx + 2]
          
          // Convert to grayscale
          const gray = (r * 0.299 + g * 0.587 + b * 0.114)
          const normalized = invert ? 255 - gray : gray
          
          // Map to ASCII character
          const charIndex = Math.floor((normalized / 255) * (ASCII_CHARS.length - 1))
          result += ASCII_CHARS[charIndex]
        }
        result += '\n'
      }

      setAsciiArt(result)
    }
    img.src = preview
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(asciiArt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Image to ASCII Art</h1>
        <p className="text-sm sm:text-base text-neutral-600">Konversi gambar menjadi seni ASCII - Semua proses di browser</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Upload & Konversi
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
                Lebar Output: {width} karakter
              </label>
              <input
                type="range"
                min="20"
                max="200"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                className="w-full h-2 accent-primary-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 min-h-[44px]">
                <input
                  type="checkbox"
                  checked={invert}
                  onChange={(e) => setInvert(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm font-medium text-neutral-700">Invert Colors</span>
              </label>
            </div>

            <button
              onClick={convertToASCII}
              disabled={!preview}
              className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
            >
              <Type className="w-4 h-4" />
              Konversi ke ASCII
            </button>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Type className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            ASCII Art Result
          </h3>

          {preview ? (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200">
                <img src={preview} alt="Original" className="max-w-full h-auto rounded mb-2" />
              </div>

              {asciiArt && (
                <div className="space-y-3">
                  <div className="bg-neutral-900 p-3 sm:p-4 rounded-lg border border-neutral-200 overflow-x-auto">
                    <pre className="text-green-400 text-xs font-mono leading-tight whitespace-pre">
                      {asciiArt}
                    </pre>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="btn-secondary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin ASCII Art</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[250px] sm:min-h-[300px] text-neutral-400">
              <div className="text-center">
                <Type className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-sm">Pilih gambar untuk memulai</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

