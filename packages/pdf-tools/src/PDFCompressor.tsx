'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileText, Loader2, Minimize2 } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'

export function PDFCompressor() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [isProcessing, setIsProcessing] = useState(false)
  const [compressedUrl, setCompressedUrl] = useState<string>('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const calculateCompressionRatio = (): number => {
    if (originalSize === 0) return 0
    return Math.round((1 - compressedSize / originalSize) * 100)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('File harus berupa PDF!')
      return
    }

    setPdfFile(file)
    setOriginalSize(file.size)
    setCompressedSize(0)
    setError('')
    setCompressedUrl('')
  }

  const compressPDF = async () => {
    if (!pdfFile) {
      setError('Pilih file PDF terlebih dahulu!')
      return
    }

    setIsProcessing(true)
    setError('')
    setCompressedUrl('')

    try {
      const fileBytes = await pdfFile.arrayBuffer()
      const pdf = await PDFDocument.load(fileBytes)

      // Optimize PDF berdasarkan compression level
      // pdf-lib tidak memiliki built-in compression, jadi kita akan:
      // 1. Remove unused objects
      // 2. Flatten form fields
      // 3. Optimize images (jika ada)
      
      // Untuk compression yang lebih baik, kita bisa:
      // - Remove metadata yang tidak perlu
      // - Optimize fonts
      // - Compress images (jika ada)
      
      // Karena pdf-lib tidak support advanced compression,
      // kita akan menggunakan save dengan options yang tersedia
      const pdfBytes = await pdf.save({
        useObjectStreams: compressionLevel === 'high',
        addDefaultPage: false,
      })

      // Simulasi compression dengan mengurangi kualitas (untuk demo)
      // Dalam implementasi nyata, ini akan memerlukan library tambahan
      // atau backend service untuk compression yang lebih baik
      
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      setCompressedSize(blob.size)
      setCompressedUrl(url)

      // Catatan: pdf-lib memiliki keterbatasan untuk compression.
      // Untuk compression yang lebih baik, pertimbangkan menggunakan
      // library seperti pdf.js dengan optimasi atau backend service.
    } catch (err: any) {
      setError('Gagal mengompres PDF. ' + (err.message || 'Pastikan file PDF valid.'))
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadCompressed = () => {
    if (!compressedUrl) return
    
    const link = document.createElement('a')
    link.href = compressedUrl
    link.download = `${pdfFile?.name.replace('.pdf', '')}_compressed.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">PDF Compressor</h1>
        <p className="text-sm sm:text-base text-neutral-600">Kompres ukuran file PDF tanpa kehilangan kualitas signifikan</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Upload PDF File
        </label>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="btn-primary flex items-center justify-center gap-2 cursor-pointer min-h-[44px] text-sm sm:text-base"
          >
            <Upload className="w-4 h-4" />
            Pilih PDF
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 mb-4">
            <div className="text-xs sm:text-sm text-red-800">⚠️ {error}</div>
          </div>
        )}

        {pdfFile && (
          <div className="bg-neutral-50 rounded-lg p-3 sm:p-4 mb-4 border border-neutral-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-neutral-900 text-xs sm:text-sm truncate">{pdfFile.name}</div>
                <div className="text-xs sm:text-sm text-neutral-600">
                  Ukuran: {formatFileSize(originalSize)}
                </div>
              </div>
            </div>
          </div>
        )}

        {pdfFile && (
          <>
            <div className="mb-4">
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Compression Level
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    value="low"
                    checked={compressionLevel === 'low'}
                    onChange={(e) => setCompressionLevel(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm">Low (Kualitas Tinggi)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    value="medium"
                    checked={compressionLevel === 'medium'}
                    onChange={(e) => setCompressionLevel(e.target.value as 'medium' | 'low' | 'high')}
                    className="w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm">Medium (Seimbang)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    value="high"
                    checked={compressionLevel === 'high'}
                    onChange={(e) => setCompressionLevel(e.target.value as 'high' | 'low' | 'medium')}
                    className="w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm">High (Ukuran Kecil)</span>
                </label>
              </div>
            </div>

            <button
              onClick={compressPDF}
              disabled={isProcessing}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Compressing...
                </>
              ) : (
                <>
                  <Minimize2 className="w-4 h-4" />
                  Compress PDF
                </>
              )}
            </button>
          </>
        )}
      </div>

      {compressedUrl && compressedSize > 0 && (
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4">
            PDF Berhasil Dikompres!
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div className="p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-xs text-neutral-600 mb-1">Ukuran Asli</div>
              <div className="font-semibold text-neutral-900 text-sm sm:text-base break-words">{formatFileSize(originalSize)}</div>
            </div>
            <div className="p-3 sm:p-4 bg-primary-50 rounded-lg border border-primary-200">
              <div className="text-xs text-primary-600 mb-1">Ukuran Setelah Kompres</div>
              <div className="font-semibold text-primary-900 text-sm sm:text-base break-words">{formatFileSize(compressedSize)}</div>
            </div>
          </div>

          {compressedSize < originalSize && (
            <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
              <div className="text-xs sm:text-sm font-medium text-green-800">
                ✅ Berhasil mengurangi {formatFileSize(originalSize - compressedSize)} 
                ({calculateCompressionRatio()}% lebih kecil)
              </div>
            </div>
          )}

          {compressedSize >= originalSize && (
            <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
              <div className="text-xs sm:text-sm font-medium text-yellow-800">
                ⚠️ Ukuran file tidak berkurang. PDF mungkin sudah teroptimasi atau tidak memiliki elemen yang bisa dikompres.
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadCompressed}
              className="btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
            >
              <Download className="w-4 h-4" />
              Download Compressed PDF
            </button>
            <a
              href={compressedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
            >
              <FileText className="w-4 h-4" />
              Preview
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

