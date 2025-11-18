'use client'

import { useState, useRef } from 'react'
import { Upload, Download, X, GripVertical, FileText, Loader2 } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import { useTranslations } from 'next-intl'

interface PDFFile {
  file: File
  id: string
  name: string
  size: number
}

export function PDFMerger() {
  const t = useTranslations('tools')
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [mergedUrl, setMergedUrl] = useState<string>('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const pdfFiles = files.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length === 0) {
      setError(t('pdfMerger.errors.selectPDFFirst'))
      return
    }

    const newFiles: PDFFile[] = pdfFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size
    }))

    setPdfFiles(prev => [...prev, ...newFiles])
    setError('')
    setMergedUrl('')
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (id: string) => {
    setPdfFiles(prev => prev.filter(f => f.id !== id))
    setMergedUrl('')
  }

  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...pdfFiles]
    const [removed] = newFiles.splice(fromIndex, 1)
    newFiles.splice(toIndex, 0, removed)
    setPdfFiles(newFiles)
    setMergedUrl('')
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null) return
    
    if (draggedIndex !== index) {
      moveFile(draggedIndex, index)
      setDraggedIndex(index)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const mergePDFs = async () => {
    if (pdfFiles.length === 0) {
      setError(t('pdfMerger.errors.selectAtLeastOne'))
      return
    }

    setIsProcessing(true)
    setError('')
    setMergedUrl('')

    try {
      const mergedPdf = await PDFDocument.create()

      for (const pdfFile of pdfFiles) {
        const fileBytes = await pdfFile.file.arrayBuffer()
        const pdf = await PDFDocument.load(fileBytes)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        
        pages.forEach((page) => {
          mergedPdf.addPage(page)
        })
      }

      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      setMergedUrl(url)
    } catch (err: any) {
      setError(t('pdfMerger.errors.mergeFailed') + ' ' + (err.message || t('pdfMerger.errors.ensureValidPDF')))
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadMerged = () => {
    if (!mergedUrl) return
    
    const link = document.createElement('a') as HTMLAnchorElement
    link.href = mergedUrl
    link.download = 'merged.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('pdfMerger.title')}</h1>
        <p className="text-sm sm:text-base text-neutral-600">{t('pdfMerger.description')}</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          {t('pdfMerger.uploadPDFFiles')}
        </label>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="btn-primary flex items-center justify-center gap-2 cursor-pointer min-h-[44px] text-sm sm:text-base"
          >
            <Upload className="w-4 h-4" />
            {t('pdfMerger.selectPDFFiles')}
          </label>
          <button
            onClick={mergePDFs}
            disabled={isProcessing || pdfFiles.length === 0}
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('pdfMerger.processing')}
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                {t('pdfMerger.mergePDFs')}
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 mb-4">
            <div className="text-xs sm:text-sm text-red-800">⚠️ {error}</div>
          </div>
        )}

        {pdfFiles.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs sm:text-sm font-medium text-neutral-700 mb-2">
              {t('pdfMerger.fileList', { count: pdfFiles.length })} - {t('pdfMerger.dragToReorder')}
            </div>
            {pdfFiles.map((pdfFile, index) => (
              <div
                key={pdfFile.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-primary-300 cursor-move"
              >
                <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-neutral-900 truncate">
                    {pdfFile.name}
                  </div>
                  <div className="text-xs text-neutral-600">
                    {formatFileSize(pdfFile.size)}
                  </div>
                </div>
                <div className="text-xs text-neutral-500 bg-neutral-200 px-2 py-1 rounded flex-shrink-0">
                  #{index + 1}
                </div>
                <button
                  onClick={() => removeFile(pdfFile.id)}
                  className="p-1 hover:bg-red-100 rounded text-red-600 flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {mergedUrl && (
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4">
            {t('pdfMerger.mergeSuccess')}
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadMerged}
              className="btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
            >
              <Download className="w-4 h-4" />
              {t('pdfMerger.downloadMergedPDF')}
            </button>
            <a
              href={mergedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
            >
              <FileText className="w-4 h-4" />
              {t('pdfMerger.preview')}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

