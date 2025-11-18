'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function CSVToExcel() {
  const t = useTranslations('tools')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [sheetName, setSheetName] = useState('Sheet1')
  const [isProcessing, setIsProcessing] = useState(false)
  const [excelUrl, setExcelUrl] = useState<string>('')
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

    // Check if file is CSV or text
    const validTypes = ['text/csv', 'text/plain']
    const validExtensions = ['.csv']

    const hasValidType = validTypes.includes(file.type)
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    )

    if (!hasValidType && !hasValidExtension) {
      setError(t('csvToExcel.errors.invalidFile'))
      return
    }

    setCsvFile(file)
    setError('')
    setExcelUrl('')
    
    // Set sheet name from filename
    const nameWithoutExt = file.name.replace(/\.csv$/i, '')
    setSheetName(nameWithoutExt || 'Sheet1')
  }

  const convertToExcel = async () => {
    if (!csvFile) {
      setError(t('csvToExcel.errors.noFile'))
      return
    }

    if (!sheetName.trim()) {
      setError(t('csvToExcel.errors.noSheetName'))
      return
    }

    setIsProcessing(true)
    setError('')
    setExcelUrl('')

    try {
      // Parse CSV in client-side using Papa Parse (Papa Parse bisa digunakan di client-side)
      const Papa = (await import('papaparse')).default
      
      // Read CSV file
      const text = await csvFile.text()

      // Parse CSV using PapaParse
      Papa.parse(text, {
        header: false,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            if (!results.data || results.data.length === 0) {
              throw new Error('No data found in CSV')
            }

            // Send parsed CSV data to API route for Excel generation (ExcelJS tidak kompatibel dengan client-side webpack)
            const formData = new FormData()
            formData.append('data', JSON.stringify(results.data)) // Send parsed data as JSON string
            formData.append('sheetName', sheetName)

            const response = await fetch('/api/converter/csv-to-excel', {
              method: 'POST',
              body: formData,
            })

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
              throw new Error(errorData.error || 'Failed to convert CSV to Excel')
            }

            // Get Excel file from response
            const excelBlob = await response.blob()
            const url = URL.createObjectURL(excelBlob)
            setExcelUrl(url)
          } catch (err: any) {
            console.error('CSV to Excel conversion error:', err)
            setError(t('csvToExcel.errors.conversionFailed') + (err.message ? ': ' + err.message : ''))
          } finally {
            setIsProcessing(false)
          }
        },
        error: (error: Error) => {
          console.error('CSV parsing error:', error)
          setError(t('csvToExcel.errors.parseFailed') + (error.message ? ': ' + error.message : ''))
          setIsProcessing(false)
        },
      })
    } catch (err: any) {
      console.error('CSV to Excel conversion error:', err)
      setError(t('csvToExcel.errors.conversionFailed') + (err.message ? ': ' + err.message : ''))
      setIsProcessing(false)
    }
  }

  const downloadExcel = () => {
    if (!excelUrl) return

    const link = document.createElement('a') as HTMLAnchorElement
    link.href = excelUrl
    link.download = csvFile?.name.replace(/\.csv$/i, '.xlsx') || 'converted.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(excelUrl)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto w-full px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('csvToExcel.title')}</h1>
        <p className="text-sm sm:text-base text-neutral-600">
          {t('csvToExcel.description')}
        </p>
      </div>

      {/* File Upload */}
      <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          {t('csvToExcel.selectFile')}
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Upload className="w-4 h-4" />
              {csvFile ? csvFile.name : t('csvToExcel.chooseFile')}
            </button>
            {csvFile && (
              <p className="text-xs text-neutral-500 mt-2">
                {formatFileSize(csvFile.size)}
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

      {/* Sheet Name Input */}
      {csvFile && (
        <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            {t('csvToExcel.sheetName')}
          </label>
          <input
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder={t('csvToExcel.sheetNamePlaceholder')}
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
          />
        </div>
      )}

      {/* Convert Button */}
      {csvFile && (
        <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
          <button
            onClick={convertToExcel}
            disabled={isProcessing || !sheetName.trim()}
            className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('csvToExcel.processing')}
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                {t('csvToExcel.convert')}
              </>
            )}
          </button>
        </div>
      )}

      {/* Download Button */}
      {excelUrl && (
        <div className="tool-card p-4 sm:p-6 w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-neutral-900">{t('csvToExcel.excelReady')}</h3>
            <button
              onClick={downloadExcel}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              {t('csvToExcel.download')}
            </button>
          </div>
          <p className="text-sm text-neutral-600">
            {t('csvToExcel.downloadDescription')}
          </p>
        </div>
      )}
    </div>
  )
}

