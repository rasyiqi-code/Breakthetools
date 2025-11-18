'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileText, Loader2, Code } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
      const version = '3.11.174'
      const scriptId = 'pdfjs-dist-script'

      // Cek apakah sudah di-load sebelumnya
      if (typeof window !== 'undefined' && !document.getElementById(scriptId)) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.id = scriptId
          script.src = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.min.js`
          script.crossOrigin = 'anonymous'

          let resolved = false

          script.onload = () => {
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
                reject(new Error('Failed to load pdfjs-dist from CDN'))
              }
            }

            document.head.appendChild(fallbackScript)
          }

          document.head.appendChild(script)
        })
      }

      // Tunggu sebentar untuk memastikan library sudah terinisialisasi
      if (typeof window !== 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 200))

        // Coba berbagai cara untuk mengakses pdfjs-dist
        pdfjsModule = (window as any).pdfjsLib ||
          (window as any).pdfjs ||
          (window as any).pdfjsDist ||
          (globalThis as any).pdfjsLib ||
          (globalThis as any).pdfjs

        if (!pdfjsModule) {
          await new Promise(resolve => setTimeout(resolve, 300))
          pdfjsModule = (window as any).pdfjsLib ||
            (window as any).pdfjs ||
            (window as any).pdfjsDist
        }

        if (!pdfjsModule) {
          throw new Error('pdfjs-dist not found after loading from CDN')
        }

        // Set worker source untuk CDN
        if (pdfjsModule.GlobalWorkerOptions) {
          pdfjsModule.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.js`
        }
      }
    }

    pdfjsLib = pdfjsModule
    isPdfjsInitialized = true
    return pdfjsLib
  } catch (error) {
    console.error('Failed to initialize pdfjs-dist:', error)
    throw new Error('Failed to load PDF library. Please refresh the page.')
  }
}

export function PDFToHTML() {
  const t = useTranslations('tools')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [extractMode, setExtractMode] = useState<'all' | 'selected'>('all')
  const [isProcessing, setIsProcessing] = useState(false)
  const [htmlOutput, setHtmlOutput] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError(t('pdfToHtml.errors.invalidFile'))
      return
    }

    setPdfFile(file)
    setError('')
    setHtmlOutput('')
    setSelectedPages([])

    try {
      const pdfjs = await initializePdfjs()
      const getDocument = (pdfjs as any).getDocument || pdfjs.getDocument
      if (!getDocument || typeof getDocument !== 'function') {
        throw new Error('getDocument not found in pdfjs-dist')
      }

      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
      })

      const pdf = await loadingTask.promise
      setTotalPages(pdf.numPages)
      setSelectedPages(Array.from({ length: pdf.numPages }, (_, i) => i + 1))
    } catch (err: any) {
      console.error('PDF read error:', err)
      setError(t('pdfToHtml.errors.readFailed') + (err.message ? ': ' + err.message : ''))
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

  const convertToHTML = async () => {
    if (!pdfFile) {
      setError(t('pdfToHtml.errors.noFile'))
      return
    }

    const pagesToConvert = extractMode === 'all'
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : selectedPages.sort((a, b) => a - b)

    if (pagesToConvert.length === 0) {
      setError(t('pdfToHtml.errors.noPages'))
      return
    }

    setIsProcessing(true)
    setError('')
    setHtmlOutput('')

    try {
      const pdfjs = await initializePdfjs()
      const getDocument = (pdfjs as any).getDocument || pdfjs.getDocument
      if (!getDocument || typeof getDocument !== 'function') {
        throw new Error('getDocument not found in pdfjs-dist')
      }

      const arrayBuffer = await pdfFile.arrayBuffer()
      const loadingTask = getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
      })

      const pdf = await loadingTask.promise
      
      // Ensure PDF is fully loaded
      const numPages = pdf.numPages || totalPages
      
      let htmlContent = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>Converted PDF</title>\n<style>\nbody { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }\n.page { page-break-after: always; margin-bottom: 40px; padding: 20px; border: 1px solid #ddd; }\n</style>\n</head>\n<body>\n'

      for (const pageNum of pagesToConvert) {
        const pageIndex = pageNum - 1 // pdfjs uses 0-based indexing
        
        // Skip invalid page indices
        if (pageIndex < 0 || pageIndex >= numPages) {
          console.warn(`Skipping page ${pageNum}: index ${pageIndex} out of range [0, ${numPages - 1}]`)
          continue
        }
        
        try {
          const page = await pdf.getPage(pageIndex)
          const textContent = await page.getTextContent()
          
          htmlContent += `<div class="page">\n`
          htmlContent += `<h2>${t('pdfToHtml.page')} ${pageNum}</h2>\n`
          
          // Render text with positioning
          let lastY = -1
          let currentParagraph = ''
          
          for (const item of textContent.items as any[]) {
            const y = item.transform[5] || 0
            
            // New line if Y position changed significantly
            if (lastY !== -1 && Math.abs(y - lastY) > 5) {
              if (currentParagraph.trim()) {
                htmlContent += `<p>${currentParagraph.trim()}</p>\n`
                currentParagraph = ''
              }
            }
            
            currentParagraph += item.str + ' '
            lastY = y
          }
          
          // Add remaining paragraph
          if (currentParagraph.trim()) {
            htmlContent += `<p>${currentParagraph.trim()}</p>\n`
          }
          
          htmlContent += `</div>\n`
        } catch (pageError: any) {
          // Skip halaman yang error, lanjut ke halaman berikutnya
          console.warn(`Skipping page ${pageNum} due to error:`, pageError?.message || pageError?.toString())
          continue
        }
      }

      htmlContent += '</body>\n</html>'
      setHtmlOutput(htmlContent)
    } catch (err: any) {
      console.error('HTML conversion error:', err)
      setError(t('pdfToHtml.errors.conversionFailed') + (err.message ? ': ' + err.message : ''))
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadHTML = () => {
    if (!htmlOutput) return

    const blob = new Blob([htmlOutput], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a') as HTMLAnchorElement
    link.href = url
    link.download = pdfFile?.name.replace('.pdf', '.html') || 'converted-pdf.html'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto w-full px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('pdfToHtml.title')}</h1>
        <p className="text-sm sm:text-base text-neutral-600">
          {t('pdfToHtml.description')}
        </p>
      </div>

      {/* File Upload */}
      <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          {t('pdfToHtml.selectPDF')}
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Upload className="w-4 h-4" />
              {pdfFile ? pdfFile.name : t('pdfToHtml.chooseFile')}
            </button>
            {pdfFile && (
              <p className="text-xs text-neutral-500 mt-2">
                {formatFileSize(pdfFile.size)} • {totalPages} {totalPages === 1 ? t('pdfToHtml.page') : t('pdfToHtml.pages')}
              </p>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Page Selection */}
      {pdfFile && totalPages > 0 && (
        <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              {t('pdfToHtml.selectPages')}
            </label>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  setExtractMode('all')
                  setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1))
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                  extractMode === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {t('pdfToHtml.allPages')}
              </button>
              <button
                onClick={() => setExtractMode('selected')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                  extractMode === 'selected'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {t('pdfToHtml.selectedPages')}
              </button>
            </div>

            {extractMode === 'selected' && (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 border border-neutral-200 rounded-lg">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => togglePage(page)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors min-h-[44px] ${
                      selectedPages.includes(page)
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={convertToHTML}
            disabled={isProcessing || (extractMode === 'selected' && selectedPages.length === 0)}
            className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('pdfToHtml.processing')}
              </>
            ) : (
              <>
                <Code className="w-4 h-4" />
                {t('pdfToHtml.convert')}
              </>
            )}
          </button>
        </div>
      )}

      {/* HTML Output */}
      {htmlOutput && (
        <div className="tool-card p-4 sm:p-6 w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-neutral-900">{t('pdfToHtml.htmlOutput')}</h3>
            <button
              onClick={downloadHTML}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              {t('pdfToHtml.download')}
            </button>
          </div>
          <textarea
            value={htmlOutput}
            readOnly
            className="w-full p-4 border border-neutral-300 rounded-lg font-mono text-xs sm:text-sm bg-neutral-50 min-h-[300px] max-h-[600px] overflow-y-auto"
            placeholder={t('pdfToHtml.htmlOutputPlaceholder')}
          />
          <p className="text-xs text-neutral-500 mt-2">
            {htmlOutput.length} {t('pdfToHtml.characters')}
          </p>
        </div>
      )}
    </div>
  )
}

