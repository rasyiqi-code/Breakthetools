'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ExcelToCSV() {
  const t = useTranslations('tools')
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [sheets, setSheets] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [csvOutput, setCsvOutput] = useState('')
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

    // Check if file is Excel
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]
    const validExtensions = ['.xlsx', '.xls']

    const hasValidType = validTypes.includes(file.type)
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    )

    if (!hasValidType && !hasValidExtension) {
      setError(t('excelToCsv.errors.invalidFile'))
      return
    }

    setExcelFile(file)
    setError('')
    setCsvOutput('')
    setSheets([])
    setSelectedSheet('')

    try {
      // Send Excel file to API route to get sheet names (ExcelJS tidak kompatibel dengan client-side webpack)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/converter/excel-sheets', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to read Excel file')
      }

      const { sheets: sheetNames } = await response.json()
      
      if (!Array.isArray(sheetNames) || sheetNames.length === 0) {
        throw new Error('No sheets found in Excel file')
      }

      setSheets(sheetNames)
      
      if (sheetNames.length > 0) {
        setSelectedSheet(sheetNames[0])
      }
    } catch (err: any) {
      console.error('Error reading Excel file:', err)
      setError(t('excelToCsv.errors.readFailed') + (err.message ? ': ' + err.message : ''))
    }
  }

  const convertToCSV = async () => {
    if (!excelFile || !selectedSheet) {
      setError(t('excelToCsv.errors.noFileOrSheet'))
      return
    }

    setIsProcessing(true)
    setError('')
    setCsvOutput('')

    try {
      // Send Excel file to API route for CSV conversion (ExcelJS tidak kompatibel dengan client-side webpack)
      const formData = new FormData()
      formData.append('file', excelFile)
      formData.append('sheet', selectedSheet)

      const response = await fetch('/api/converter/excel-to-csv', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to convert Excel to CSV')
      }

      const { csv } = await response.json()

      if (!csv) {
        throw new Error('No CSV content received from server')
      }

      setCsvOutput(csv)
    } catch (err: any) {
      console.error('Excel to CSV conversion error:', err)
      setError(t('excelToCsv.errors.conversionFailed') + (err.message ? ': ' + err.message : ''))
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadCSV = () => {
    if (!csvOutput) return

    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a') as HTMLAnchorElement
    link.href = url
    link.download = excelFile?.name.replace(/\.(xlsx?|xls)$/i, '.csv') || 'converted.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto w-full px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('excelToCsv.title')}</h1>
        <p className="text-sm sm:text-base text-neutral-600">
          {t('excelToCsv.description')}
        </p>
      </div>

      {/* File Upload */}
      <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          {t('excelToCsv.selectFile')}
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Upload className="w-4 h-4" />
              {excelFile ? excelFile.name : t('excelToCsv.chooseFile')}
            </button>
            {excelFile && (
              <p className="text-xs text-neutral-500 mt-2">
                {formatFileSize(excelFile.size)}
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

      {/* Sheet Selection */}
      {sheets.length > 0 && (
        <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            {t('excelToCsv.selectSheet')}
          </label>
          <select
            value={selectedSheet}
            onChange={(e) => setSelectedSheet(e.target.value)}
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
          >
            {sheets.map((sheet) => (
              <option key={sheet} value={sheet}>
                {sheet}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Convert Button */}
      {excelFile && selectedSheet && (
        <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
          <button
            onClick={convertToCSV}
            disabled={isProcessing}
            className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('excelToCsv.processing')}
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                {t('excelToCsv.convert')}
              </>
            )}
          </button>
        </div>
      )}

      {/* CSV Output */}
      {csvOutput && (
        <div className="tool-card p-4 sm:p-6 w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-neutral-900">{t('excelToCsv.csvOutput')}</h3>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              {t('excelToCsv.download')}
            </button>
          </div>
          <textarea
            value={csvOutput}
            readOnly
            className="w-full p-4 border border-neutral-300 rounded-lg font-mono text-xs sm:text-sm bg-neutral-50 min-h-[300px] max-h-[600px] overflow-y-auto"
            placeholder={t('excelToCsv.csvOutputPlaceholder')}
          />
          <p className="text-xs text-neutral-500 mt-2">
            {csvOutput.length} {t('excelToCsv.characters')}
          </p>
        </div>
      )}
    </div>
  )
}

