'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileText, Loader2 } from 'lucide-react'
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

export function PDFToText() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [extractMode, setExtractMode] = useState<'all' | 'selected'>('all')
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedText, setExtractedText] = useState('')
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
      setError('Please select a valid PDF file!')
      return
    }

    setPdfFile(file)
    setError('')
    setExtractedText('')
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
      setError('Failed to read PDF' + (err.message ? ': ' + err.message : ''))
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

  const extractText = async () => {
    if (!pdfFile) {
      setError('Please select a PDF file first!')
      return
    }

    setIsProcessing(true)
    setError('')
    setExtractedText('')

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

      // Wait for PDF to be fully loaded
      const pdf = await loadingTask.promise

      // Validate PDF object exists
      if (!pdf || typeof pdf !== 'object') {
        throw new Error('Failed to load PDF: PDF object is invalid')
      }

      // Ensure PDF is fully loaded by accessing numPages first
      // This helps ensure PDF object is fully initialized
      const initialNumPages = pdf.numPages
      if (!initialNumPages || typeof initialNumPages !== 'number' || initialNumPages <= 0) {
        throw new Error('Failed to load PDF: Invalid numPages')
      }

      // Wait a bit to ensure PDF object is fully initialized, especially with CDN version
      await new Promise(resolve => setTimeout(resolve, 100))

      // Verify PDF object is still valid after delay
      if (!pdf || typeof pdf !== 'object' || !pdf.getPage) {
        throw new Error('Failed to load PDF: PDF object is not ready')
      }

      // Get number of pages directly from PDF object (same as handleFileSelect and other tools)
      // pdf.numPages is always available for a valid PDF object
      let numPages: number

      if (pdf.numPages !== undefined && typeof pdf.numPages === 'number' && pdf.numPages > 0) {
        numPages = pdf.numPages
      } else {
        // Fallback: use state totalPages if available
        if (totalPages && totalPages > 0) {
          numPages = totalPages
          console.warn(`Using totalPages state (${totalPages}) as pdf.numPages is invalid: ${pdf.numPages}`)
        } else {
          console.error('PDF numPages validation failed:', {
            pdfNumPages: pdf.numPages,
            type: typeof pdf.numPages,
            totalPagesState: totalPages,
            pdfObject: pdf
          })
          throw new Error(`Invalid PDF: Could not determine number of pages (got: ${pdf.numPages}). Please try selecting the file again.`)
        }
      }

      // Validate numPages is a positive integer
      if (!Number.isInteger(numPages) || numPages <= 0) {
        throw new Error(`Invalid PDF: numPages must be a positive integer (got: ${numPages})`)
      }

      console.log(`PDF loaded successfully. Total pages: ${numPages}`)

      // Update totalPages state if it's different (sync state with actual PDF)
      if (totalPages !== numPages) {
        setTotalPages(numPages)
      }

      // Double-check numPages from PDF object one more time before generating pages
      // Sometimes PDF object might need a moment to fully initialize or CDN version behaves differently
      let actualNumPages = numPages

      // Try to get numPages from PDF object again
      if (pdf.numPages !== undefined && typeof pdf.numPages === 'number' && pdf.numPages > 0) {
        actualNumPages = pdf.numPages
      }

      // Use the smaller of the two values to be safe (PDF might report more pages than available)
      if (actualNumPages !== numPages) {
        const minNumPages = Math.min(actualNumPages, numPages)
        console.warn(`numPages mismatch: PDF.numPages=${actualNumPages}, calculated=${numPages}, using minimum=${minNumPages}`)
        numPages = minNumPages
        setTotalPages(numPages)
      }

      // Ensure numPages is reasonable (sanity check)
      if (numPages > 10000) {
        console.warn(`numPages seems unreasonably large: ${numPages}, capping at 1000`)
        numPages = 1000
      }

      // Final validation before proceeding
      if (!numPages || numPages <= 0 || !Number.isInteger(numPages)) {
        throw new Error(`Invalid numPages before extraction: ${numPages}`)
      }

      // Generate pages to extract based on actual numPages (not state)
      let pagesToExtract: number[]

      if (extractMode === 'all') {
        // Generate array of all pages [1, 2, 3, ..., numPages]
        // Ensure we don't exceed actual PDF pages
        pagesToExtract = Array.from({ length: numPages }, (_, i) => i + 1)
      } else {
        // Use selected pages, but filter out invalid ones immediately
        const sortedSelected = selectedPages.sort((a, b) => a - b)
        pagesToExtract = sortedSelected.filter(pageNum => {
          if (typeof pageNum !== 'number' || !Number.isInteger(pageNum) || pageNum <= 0) {
            return false
          }
          const pageIndex = pageNum - 1
          return pageIndex >= 0 && pageIndex < numPages
        })
      }

      if (pagesToExtract.length === 0) {
        const errorMsg = extractMode === 'all'
          ? `No pages available. Total pages: ${numPages}`
          : `No valid selected pages. Selected: ${selectedPages.join(', ')}, Total pages: ${numPages}`
        setError('Please select at least one page!')
        console.error(errorMsg)
        setIsProcessing(false)
        return
      }

      // Additional validation - ensure all pages are within valid range
      const validPagesToExtract = pagesToExtract.filter(pageNum => {
        if (typeof pageNum !== 'number' || !Number.isInteger(pageNum) || pageNum <= 0) {
          console.warn(`Invalid page number type: ${pageNum}`)
          return false
        }
        const pageIndex = pageNum - 1
        if (pageIndex < 0 || pageIndex >= numPages) {
          console.warn(`Invalid page number: ${pageNum} (total pages: ${numPages})`)
          return false
        }
        return true
      })

      if (validPagesToExtract.length === 0) {
        throw new Error(`No valid pages found after filtering. Requested: ${pagesToExtract.join(', ')}, Total pages: ${numPages}`)
      }

      console.log(`Extracting pages: ${validPagesToExtract.join(', ')} from ${numPages} total pages (PDF.numPages: ${pdf.numPages})`)

      let allText = ''

      for (const pageNum of validPagesToExtract) {
        // Convert 1-based page number to 0-based pdfjs index
        const pageIndex = pageNum - 1

        // Final validation before calling getPage (should never fail after filtering, but safety check)
        if (pageIndex < 0 || pageIndex >= numPages) {
          console.warn(`Skipping page ${pageNum}: index ${pageIndex} out of range [0, ${numPages - 1}]`)
          continue
        }

        try {
          // Extra validation: ensure pageIndex is valid before calling getPage
          if (typeof pageIndex !== 'number' || !Number.isInteger(pageIndex) || pageIndex < 0 || pageIndex >= numPages) {
            console.warn(`Skipping invalid page index: ${pageIndex} for page ${pageNum}`)
            continue
          }

          // Ensure PDF object has getPage method before calling
          if (!pdf || typeof pdf.getPage !== 'function') {
            console.warn(`PDF object does not have getPage method, skipping page ${pageNum}`)
            continue
          }

          // Call getPage - skip jika error, fokus pada ekstraksi yang berhasil
          let page
          try {
            page = await pdf.getPage(pageIndex)
          } catch (getPageError: any) {
            // Abaikan error dan skip ke halaman berikutnya
            console.warn(`Skipping page ${pageNum} (index ${pageIndex}) due to error:`, getPageError?.message || getPageError?.toString())
            continue
          }

          if (!page) {
            console.warn(`Page object is null for page ${pageNum}, skipping`)
            continue
          }

          let textContent
          try {
            textContent = await page.getTextContent()
          } catch (textError: any) {
            console.warn(`Failed to get text content for page ${pageNum}, skipping:`, textError?.message)
            continue
          }

          if (!textContent || !textContent.items) {
            console.warn(`Page ${pageNum} has no text content`)
            // Lanjut ke halaman berikutnya tanpa menambahkan placeholder
            continue
          }

          // Extract text items and combine them
          const pageText = textContent.items
            .map((item: any) => item.str || '')
            .filter((str: string) => str.length > 0)
            .join(' ')

          if (extractMode === 'all' && numPages > 1) {
            allText += `--- Page ${pageNum} ---\n\n${pageText}\n\n`
          } else {
            allText += pageText + '\n'
          }
        } catch (pageError: any) {
          // Handle "Invalid page request" error specifically
          const errorMessage = pageError.message || pageError.toString() || 'Unknown error'
          const isInvalidPageRequest = errorMessage.includes('Invalid page request') || errorMessage.includes('Invalid page')

          if (isInvalidPageRequest) {
            console.error(`Invalid page request for page ${pageNum} (index ${pageIndex}). numPages: ${numPages}, PDF:`, {
              numPages: pdf.numPages,
              pageIndex,
              pageNum,
              totalPages
            })
            // Skip this page and continue
            continue
          } else {
            console.error(`Error extracting page ${pageNum} (index ${pageIndex}):`, pageError)
            // Continue with other pages even if one fails
            allText += `\n--- Error extracting page ${pageNum}: ${errorMessage} ---\n\n`
          }
        }
      }

      setExtractedText(allText.trim())
    } catch (err: any) {
      console.error('Text extraction error:', err)
      setError('Failed to extract text from PDF' + (err.message ? ': ' + err.message : ''))
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadText = () => {
    if (!extractedText) return

    const blob = new Blob([extractedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a') as HTMLAnchorElement
    link.href = url
    link.download = pdfFile?.name.replace('.pdf', '.txt') || 'extracted-text.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto w-full px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">PDF to Text</h1>
        <p className="text-sm sm:text-base text-neutral-600">
          Extract text from PDF to .txt file
        </p>
      </div>

      {/* File Upload */}
      <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Select PDF File
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
              {pdfFile ? pdfFile.name : 'Choose PDF File'}
            </button>
            {pdfFile && (
              <p className="text-xs text-neutral-500 mt-2">
                {formatFileSize(pdfFile.size)} • {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
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
              Select Pages to Extract
            </label>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  setExtractMode('all')
                  setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1))
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${extractMode === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
              >
                All Pages
              </button>
              <button
                onClick={() => setExtractMode('selected')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${extractMode === 'selected'
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
              >
                Selected Pages
              </button>
            </div>

            {extractMode === 'selected' && (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 border border-neutral-200 rounded-lg">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => togglePage(page)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors min-h-[44px] ${selectedPages.includes(page)
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
            onClick={extractText}
            disabled={isProcessing || (extractMode === 'selected' && selectedPages.length === 0)}
            className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Extract Text
              </>
            )}
          </button>
        </div>
      )}

      {/* Extracted Text */}
      {extractedText && (
        <div className="tool-card p-4 sm:p-6 w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-neutral-900">Extracted Text</h3>
            <button
              onClick={downloadText}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
          <textarea
            value={extractedText}
            readOnly
            className="w-full p-4 border border-neutral-300 rounded-lg font-mono text-sm bg-neutral-50 min-h-[300px] max-h-[600px] overflow-y-auto"
            placeholder="Extracted text will appear here..."
          />
          <p className="text-xs text-neutral-500 mt-2">
            {extractedText.length} characters
          </p>
        </div>
      )}
    </div>
  )
}

