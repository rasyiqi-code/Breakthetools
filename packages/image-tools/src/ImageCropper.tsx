'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Download, Image as ImageIcon, FileImage, Crop } from 'lucide-react'

export function ImageCropper() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [croppedUrl, setCroppedUrl] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 })
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 })
  const [isSelecting, setIsSelecting] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
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
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setCroppedUrl('')
    setCropStart({ x: 0, y: 0 })
    setCropEnd({ x: 0, y: 0 })
  }

  const getMousePos = (e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 }
    const rect = containerRef.current.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!preview) return
    const pos = getMousePos(e)
    setCropStart(pos)
    setCropEnd(pos)
    setIsSelecting(true)
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const pos = getMousePos(e)
    setCropEnd(pos)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    // Area crop will remain visible as long as cropArea.width > 10 && cropArea.height > 10
    // No need to reset isSelecting here - it will be reset when user starts a new selection
  }

  const cropImage = () => {
    if (!preview || !imageRef.current) {
      alert('Pilih gambar dan buat area crop terlebih dahulu!')
      return
    }

    const img = imageRef.current
    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height

    const x = Math.min(cropStart.x, cropEnd.x) * scaleX
    const y = Math.min(cropStart.y, cropEnd.y) * scaleY
    const width = Math.abs(cropEnd.x - cropStart.x) * scaleX
    const height = Math.abs(cropEnd.y - cropStart.y) * scaleY

    if (width < 10 || height < 10) {
      alert('Area crop terlalu kecil!')
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = width
    canvas.height = height

    ctx.drawImage(img, x, y, width, height, 0, 0, width, height)

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        setCroppedUrl(url)
      }
    }, originalFile?.type || 'image/jpeg', 0.95)
  }

  const handleDownload = () => {
    if (!croppedUrl) return

    const link = document.createElement('a')
    link.href = croppedUrl
    link.download = `cropped-${originalFile?.name || 'image.jpg'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const cropArea = {
    left: Math.min(cropStart.x, cropEnd.x),
    top: Math.min(cropStart.y, cropEnd.y),
    width: Math.abs(cropEnd.x - cropStart.x),
    height: Math.abs(cropEnd.y - cropStart.y)
  }

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Image Cropper</h1>
        <p className="text-sm sm:text-base text-neutral-600">Potong gambar sesuai kebutuhan - Semua proses di browser</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Upload & Crop
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

            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-200 text-xs sm:text-sm text-blue-800">
              💡 <strong>Cara menggunakan:</strong> Klik dan drag pada gambar untuk memilih area yang ingin dipotong.
            </div>

            <button
              onClick={cropImage}
              disabled={!preview || cropArea.width < 10 || cropArea.height < 10}
              className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
            >
              <Crop className="w-4 h-4" />
              Potong Gambar
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
              <div 
                ref={containerRef}
                className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200 relative cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={preview}
                  alt="Original"
                  className="max-w-full h-auto rounded select-none"
                  draggable={false}
                />
                {cropArea.width > 10 && cropArea.height > 10 && (
                  <div
                    className="absolute border-2 border-primary-500 bg-primary-500/20 pointer-events-none z-10"
                    style={{
                      left: `${cropArea.left}px`,
                      top: `${cropArea.top}px`,
                      width: `${cropArea.width}px`,
                      height: `${cropArea.height}px`
                    }}
                  />
                )}
              </div>

              {croppedUrl && (
                <>
                  <div className="bg-primary-50 p-3 sm:p-4 rounded-lg border border-primary-200">
                    <div className="text-xs text-neutral-600 mb-2">Cropped</div>
                    <img src={croppedUrl} alt="Cropped" className="max-w-full h-auto rounded" />
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

