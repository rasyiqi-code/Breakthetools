'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react'
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

export function PDFToExcel() {
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [totalPages, setTotalPages] = useState(0)
    const [selectedPages, setSelectedPages] = useState<number[]>([])
    const [extractMode, setExtractMode] = useState<'all' | 'selected'>('all')
    const [isProcessing, setIsProcessing] = useState(false)
    const [excelUrl, setExcelUrl] = useState<string>('')
    const [error, setError] = useState('')
    const [warning, setWarning] = useState('')
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
        setWarning('')
        setExcelUrl('')
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

    // Simple table detection from text items
    const detectTable = (textItems: any[]): string[][] => {
        // Group items by Y position (rows)
        const rows: { [key: number]: any[] } = {}

        textItems.forEach((item) => {
            const y = Math.round((item.transform[5] || 0) / 10) // Round to group similar Y positions
            if (!rows[y]) {
                rows[y] = []
            }
            rows[y].push(item)
        })

        // Sort rows by Y position (top to bottom)
        const sortedRows = Object.keys(rows)
            .map(Number)
            .sort((a, b) => b - a) // Reverse because PDF Y is bottom-up
            .map(y => rows[y])

        // Sort items in each row by X position (left to right)
        const table: string[][] = []
        sortedRows.forEach(rowItems => {
            rowItems.sort((a, b) => (a.transform[4] || 0) - (b.transform[4] || 0))
            const row = rowItems.map(item => item.str || '').filter(str => str.trim())
            if (row.length > 0) {
                table.push(row)
            }
        })

        return table
    }

    const convertToExcel = async () => {
        if (!pdfFile) {
            setError('Please select a PDF file first!')
            return
        }

        const pagesToExtract = extractMode === 'all'
            ? Array.from({ length: totalPages }, (_, i) => i + 1)
            : selectedPages.sort((a, b) => a - b)

        if (pagesToExtract.length === 0) {
            setError('Please select at least one page!')
            return
        }

        setIsProcessing(true)
        setError('')
        setWarning('')
        setExcelUrl('')

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

            // Extract table data from PDF pages (client-side)
            const pagesData: Array<{ pageNum: number; table: string[][] }> = []

            for (const pageNum of pagesToExtract) {
                const pageIndex = pageNum - 1

                // Skip invalid page indices
                if (pageIndex < 0 || pageIndex >= numPages) {
                    console.warn(`Skipping page ${pageNum}: index ${pageIndex} out of range [0, ${numPages - 1}]`)
                    continue
                }

                try {
                    const page = await pdf.getPage(pageIndex)
                    const textContent = await page.getTextContent()

                    const table = detectTable(textContent.items as any[])

                    if (table.length > 0) {
                        pagesData.push({ pageNum, table })
                    }
                } catch (pageError: any) {
                    // Skip halaman yang error, lanjut ke halaman berikutnya
                    console.warn(`Skipping page ${pageNum} due to error:`, pageError?.message || pageError?.toString())
                    continue
                }
            }

            if (pagesData.length === 0) {
                setWarning('No tables detected in the selected pages. Please ensure your PDF contains structured tables.')
                setIsProcessing(false)
                return
            }

            // Send table data to API route for Excel generation (ExcelJS tidak kompatibel dengan client-side)
            const formData = new FormData()
            formData.append('pdf', pdfFile)
            formData.append('pages', JSON.stringify(pagesData))

            const response = await fetch('/api/converter/pdf-to-excel', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                throw new Error(errorData.error || 'Failed to convert PDF to Excel')
            }

            // Get Excel file from response
            const excelBlob = await response.blob()
            const url = URL.createObjectURL(excelBlob)
            setExcelUrl(url)
        } catch (err: any) {
            console.error('PDF to Excel conversion error:', err)
            setError('Failed to convert PDF to Excel' + (err.message ? ': ' + err.message : ''))
        } finally {
            setIsProcessing(false)
        }
    }

    const downloadExcel = () => {
        if (!excelUrl) return

        const link = document.createElement('a') as HTMLAnchorElement
        link.href = excelUrl
        link.download = pdfFile?.name.replace('.pdf', '.xlsx') || 'converted.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(excelUrl)
    }

    return (
        <div className="max-w-full sm:max-w-4xl mx-auto w-full px-4">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">PDF to Excel</h1>
                <p className="text-sm sm:text-base text-neutral-600">
                    Extract tables from PDF to Excel (limited to PDFs with structured tables)
                </p>
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-yellow-800">
                        This tool works best with PDFs that contain well-structured tables. Complex layouts may not convert perfectly.
                    </p>
                </div>
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
                {warning && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">{warning}</p>
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
                        onClick={convertToExcel}
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
                                <FileSpreadsheet className="w-4 h-4" />
                                Convert to Excel
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Download Button */}
            {excelUrl && (
                <div className="tool-card p-4 sm:p-6 w-full">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-neutral-900">Excel File Ready</h3>
                        <button
                            onClick={downloadExcel}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 min-h-[44px]"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                    </div>
                    <p className="text-sm text-neutral-600">
                        Your Excel file is ready for download.
                    </p>
                </div>
            )}
        </div>
    )
}

