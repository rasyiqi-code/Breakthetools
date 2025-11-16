'use client'

import { useState, useRef } from 'react'
import { Upload, Download, Image as ImageIcon, FileText, Loader2, X } from 'lucide-react'
import jsPDF from 'jspdf'

interface ImageFile {
  file: File
  id: string
  name: string
  preview: string
}

type PageSize = 'a4' | 'letter' | 'legal' | 'custom'
type Orientation = 'portrait' | 'landscape'
type Layout = 'single' | 'multiple'

export function ImageToPDF() {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  const [pageSize, setPageSize] = useState<PageSize>('a4')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [layout, setLayout] = useState<Layout>('single')
  const [customWidth, setCustomWidth] = useState(210) // mm
  const [customHeight, setCustomHeight] = useState(297) // mm
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const pageSizes = {
    a4: { width: 210, height: 297 },
    letter: { width: 216, height: 279 },
    legal: { width: 216, height: 356 },
    custom: { width: customWidth, height: customHeight }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      setError('Pilih file gambar terlebih dahulu!')
      return
    }

    const newFiles: ImageFile[] = []
    
    imageFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newFile: ImageFile = {
          file,
          id: Math.random().toString(36).substring(7),
          name: file.name,
          preview: e.target?.result as string
        }
        newFiles.push(newFile)
        
        if (newFiles.length === imageFiles.length) {
          setImageFiles(prev => [...prev, ...newFiles])
          setError('')
          setPdfUrl('')
        }
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (id: string) => {
    setImageFiles(prev => prev.filter(f => f.id !== id))
    setPdfUrl('')
  }

  const convertToPDF = async () => {
    if (imageFiles.length === 0) {
      setError('Pilih minimal satu gambar!')
      return
    }

    setIsProcessing(true)
    setError('')
    setPdfUrl('')

    try {
      const size = pageSizes[pageSize]
      const width = orientation === 'landscape' ? size.height : size.width
      const height = orientation === 'landscape' ? size.width : size.height

      const pdf = new jsPDF({
        orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
        unit: 'mm',
        format: pageSize === 'custom' ? [width, height] : [size.width, size.height]
      })

      if (layout === 'single') {
        // Satu gambar per halaman
        for (let i = 0; i < imageFiles.length; i++) {
          if (i > 0) {
            pdf.addPage()
          }

          const img = new Image()
          img.src = imageFiles[i].preview
          
          await new Promise((resolve) => {
            img.onload = () => {
              const imgWidth = img.width
              const imgHeight = img.height
              const ratio = Math.min(width / imgWidth, height / imgHeight) * 0.95
              
              const x = (width - imgWidth * ratio) / 2
              const y = (height - imgHeight * ratio) / 2
              
              pdf.addImage(
                imageFiles[i].preview,
                'JPEG',
                x,
                y,
                imgWidth * ratio,
                imgHeight * ratio
              )
              resolve(null)
            }
          })
        }
      } else {
        // Multiple images per page (2x2 grid)
        const imagesPerPage = 4
        let currentPage = 0
        let imagesOnCurrentPage = 0

        for (let i = 0; i < imageFiles.length; i++) {
          if (imagesOnCurrentPage === 0) {
            if (currentPage > 0) {
              pdf.addPage()
            }
            currentPage++
          }

          const img = new Image()
          img.src = imageFiles[i].preview
          
          await new Promise((resolve) => {
            img.onload = () => {
              const imgWidth = img.width
              const imgHeight = img.height
              const cellWidth = width / 2
              const cellHeight = height / 2
              const ratio = Math.min(cellWidth / imgWidth, cellHeight / imgHeight) * 0.9
              
              const col = imagesOnCurrentPage % 2
              const row = Math.floor(imagesOnCurrentPage / 2)
              const x = col * cellWidth + (cellWidth - imgWidth * ratio) / 2
              const y = row * cellHeight + (cellHeight - imgHeight * ratio) / 2
              
              pdf.addImage(
                imageFiles[i].preview,
                'JPEG',
                x,
                y,
                imgWidth * ratio,
                imgHeight * ratio
              )
              
              imagesOnCurrentPage = (imagesOnCurrentPage + 1) % imagesPerPage
              resolve(null)
            }
          })
        }
      }

      const pdfBlob = pdf.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
    } catch (err: any) {
      setError('Gagal membuat PDF. ' + (err.message || 'Pastikan semua gambar valid.'))
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadPDF = () => {
    if (!pdfUrl) return
    
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = 'images.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Image to PDF</h1>
        <p className="text-sm sm:text-base text-neutral-600">Konversi gambar menjadi file PDF</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Upload Images
        </label>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="btn-primary flex items-center justify-center gap-2 cursor-pointer min-h-[44px] text-sm sm:text-base"
          >
            <Upload className="w-4 h-4" />
            Pilih Images
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 mb-4">
            <div className="text-xs sm:text-sm text-red-800">⚠️ {error}</div>
          </div>
        )}

        {imageFiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
            {imageFiles.map((imageFile) => (
              <div key={imageFile.id} className="relative group">
                <img
                  src={imageFile.preview}
                  alt={imageFile.name}
                  className="w-full h-24 sm:h-32 object-cover rounded-lg border border-neutral-200"
                />
                <button
                  onClick={() => removeImage(imageFile.id)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {imageFiles.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Page Size
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as PageSize)}
                  className="input-field w-full text-sm sm:text-base min-h-[44px]"
                >
                  <option value="a4">A4 (210 x 297 mm)</option>
                  <option value="letter">Letter (216 x 279 mm)</option>
                  <option value="legal">Legal (216 x 356 mm)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {pageSize === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-2 block">
                      Width (mm)
                    </label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      className="input-field w-full text-sm sm:text-base min-h-[44px]"
                      min="50"
                      max="500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-2 block">
                      Height (mm)
                    </label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      className="input-field w-full text-sm sm:text-base min-h-[44px]"
                      min="50"
                      max="500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as Orientation)}
                  className="input-field w-full text-sm sm:text-base min-h-[44px]"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Layout
                </label>
                <select
                  value={layout}
                  onChange={(e) => setLayout(e.target.value as Layout)}
                  className="input-field w-full text-sm sm:text-base min-h-[44px]"
                >
                  <option value="single">Single (1 per page)</option>
                  <option value="multiple">Multiple (2x2 grid)</option>
                </select>
              </div>
            </div>

            <button
              onClick={convertToPDF}
              disabled={isProcessing}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Convert to PDF
                </>
              )}
            </button>
          </>
        )}
      </div>

      {pdfUrl && (
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4">
            PDF Berhasil Dibuat!
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadPDF}
              className="btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <a
              href={pdfUrl}
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

