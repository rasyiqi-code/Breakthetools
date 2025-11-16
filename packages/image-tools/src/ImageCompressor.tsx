'use client'

import { useState, useRef } from 'react'
import { Upload, Download, Image as ImageIcon, FileImage, Zap } from 'lucide-react'

export function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [compressedUrl, setCompressedUrl] = useState<string>('')
  const [quality, setQuality] = useState(80)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar!')
      return
    }

    setOriginalFile(file)
    setOriginalSize(file.size)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setCompressedUrl('')
    setCompressedSize(0)
  }

  const compressImage = () => {
    if (!originalFile || !preview) {
      alert('Pilih gambar terlebih dahulu!')
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Calculate new dimensions if needed (max width 1920px)
      let width = img.width
      let height = img.height
      const maxWidth = 1920

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      const mimeType = originalFile.type || 'image/jpeg'
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            setCompressedUrl(url)
            setCompressedSize(blob.size)
          }
        },
        mimeType,
        quality / 100
      )
    }
    img.src = preview
  }

  const handleDownload = () => {
    if (!compressedUrl) return

    const link = document.createElement('a')
    link.href = compressedUrl
    link.download = `compressed-${originalFile?.name || 'image.jpg'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const compressionRatio = originalSize > 0 && compressedSize > 0
    ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
    : 0

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Image Compressor</h1>
        <p className="text-sm sm:text-base text-neutral-600">Kompres gambar tanpa kehilangan kualitas yang signifikan - Semua proses di browser</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Upload & Kompres
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
              {originalFile && (
                <div className="mt-2 text-xs sm:text-sm text-neutral-600 break-words">
                  {originalFile.name} ({(originalSize / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Kualitas: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-2 accent-primary-500"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>Kecil (10%)</span>
                <span>Besar (100%)</span>
              </div>
            </div>

            <button
              onClick={compressImage}
              disabled={!originalFile}
              className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
            >
              <Zap className="w-4 h-4" />
              Kompres Gambar
            </button>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Hasil Kompresi
          </h3>

          {preview ? (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200">
                <div className="text-xs text-neutral-600 mb-2">Original</div>
                <img src={preview} alt="Original" className="max-w-full h-auto rounded mb-2" />
                <div className="text-xs text-neutral-500">
                  Ukuran: {(originalSize / 1024).toFixed(2)} KB
                </div>
              </div>

              {compressedUrl && (
                <>
                  <div className="bg-primary-50 p-3 sm:p-4 rounded-lg border border-primary-200">
                    <div className="text-xs text-neutral-600 mb-2">Compressed</div>
                    <img src={compressedUrl} alt="Compressed" className="max-w-full h-auto rounded mb-2" />
                    <div className="text-xs text-neutral-500">
                      Ukuran: {(compressedSize / 1024).toFixed(2)} KB
                    </div>
                  </div>

                  <div className="bg-green-50 p-2 sm:p-3 rounded-lg border border-green-200">
                    <div className="text-xs sm:text-sm font-semibold text-green-800 mb-1">
                      Penghematan: {compressionRatio}%
                    </div>
                    <div className="text-xs text-green-700">
                      Dari {(originalSize / 1024).toFixed(2)} KB menjadi {(compressedSize / 1024).toFixed(2)} KB
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
                  >
                    <Download className="w-4 h-4" />
                    Download Gambar Terkompres
                  </button>
                </>
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

