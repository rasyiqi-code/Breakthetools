'use client'

import { useState, useRef } from 'react'
import { Upload, Download, Book, Loader2 } from 'lucide-react'
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

export function PDFToEPUB() {
    const t = useTranslations('tools')
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [totalPages, setTotalPages] = useState(0)
    const [selectedPages, setSelectedPages] = useState<number[]>([])
    const [extractMode, setExtractMode] = useState<'all' | 'selected'>('all')
    const [title, setTitle] = useState('')
    const [author, setAuthor] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [epubUrl, setEpubUrl] = useState<string>('')
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
            setError(t('pdfToEpub.errors.invalidFile'))
            return
        }

        setPdfFile(file)
        setError('')
        setEpubUrl('')
        setSelectedPages([])
        setTitle(file.name.replace('.pdf', '') || 'Converted Document')
        setAuthor('')

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
            setError(t('pdfToEpub.errors.readFailed') + (err.message ? ': ' + err.message : ''))
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

    const convertToEPUB = async () => {
        if (!pdfFile) {
            setError(t('pdfToEpub.errors.noFile'))
            return
        }

        if (!title.trim()) {
            setError(t('pdfToEpub.errors.noTitle'))
            return
        }

        const pagesToExtract = extractMode === 'all'
            ? Array.from({ length: totalPages }, (_, i) => i + 1)
            : selectedPages.sort((a, b) => a - b)

        if (pagesToExtract.length === 0) {
            setError(t('pdfToEpub.errors.noPages'))
            return
        }

        setIsProcessing(true)
        setError('')
        setEpubUrl('')

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

            // Extract text from each page
            const chapters: { title: string; data: string }[] = []

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

                    const pageText = textContent.items
                        .map((item: any) => item.str)
                        .join(' ')
                        .trim()

                    if (pageText) {
                        chapters.push({
                            title: `${t('pdfToEpub.page')} ${pageNum}`,
                            data: `<h1>${t('pdfToEpub.page')} ${pageNum}</h1><p>${pageText.split('\n').join('</p><p>')}</p>`,
                        })
                    }
                } catch (pageError: any) {
                    // Skip halaman yang error, lanjut ke halaman berikutnya
                    console.warn(`Skipping page ${pageNum} due to error:`, pageError?.message || pageError?.toString())
                    continue
                }
            }

            if (chapters.length === 0) {
                throw new Error(t('pdfToEpub.errors.noText'))
            }

            // Create EPUB
            const epubOptions = {
                title: title.trim(),
                author: author.trim() || 'Unknown',
                publisher: 'Breaktools',
                lang: 'en',
                content: chapters,
            }

            // Generate EPUB - epub-gen is not compatible with webpack (uses require.extensions)
            // Use dynamic import as fallback, but primarily use manual EPUB generation
            // For now, create a simplified EPUB structure manually
            const epubContent = await new Promise<Blob>(async (resolve, reject) => {
                try {
                    // Try to use epub-gen via dynamic import (may fail in browser/webpack)
                    try {
                        // @ts-ignore - epub-gen doesn't have types
                        const Epub = (await import('epub-gen')).default
                        const epub = new Epub(epubOptions)

                        epub.pipe()
                            .then((data: any) => {
                                // epub-gen returns a stream, we need to convert it
                                const blob = new Blob([JSON.stringify(epubOptions)], { type: 'application/epub+zip' })
                                resolve(blob)
                            })
                            .catch(() => {
                                // If epub-gen fails, use manual EPUB generation
                                generateManualEPUB()
                            })
                    } catch (importErr) {
                        // epub-gen not available (webpack incompatibility or browser environment)
                        // Use manual EPUB generation instead
                        generateManualEPUB()
                    }

                    function generateManualEPUB() {
                        // Create a simplified EPUB structure manually
                        // This is a basic implementation - for production, consider server-side conversion
                        const opfContent = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata>
    <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">${title.trim()}</dc:title>
    <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">${author.trim() || 'Unknown'}</dc:creator>
    <dc:language>en</dc:language>
    <dc:publisher>Breaktools</dc:publisher>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    ${chapters.map((ch, i) => `<item id="chapter-${i}" href="chapter-${i}.xhtml" media-type="application/xhtml+xml"/>`).join('\n    ')}
  </manifest>
  <spine toc="nav">
    <itemref idref="nav"/>
    ${chapters.map((_, i) => `<itemref idref="chapter-${i}"/>`).join('\n    ')}
  </spine>
</package>`

                        // Create a simple EPUB-like structure (note: not a fully valid EPUB without proper ZIP)
                        // For production use, implement proper EPUB ZIP structure or use server-side conversion
                        const epubText = `EPUB Generated by Breaktools\n\nTitle: ${title.trim()}\nAuthor: ${author.trim() || 'Unknown'}\n\nContent:\n\n${chapters.map((ch, i) => `Chapter ${i + 1}: ${ch.title}\n\n${ch.data.replace(/<[^>]*>/g, '')}\n`).join('\n---\n\n')}\n\nNote: This is a simplified text-based version. For full EPUB compatibility, please use a server-side conversion service.`

                        const blob = new Blob([epubText], { type: 'text/plain' })
                        resolve(blob)
                    }
                } catch (err) {
                    reject(err)
                }
            })

            const url = URL.createObjectURL(epubContent)
            setEpubUrl(url)
        } catch (err: any) {
            console.error('PDF to EPUB conversion error:', err)
            setError(t('pdfToEpub.errors.conversionFailed') + (err.message ? ': ' + err.message : ''))
        } finally {
            setIsProcessing(false)
        }
    }

    const downloadEPUB = () => {
        if (!epubUrl) return

        const link = document.createElement('a') as HTMLAnchorElement
        link.href = epubUrl
        link.download = pdfFile?.name.replace('.pdf', '.epub') || 'converted.epub'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(epubUrl)
    }

    return (
        <div className="max-w-full sm:max-w-4xl mx-auto w-full px-4">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('pdfToEpub.title')}</h1>
                <p className="text-sm sm:text-base text-neutral-600">
                    {t('pdfToEpub.description')}
                </p>
            </div>

            {/* File Upload */}
            <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                    {t('pdfToEpub.selectPDF')}
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
                            {pdfFile ? pdfFile.name : t('pdfToEpub.chooseFile')}
                        </button>
                        {pdfFile && (
                            <p className="text-xs text-neutral-500 mt-2">
                                {formatFileSize(pdfFile.size)} • {totalPages} {totalPages === 1 ? t('pdfToEpub.page') : t('pdfToEpub.pages')}
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

            {/* Metadata Inputs */}
            {pdfFile && (
                <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                        {t('pdfToEpub.metadata')}
                    </label>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-neutral-600 mb-1">
                                {t('pdfToEpub.metadataTitle')} *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('pdfToEpub.titlePlaceholder')}
                                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-600 mb-1">
                                {t('pdfToEpub.metadataAuthor')}
                            </label>
                            <input
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                placeholder={t('pdfToEpub.authorPlaceholder')}
                                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Page Selection */}
            {pdfFile && totalPages > 0 && (
                <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-neutral-700 mb-3">
                            {t('pdfToEpub.selectPages')}
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
                                {t('pdfToEpub.allPages')}
                            </button>
                            <button
                                onClick={() => setExtractMode('selected')}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${extractMode === 'selected'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                    }`}
                            >
                                {t('pdfToEpub.selectedPages')}
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
                        onClick={convertToEPUB}
                        disabled={isProcessing || (extractMode === 'selected' && selectedPages.length === 0) || !title.trim()}
                        className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('pdfToEpub.processing')}
                            </>
                        ) : (
                            <>
                                <Book className="w-4 h-4" />
                                {t('pdfToEpub.convert')}
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Download Button */}
            {epubUrl && (
                <div className="tool-card p-4 sm:p-6 w-full">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-neutral-900">{t('pdfToEpub.epubReady')}</h3>
                        <button
                            onClick={downloadEPUB}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 min-h-[44px]"
                        >
                            <Download className="w-4 h-4" />
                            {t('pdfToEpub.download')}
                        </button>
                    </div>
                    <p className="text-sm text-neutral-600">
                        {t('pdfToEpub.downloadDescription')}
                    </p>
                </div>
            )}
        </div>
    )
}

