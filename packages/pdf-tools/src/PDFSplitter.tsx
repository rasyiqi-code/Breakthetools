'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileText, Loader2, Scissors } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'

export function PDFSplitter() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [pageRange, setPageRange] = useState('')
  const [splitMode, setSplitMode] = useState<'range' | 'all'>('range')
  const [isProcessing, setIsProcessing] = useState(false)
  const [splitUrls, setSplitUrls] = useState<string[]>([])
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
    setSplitUrls([])
    setPageRange('')

    try {
      const fileBytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(fileBytes)
      setTotalPages(pdf.getPageCount())
    } catch (err: any) {
      setError('Gagal membaca PDF. ' + (err.message || 'Pastikan file PDF valid.'))
      setPdfFile(null)
    }
  }

  const parsePageRange = (range: string): number[] => {
    const pages: number[] = []
    const parts = range.split(',').map(p => p.trim())

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number)
        if (start && end && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= totalPages) {
              pages.push(i - 1) // Convert to 0-based index
            }
          }
        }
      } else {
        const page = Number(part)
        if (page >= 1 && page <= totalPages) {
          pages.push(page - 1) // Convert to 0-based index
        }
      }
    }

    return [...new Set(pages)].sort((a, b) => a - b)
  }

  const splitPDF = async () => {
    if (!pdfFile) {
      setError('Pilih file PDF terlebih dahulu!')
      return
    }

    setIsProcessing(true)
    setError('')
    setSplitUrls([])

    try {
      const fileBytes = await pdfFile.arrayBuffer()
      const originalPdf = await PDFDocument.load(fileBytes)

      if (splitMode === 'all') {
        // Split setiap halaman menjadi file terpisah
        const urls: string[] = []
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create()
          const [page] = await newPdf.copyPages(originalPdf, [i])
          newPdf.addPage(page)
          const pdfBytes = await newPdf.save()
          const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          urls.push(url)
        }
        setSplitUrls(urls)
      } else {
        // Extract halaman berdasarkan range
        if (!pageRange.trim()) {
          setError('Masukkan range halaman!')
          setIsProcessing(false)
          return
        }

        const pages = parsePageRange(pageRange)
        if (pages.length === 0) {
          setError('Range halaman tidak valid!')
          setIsProcessing(false)
          return
        }

        const newPdf = await PDFDocument.create()
        const copiedPages = await newPdf.copyPages(originalPdf, pages)
        copiedPages.forEach((page) => {
          newPdf.addPage(page)
        })

        const pdfBytes = await newPdf.save()
        const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setSplitUrls([url])
      }
    } catch (err: any) {
      setError('Gagal memproses PDF. ' + (err.message || 'Pastikan file PDF valid.'))
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadSplit = (url: string, index: number) => {
    const link = document.createElement('a')
    link.href = url
    if (splitMode === 'all') {
      link.download = `${pdfFile?.name.replace('.pdf', '')}_page_${index + 1}.pdf`
    } else {
      link.download = `${pdfFile?.name.replace('.pdf', '')}_extracted.pdf`
    }
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAll = () => {
    splitUrls.forEach((url, index) => {
      setTimeout(() => {
        downloadSplit(url, index)
      }, index * 200)
    })
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">PDF Splitter</h1>
        <p className="text-sm sm:text-base text-neutral-600">Split atau extract halaman dari PDF</p>
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

        {pdfFile && (
          <>
            <div className="mb-4">
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Mode Split
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    value="range"
                    checked={splitMode === 'range'}
                    onChange={(e) => setSplitMode(e.target.value as 'range' | 'all')}
                    className="w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm">Extract Range</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    value="all"
                    checked={splitMode === 'all'}
                    onChange={(e) => setSplitMode(e.target.value as 'range' | 'all')}
                    className="w-4 h-4"
                  />
                  <span className="text-xs sm:text-sm">Split Semua Halaman</span>
                </label>
              </div>
            </div>

            {splitMode === 'range' && (
              <div className="mb-4">
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Range Halaman
                </label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="Contoh: 1-5, 10, 15-20"
                  className="input-field w-full text-sm sm:text-base min-h-[44px]"
                />
                <div className="text-xs text-neutral-600 mt-1">
                  Format: 1-5 (range), 10 (single), atau 1-5, 10, 15-20 (multiple)
                </div>
              </div>
            )}

            <button
              onClick={splitPDF}
              disabled={isProcessing || (splitMode === 'range' && !pageRange.trim())}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4" />
                  {splitMode === 'all' ? 'Split Semua Halaman' : 'Extract Halaman'}
                </>
              )}
            </button>
          </>
        )}
      </div>

      {splitUrls.length > 0 && (
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4">
            {splitMode === 'all' 
              ? `PDF Berhasil Di-split menjadi ${splitUrls.length} file!`
              : 'Halaman Berhasil Di-extract!'
            }
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
            {splitUrls.length > 1 && (
              <button
                onClick={downloadAll}
                className="btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                Download Semua
              </button>
            )}
            {splitUrls.map((url, index) => (
              <button
                key={index}
                onClick={() => downloadSplit(url, index)}
                className="btn-secondary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
              >
                <Download className="w-4 h-4" />
                {splitMode === 'all' ? `Page ${index + 1}` : 'Download'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

