'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileText, Loader2, Image as ImageIcon } from 'lucide-react'

// Dynamic import untuk pdfjs-dist (hanya di client-side)
let pdfjsLib: any = null
let isPdfjsInitialized = false

async function initializePdfjs() {
  if (isPdfjsInitialized && pdfjsLib) {
    return pdfjsLib
  }

  try {
    // Coba import dari node_modules dulu
    let pdfjsModule: any

    try {
      pdfjsModule = await import('pdfjs-dist')

      // Set worker source untuk local import
      if (typeof window !== 'undefined' && pdfjsModule.GlobalWorkerOptions) {
        const version = pdfjsModule.version || '5.4.394'
        pdfjsModule.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`
      }
    } catch (importError) {
      // Jika import gagal, gunakan CDN sebagai fallback
      console.warn('Local pdfjs-dist import failed, using CDN:', importError)

      // Load dari CDN menggunakan script tag
      // Gunakan versi yang lebih stabil dan kompatibel
      const version = '3.11.174' // Versi yang lebih stabil dan kompatibel
      const scriptId = 'pdfjs-dist-script'

      // Cek apakah sudah di-load sebelumnya
      if (!document.getElementById(scriptId)) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.id = scriptId
          // Gunakan jsdelivr sebagai alternatif yang lebih reliable
          script.src = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.min.js`
          script.crossOrigin = 'anonymous'

          let resolved = false

          script.onload = () => {
            // Tunggu sebentar untuk memastikan library sudah terinisialisasi
            setTimeout(() => {
              if (!resolved) {
                resolved = true
                resolve()
              }
            }, 100)
          }

          script.onerror = () => {
            // Coba fallback ke unpkg
            const fallbackScript = document.createElement('script')
            fallbackScript.id = scriptId
            fallbackScript.src = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.min.js`
            fallbackScript.crossOrigin = 'anonymous'

            fallbackScript.onload = () => {
              setTimeout(() => {
                if (!resolved) {
                  resolved = true
                  resolve()
                }
              }, 100)
            }

            fallbackScript.onerror = () => {
              if (!resolved) {
                resolved = true
                reject(new Error('Failed to load pdfjs-dist from CDN (both jsdelivr and unpkg failed)'))
              }
            }

            document.head.appendChild(fallbackScript)
          }

          document.head.appendChild(script)
        })
      }

      // Akses dari window global
      // pdfjs-dist v3 mengexport ke berbagai nama tergantung build
      // Tunggu sebentar untuk memastikan library sudah terinisialisasi
      await new Promise(resolve => setTimeout(resolve, 200))

      // Coba berbagai cara untuk mengakses pdfjs-dist
      pdfjsModule = (window as any).pdfjsLib ||
        (window as any).pdfjs ||
        (window as any).pdfjsDist ||
        (globalThis as any).pdfjsLib ||
        (globalThis as any).pdfjs

      // Jika masih tidak ditemukan, coba akses langsung dari script yang sudah di-load
      if (!pdfjsModule) {
        // pdfjs-dist v3 menggunakan UMD dan mungkin mengexport ke window dengan nama berbeda
        const scripts = document.getElementsByTagName('script')
        for (let i = 0; i < scripts.length; i++) {
          if (scripts[i].src.includes('pdfjs-dist')) {
            // Script sudah di-load, coba akses lagi setelah delay
            await new Promise(resolve => setTimeout(resolve, 300))
            pdfjsModule = (window as any).pdfjsLib ||
              (window as any).pdfjs ||
              (window as any).pdfjsDist
            if (pdfjsModule) break
          }
        }
      }

      if (!pdfjsModule) {
        throw new Error('pdfjs-dist tidak ditemukan setelah load dari CDN. Pastikan koneksi internet aktif dan coba refresh halaman.')
      }

      // Set worker source untuk CDN
      if (pdfjsModule.GlobalWorkerOptions) {
        pdfjsModule.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.js`
      }
    }

    pdfjsLib = pdfjsModule
    isPdfjsInitialized = true
    return pdfjsLib
  } catch (error) {
    console.error('Failed to initialize pdfjs-dist:', error)
    throw new Error('Gagal memuat library PDF. Pastikan koneksi internet aktif atau refresh halaman.')
  }
}

export function PDFToImages() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [extractMode, setExtractMode] = useState<'all' | 'selected'>('all')
  const [imageFormat, setImageFormat] = useState<'jpeg' | 'png'>('jpeg')
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('File harus berupa PDF!')
      return
    }

    setPdfFile(file)
    setError('')
    setImageUrls([])
    setSelectedPages([])

    try {
      // Initialize pdfjs-dist
      const pdfjs = await initializePdfjs()

      // Akses getDocument dengan cara yang aman
      const getDocument = (pdfjs as any).getDocument || pdfjs.getDocument
      if (!getDocument || typeof getDocument !== 'function') {
        throw new Error('getDocument tidak ditemukan di pdfjs-dist')
      }

      const arrayBuffer = await file.arrayBuffer()

      // Gunakan getDocument dengan cara yang benar
      const loadingTask = getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
      })

      const pdf = await loadingTask.promise
      setTotalPages(pdf.numPages)
      setSelectedPages(Array.from({ length: pdf.numPages }, (_, i) => i + 1))
    } catch (err: any) {
      console.error('PDF read error:', err)
      setError('Gagal membaca PDF. ' + (err.message || 'Pastikan file PDF valid.'))
      setPdfFile(null)
    }
  }

  const togglePage = (page: number) => {
    if (extractMode === 'all') return

    setSelectedPages(prev => {
      if (prev.includes(page)) {
        return prev.filter(p => p !== page)
      } else {
        return [...prev, page].sort((a, b) => a - b)
      }
    })
  }

  const extractImages = async () => {
    if (!pdfFile) {
      setError('Pilih file PDF terlebih dahulu!')
      return
    }

    const pagesToExtract = extractMode === 'all'
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : selectedPages.sort((a, b) => a - b)

    if (pagesToExtract.length === 0) {
      setError('Pilih minimal satu halaman!')
      return
    }

    setIsProcessing(true)
    setError('')
    setImageUrls([])

    try {
      // Initialize pdfjs-dist
      const pdfjs = await initializePdfjs()

      // Akses getDocument dengan cara yang aman
      const getDocument = (pdfjs as any).getDocument || pdfjs.getDocument
      if (!getDocument || typeof getDocument !== 'function') {
        throw new Error('getDocument tidak ditemukan di pdfjs-dist')
      }

      const arrayBuffer = await pdfFile.arrayBuffer()

      // Load PDF document
      const loadingTask = getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
      })

      const pdf = await loadingTask.promise
      const urls: string[] = []

      for (const pageNum of pagesToExtract) {
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 2.0 })

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) {
          console.warn(`Failed to get canvas context for page ${pageNum}`)
          continue
        }

        canvas.height = viewport.height
        canvas.width = viewport.width

        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }

        await page.render(renderContext).promise

        // Convert canvas to image
        const imageData = canvas.toDataURL(`image/${imageFormat}`, imageFormat === 'jpeg' ? 0.95 : 1.0)
        urls.push(imageData)
      }

      setImageUrls(urls)
    } catch (err: any) {
      console.error('PDF extraction error:', err)
      setError('Gagal mengekstrak gambar. ' + (err.message || 'Pastikan file PDF valid.'))
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `${pdfFile?.name.replace('.pdf', '')}_page_${extractMode === 'all' ? index + 1 : selectedPages[index]}.${imageFormat}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAll = () => {
    imageUrls.forEach((url, index) => {
      setTimeout(() => {
        downloadImage(url, index)
      }, index * 200)
    })
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">PDF to Images</h1>
        <p className="text-sm sm:text-base text-neutral-600">Ekstrak halaman PDF menjadi gambar</p>
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

        {pdfFile && totalPages > 0 && (
          <div className="bg-neutral-50 rounded-lg p-3 sm:p-4 mb-4 border border-neutral-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-neutral-900 text-xs sm:text-sm truncate">{pdfFile.name}</div>
                <div className="text-xs sm:text-sm text-neutral-600">
                  {totalPages} halaman
                </div>
              </div>
            </div>
          </div>
        )}

        {pdfFile && totalPages > 0 && (
          <>
            <div className="mb-4">
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Extract Mode
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    value="all"
                    checked={extractMode === 'all'}
                    onChange={(e) => {
                      setExtractMode(e.target.value as 'all' | 'selected')
                      if (e.target.value === 'all') {
                        setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1))
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm">Extract Semua Halaman</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    value="selected"
                    checked={extractMode === 'selected'}
                    onChange={(e) => setExtractMode(e.target.value as 'all' | 'selected')}
                    className="w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm">Pilih Halaman Tertentu</span>
                </label>
              </div>

              {extractMode === 'selected' && (
                <div className="bg-neutral-50 rounded-lg p-3 sm:p-4 border border-neutral-200">
                  <div className="text-xs sm:text-sm font-medium text-neutral-700 mb-2">
                    Pilih Halaman ({selectedPages.length} dipilih)
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-48 overflow-y-auto">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => togglePage(page)}
                        className={`p-2 rounded border text-xs sm:text-sm min-h-[44px] ${selectedPages.includes(page)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-300'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Format Gambar
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    value="jpeg"
                    checked={imageFormat === 'jpeg'}
                    onChange={(e) => setImageFormat(e.target.value as 'jpeg' | 'png')}
                    className="w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm">JPEG (Lebih Kecil)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    value="png"
                    checked={imageFormat === 'png'}
                    onChange={(e) => setImageFormat(e.target.value as 'jpeg' | 'png')}
                    className="w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm">PNG (Kualitas Tinggi)</span>
                </label>
              </div>
            </div>

            <button
              onClick={extractImages}
              disabled={isProcessing || (extractMode === 'selected' && selectedPages.length === 0)}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Extract Images
                </>
              )}
            </button>
          </>
        )}
      </div>

      {imageUrls.length > 0 && (
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4">
            {imageUrls.length} Gambar Berhasil Diekstrak!
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
            {imageUrls.length > 1 && (
              <button
                onClick={downloadAll}
                className="btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                Download Semua
              </button>
            )}
            {imageUrls.map((url, index) => (
              <button
                key={index}
                onClick={() => downloadImage(url, index)}
                className="btn-secondary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                Page {extractMode === 'all' ? index + 1 : selectedPages[index]}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Page ${index + 1}`}
                  className="w-full h-24 sm:h-32 object-cover rounded-lg border border-neutral-200"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

