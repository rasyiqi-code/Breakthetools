'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileText, Loader2, Code } from 'lucide-react'

export function WordToHTML() {
  const [wordFile, setWordFile] = useState<File | null>(null)
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
    setHtmlOutput('')
  }

  const convertToHTML = async () => {
    if (!wordFile) {
      setError('Please select a Word file first!')
      return
    }

    setIsProcessing(true)
    setError('')
    setHtmlOutput('')

    try {
      // Send Word file to API route for HTML conversion (mammoth tidak kompatibel dengan client-side webpack)
      const formData = new FormData()
      formData.append('file', wordFile)

      const response = await fetch('/api/converter/word-to-html', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to convert Word to HTML')
      }

      const { html: fullHTML, messages } = await response.json()

      if (!fullHTML) {
        throw new Error('No HTML content received from server')
      }

      setHtmlOutput(fullHTML)

      // Show warnings if any
      if (messages && messages.length > 0) {
        console.warn('Conversion warnings:', messages)
      }
    } catch (err: any) {
      console.error('Word to HTML conversion error:', err)
      setError('Failed to convert Word to HTML' + (err.message ? ': ' + err.message : ''))
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
    link.download = wordFile?.name.replace(/\.(docx?|doc)$/i, '.html') || 'converted-document.html'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto w-full px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Word to HTML</h1>
        <p className="text-sm sm:text-base text-neutral-600">
          Convert Word document (.docx) to HTML
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
            onClick={convertToHTML}
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
                <Code className="w-4 h-4" />
                Convert to HTML
              </>
            )}
          </button>
        </div>
      )}

      {/* HTML Output */}
      {htmlOutput && (
        <div className="tool-card p-4 sm:p-6 w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-neutral-900">HTML Output</h3>
            <button
              onClick={downloadHTML}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
          <textarea
            value={htmlOutput}
            readOnly
            className="w-full p-4 border border-neutral-300 rounded-lg font-mono text-xs sm:text-sm bg-neutral-50 min-h-[300px] max-h-[600px] overflow-y-auto"
            placeholder="HTML output will appear here..."
          />
          <p className="text-xs text-neutral-500 mt-2">
            {htmlOutput.length} characters
          </p>
        </div>
      )}
    </div>
  )
}

