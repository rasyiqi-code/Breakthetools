'use client'

import { useState, useRef } from 'react'
import { Upload, Download, Image as ImageIcon, FileImage, Maximize2 } from 'lucide-react'

export function ImageResizer() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [resizedUrl, setResizedUrl] = useState<string>('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      const img = new Image()
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height })
        if (maintainAspectRatio) {
          setWidth(img.width.toString())
          setHeight(img.height.toString())
        }
      }
      img.src = e.target?.result as string
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setResizedUrl('')
  }

  const handleWidthChange = (value: string) => {
    setWidth(value)
    if (maintainAspectRatio && originalDimensions.width > 0) {
      const newWidth = parseFloat(value) || 0
      const ratio = originalDimensions.height / originalDimensions.width
      setHeight(Math.round(newWidth * ratio).toString())
    }
  }

  const handleHeightChange = (value: string) => {
    setHeight(value)
    if (maintainAspectRatio && originalDimensions.height > 0) {
      const newHeight = parseFloat(value) || 0
      const ratio = originalDimensions.width / originalDimensions.height
      setWidth(Math.round(newHeight * ratio).toString())
    }
  }

  const resizeImage = () => {
    if (!preview || !width || !height) {
      alert('Pilih gambar dan masukkan dimensi!')
      return
    }

    const newWidth = parseInt(width)
    const newHeight = parseInt(height)

    if (newWidth <= 0 || newHeight <= 0) {
      alert('Dimensi harus lebih dari 0!')
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = newWidth
    canvas.height = newHeight

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          setResizedUrl(url)
        }
      }, originalFile?.type || 'image/jpeg', 0.95)
    }
    img.src = preview
  }

  const handleDownload = () => {
    if (!resizedUrl) return

    const link = document.createElement('a')
    link.href = resizedUrl
    link.download = `resized-${originalFile?.name || 'image.jpg'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Image Resizer</h1>
        <p className="text-sm sm:text-base text-neutral-600">Ubah ukuran gambar dengan mudah - Semua proses di browser</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Upload & Resize
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
                  {originalFile.name} ({originalDimensions.width} × {originalDimensions.height}px)
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 min-h-[44px]">
                <input
                  type="checkbox"
                  checked={maintainAspectRatio}
                  onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm font-medium text-neutral-700">Pertahankan Aspect Ratio</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Lebar (px)
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  placeholder="1920"
                  className="input-field text-sm sm:text-base min-h-[44px]"
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Tinggi (px)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  placeholder="1080"
                  className="input-field text-sm sm:text-base min-h-[44px]"
                  min="1"
                />
              </div>
            </div>

            <button
              onClick={resizeImage}
              disabled={!originalFile || !width || !height}
              className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
            >
              <Maximize2 className="w-4 h-4" />
              Resize Gambar
            </button>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Preview & Download
          </h3>

          {preview ? (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200">
                <div className="text-xs text-neutral-600 mb-2">
                  Original ({originalDimensions.width} × {originalDimensions.height}px)
                </div>
                <img src={preview} alt="Original" className="max-w-full h-auto rounded" />
              </div>

              {resizedUrl && (
                <>
                  <div className="bg-primary-50 p-3 sm:p-4 rounded-lg border border-primary-200">
                    <div className="text-xs text-neutral-600 mb-2">
                      Resized ({width} × {height}px)
                    </div>
                    <img src={resizedUrl} alt="Resized" className="max-w-full h-auto rounded" />
                  </div>
                  <button
                    onClick={handleDownload}
                    className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
                  >
                    <Download className="w-4 h-4" />
                    Download Gambar
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

