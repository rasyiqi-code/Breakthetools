'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileText, Loader2 } from 'lucide-react'

export function WordToPDF() {
  const [wordFile, setWordFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

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

    // Check if file is .docx
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ]
    const validExtensions = ['.docx', '.doc']

    const hasValidType = validTypes.includes(file.type)
    const hasValidExtension = validExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    )

    if (!hasValidType && !hasValidExtension) {
      setError('Please select a valid Word file (.docx or .doc)!')
      return
    }

    setWordFile(file)
    setError('')
    setPdfUrl('')
  }

  const convertToPDF = async () => {
    if (!wordFile) {
      setError('Please select a Word file first!')
      return
    }

    setIsProcessing(true)
    setError('')
    setPdfUrl('')

    try {
      // Send Word file to API route for HTML conversion (mammoth tidak kompatibel dengan client-side webpack)
      const formData = new FormData()
      formData.append('file', wordFile)

      const htmlResponse = await fetch('/api/converter/word-to-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!htmlResponse.ok) {
        const errorData = await htmlResponse.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to convert Word to HTML')
      }

      const { html: htmlContent, messages } = await htmlResponse.json()

      if (!htmlContent) {
        throw new Error('No HTML content received from server')
      }

      // Show warnings if any
      if (messages && messages.length > 0) {
        console.warn('Conversion warnings:', messages)
      }

      // Dynamic import jsPDF to avoid webpack compatibility issues
      const jsPDFModule = await import('jspdf')
      const jsPDF = (jsPDFModule as any).jsPDF || jsPDFModule.default || jsPDFModule

      // Create PDF using jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // Extract text from HTML without rendering it in the DOM
      // This prevents any layout shifts or visual flicker
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlContent, 'text/html')

      // Extract text content without rendering
      const textContent = doc.body.innerText || doc.body.textContent || ''

      // Split text into lines that fit the PDF width
      const lines = pdf.splitTextToSize(textContent, 170) // 170mm width (A4 - margins)

      let y = 20 // Start position in mm
      const pageHeight = 277 // A4 height - margins (297mm - 20mm top and bottom)
      const lineHeight = 7 // Line spacing in mm

      // Add text lines to PDF with proper pagination
      for (let i = 0; i < lines.length; i++) {
        if (y > pageHeight) {
          pdf.addPage()
          y = 20 // Reset to top of new page
        }
        pdf.text(lines[i], 20, y) // 20mm left margin
        y += lineHeight
      }

      // Generate PDF blob
      const pdfBlob = pdf.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
    } catch (err: any) {
      console.error('Word to PDF conversion error:', err)
      setError('Failed to convert Word to PDF' + (err.message ? ': ' + err.message : ''))
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadPDF = () => {
    if (!pdfUrl) return

    const link = document.createElement('a') as HTMLAnchorElement
    link.href = pdfUrl
    link.download = wordFile?.name.replace(/\.(docx?|doc)$/i, '.pdf') || 'converted-document.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(pdfUrl)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto w-full px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Word to PDF</h1>
        <p className="text-sm sm:text-base text-neutral-600">
          Convert Word document (.docx) to PDF
        </p>
      </div>

      {/* File Upload */}
      <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Select Word File
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Upload className="w-4 h-4" />
              {wordFile ? wordFile.name : 'Choose Word File'}
            </button>
            {wordFile && (
              <p className="text-xs text-neutral-500 mt-2">
                {formatFileSize(wordFile.size)}
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
      {wordFile && (
        <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
          <button
            onClick={convertToPDF}
            disabled={isProcessing}
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
                Convert to PDF
              </>
            )}
          </button>
        </div>
      )}

      {/* Download Button */}
      {pdfUrl && (
        <div className="tool-card p-4 sm:p-6 w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-neutral-900">PDF File Ready</h3>
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
          <p className="text-sm text-neutral-600">
            Your PDF file is ready for download.
          </p>
        </div>
      )}

      {/* Hidden preview container */}
      <div ref={previewRef} style={{ display: 'none' }} />
    </div>
  )
}

