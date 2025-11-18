'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileText, Loader2, AlertCircle } from 'lucide-react'
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
            const scriptId = 'pdfjs-dist-script-pdf-to-word'

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

export function PDFToWord() {
    const t = useTranslations('tools')
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.type !== 'application/pdf') {
            setError(t('pdfToWord.errors.invalidFile'))
            return
        }

        setPdfFile(file)
        setError('')
    }

    const convertToWord = async () => {
        if (!pdfFile) {
            setError(t('pdfToWord.errors.noFile'))
            return
        }

        setIsProcessing(true)
        setError('')

        try {
            // Initialize pdfjs-dist for PDF parsing
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
            const numPages = pdf.numPages || 1

            // Extract text from all pages
            const pagesData: Array<{ pageNum: number; text: string }> = []

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const pageIndex = pageNum - 1

                try {
                    const page = await pdf.getPage(pageIndex)
                    const textContent = await page.getTextContent()

                    if (textContent && textContent.items) {
                        // Extract text items and combine them
                        const pageText = textContent.items
                            .map((item: any) => item.str || '')
                            .filter((str: string) => str.length > 0)
                            .join(' ')
                            .trim()

                        if (pageText.length > 0) {
                            pagesData.push({ pageNum, text: pageText })
                        }
                    }
                } catch (pageError: any) {
                    console.warn(`Skipping page ${pageNum} due to error:`, pageError?.message || pageError?.toString())
                    continue
                }
            }

            if (pagesData.length === 0) {
                setError(t('pdfToWord.errors.noTextFound'))
                setIsProcessing(false)
                return
            }

            // Send PDF file and extracted text to API route for DOCX generation
            const formData = new FormData()
            formData.append('file', pdfFile)
            formData.append('pages', JSON.stringify(pagesData))

            const response = await fetch('/api/converter/pdf-to-word', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                // Try to get error message from response
                let errorMessage = t('pdfToWord.errors.serverError')
                try {
                    const errorData = await response.json()
                    if (errorData.error) {
                        errorMessage = errorData.error
                    }
                } catch {
                    // If response is not JSON, use default error message
                }
                throw new Error(errorMessage)
            }

            // Check if response is actually an error (e.g., 501 Not Implemented)
            const contentType = response.headers.get('content-type')
            if (contentType?.includes('application/json')) {
                const data = await response.json()
                if (data.error) {
                    throw new Error(data.error)
                }
            }

            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a') as HTMLAnchorElement
            link.href = url
            link.download = pdfFile.name.replace('.pdf', '.docx')
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (err: any) {
            console.error('PDF to Word conversion error:', err)
            setError(t('pdfToWord.errors.conversionFailed') + (err.message ? ': ' + err.message : ''))
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="max-w-full sm:max-w-4xl mx-auto w-full px-4">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('pdfToWord.title')}</h1>
                <p className="text-sm sm:text-base text-neutral-600">
                    {t('pdfToWord.description')}
                </p>
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-yellow-800">
                        {t('pdfToWord.serverSideNote')}
                    </p>
                </div>
            </div>

            {/* File Upload */}
            <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                    {t('pdfToWord.selectPDF')}
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
                            {pdfFile ? pdfFile.name : t('pdfToWord.chooseFile')}
                        </button>
                        {pdfFile && (
                            <p className="text-xs text-neutral-500 mt-2">
                                {formatFileSize(pdfFile.size)}
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

            {/* Convert Button */}
            {pdfFile && (
                <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
                    <button
                        onClick={convertToWord}
                        disabled={isProcessing}
                        className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('pdfToWord.processing')}
                            </>
                        ) : (
                            <>
                                <FileText className="w-4 h-4" />
                                {t('pdfToWord.convert')}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}

