'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileText, Loader2, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function PowerPointToPDF() {
  const t = useTranslations('tools')
  const [pptFile, setPptFile] = useState<File | null>(null)
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

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
    ]
    const validExtensions = ['.pptx', '.ppt']

    const hasValidType = validTypes.includes(file.type)
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    )

    if (!hasValidType && !hasValidExtension) {
      setError(t('powerpointToPdf.errors.invalidFile'))
      return
    }

    setPptFile(file)
    setError('')
  }

  const convertToPDF = async () => {
    if (!pptFile) {
      setError(t('powerpointToPdf.errors.noFile'))
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      // This requires server-side API endpoint
      const formData = new FormData()
      formData.append('file', pptFile)

      const response = await fetch('/api/converter/powerpoint-to-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = t('powerpointToPdf.errors.serverError')
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (e) {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage)
      }

      // Check if response is actually a PDF blob or error JSON
      const contentType = response.headers.get('content-type')
      
      // Check response size
      const contentLength = response.headers.get('content-length')
      console.log('Response headers:', { contentType, contentLength })

      if (contentType?.includes('application/json')) {
        // Response is JSON error
        const errorData = await response.json()
        console.error('API returned error:', errorData)
        throw new Error(errorData.error || t('powerpointToPdf.errors.serverError'))
      }

      // Response should be PDF blob
      if (!contentType?.includes('application/pdf')) {
        console.warn('Unexpected content type:', contentType)
      }

      const blob = await response.blob()
      console.log('PDF blob received:', { size: blob.size, type: blob.type })
      
      if (blob.size === 0) {
        throw new Error('Received empty PDF file. The PowerPoint file may be empty or corrupted.')
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a') as HTMLAnchorElement
      link.href = url
      link.download = pptFile.name.replace(/\.(pptx?|ppt)$/i, '.pdf')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Clear error on success
      setError('')
    } catch (err: any) {
      console.error('PowerPoint to PDF conversion error:', err)
      let errorMessage = t('powerpointToPdf.errors.conversionFailed')
      
      const errMsg = err.message || ''
      
      // Check if error is about unsupported format
      if (errMsg.includes('Only .pptx format')) {
        errorMessage = 'Only .pptx format is supported. Legacy .ppt format is not supported. Please save your presentation as .pptx format first.'
      } else if (errMsg.includes('Invalid PPTX') || errMsg.includes('not found')) {
        errorMessage = 'Invalid PPTX file format. Please ensure the file is a valid PowerPoint presentation (.pptx).'
      } else if (errMsg.includes('No slides')) {
        errorMessage = 'No slides found in the PowerPoint file.'
      } else if (errMsg.includes('LibreOffice') || errMsg.includes('online tools')) {
        // Format error message with clickable links (for backward compatibility)
        errorMessage = errMsg
          .replace(/• (https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary-600 underline">$1</a>')
      } else if (errMsg) {
        errorMessage += ': ' + errMsg
      }
      
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto w-full px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('powerpointToPdf.title')}</h1>
        <p className="text-sm sm:text-base text-neutral-600">
          {t('powerpointToPdf.description')}
        </p>
      </div>

      {/* Coming Soon Notice */}
      <div className="tool-card p-6 sm:p-8 w-full mb-4 sm:mb-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <FileText className="w-16 h-16 mx-auto text-neutral-400" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">Coming Soon</h3>
          <p className="text-sm text-neutral-600 mb-4">
            PowerPoint to PDF conversion is currently under development. This feature will be available soon.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <p className="text-xs text-yellow-800">
              In the meantime, you can use these free online tools:
            </p>
            <ul className="text-xs text-yellow-800 space-y-2 mt-3 text-left">
              <li>
                <a href="https://cloudconvert.com/pptx-to-pdf" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">
                  • CloudConvert - PPTX to PDF
                </a>
              </li>
              <li>
                <a href="https://www.zamzar.com/convert/pptx-to-pdf/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">
                  • Zamzar - PPTX to PDF
                </a>
              </li>
              <li>
                <a href="https://convertio.co/pptx-pdf/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">
                  • Convertio - PPTX to PDF
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* File Upload - Disabled */}
      <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6 opacity-50 pointer-events-none">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          {t('powerpointToPdf.selectFile')}
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
              onChange={handleFileSelect}
              className="hidden"
              disabled
            />
            <button
              disabled
              className="w-full sm:w-auto px-4 py-2.5 bg-neutral-100 text-neutral-500 rounded-lg font-medium flex items-center justify-center gap-2 min-h-[44px] cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              {t('powerpointToPdf.chooseFile')}
            </button>
          </div>
        </div>
      </div>

      {/* Convert Button - Disabled */}
      <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6 opacity-50 pointer-events-none">
        <button
          disabled
          className="w-full px-4 py-2.5 bg-neutral-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 min-h-[44px] cursor-not-allowed"
        >
          <FileText className="w-4 h-4" />
          {t('powerpointToPdf.convert')}
        </button>
      </div>
    </div>
  )
}

