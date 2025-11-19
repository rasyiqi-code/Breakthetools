'use client'

import { useState, useRef } from 'react'
import { Upload, Download, Image as ImageIcon, FileImage } from 'lucide-react'

export function ImageConverter() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [targetFormat, setTargetFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg')
  const [convertedUrl, setConvertedUrl] = useState<string>('')
  const [quality, setQuality] = useState(90)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('File must be an image!')
      return
    }

    setOriginalFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setConvertedUrl('')
  }

  const convertImage = () => {
    if (!originalFile || !preview) {
      alert('Please select an image first!')
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const mimeType = targetFormat === 'jpeg' ? 'image/jpeg' : targetFormat === 'png' ? 'image/png' : 'image/webp'

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            setConvertedUrl(url)
          }
        },
        mimeType,
        targetFormat === 'jpeg' || targetFormat === 'webp' ? quality / 100 : undefined
      )
    }
    img.src = preview
  }

  const handleDownload = () => {
    if (!convertedUrl) return

    const link = document.createElement('a')
    link.href = convertedUrl
    link.download = `converted.${targetFormat}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-6xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Image Converter</h1>
        <p className="text-sm sm:text-base text-neutral-600">Convert image formats (JPG, PNG, WebP) - All processing in your browser</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Upload & Convert
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Select Image
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
                className="btn-secondary w-full flex items-center justify-center gap-2 min-h-[44px]"
              >
                <FileImage className="w-4 h-4" />
                <span className="text-sm sm:text-base">Select Image</span>
              </button>
              {originalFile && (
                <div className="mt-2 text-xs sm:text-sm text-neutral-600">
                  {originalFile.name} ({(originalFile.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Target Format
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                className="input-field text-sm sm:text-base min-h-[44px]"
              >
                <option value="jpeg">JPEG / JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>

            {(targetFormat === 'jpeg' || targetFormat === 'webp') && (
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            <button
              onClick={convertImage}
              disabled={!originalFile}
              className="btn-primary w-full min-h-[44px] text-sm sm:text-base"
            >
              Convert Image
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
                <div className="text-xs text-neutral-600 mb-2">Original</div>
                <img src={preview} alt="Original" className="max-w-full h-auto rounded" />
              </div>

              {convertedUrl && (
                <>
                  <div className="bg-primary-50 p-3 sm:p-4 rounded-lg border border-primary-200">
                    <div className="text-xs text-neutral-600 mb-2">Converted ({targetFormat.toUpperCase()})</div>
                    <img src={convertedUrl} alt="Converted" className="max-w-full h-auto rounded" />
                  </div>
                  <button
                    onClick={handleDownload}
                    className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Download Image</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[200px] sm:min-h-[300px] text-neutral-400">
              <div className="text-center">
                <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm sm:text-base">Select an image to start</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

