'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileSpreadsheet, Loader2 } from 'lucide-react'

export function ExcelToPDF() {
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [sheets, setSheets] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string>('')
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
      setError('Please select a valid Excel file (.xlsx or .xls)!')
      return
    }

    setExcelFile(file)
    setError('')
    setPdfUrl('')
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
      setError('Failed to read Excel file' + (err.message ? ': ' + err.message : ''))
    }
  }

  const convertToPDF = async () => {
    if (!excelFile || !selectedSheet) {
      setError('Please select a file and sheet!')
      return
    }

    setIsProcessing(true)
    setError('')
    setPdfUrl('')

    try {
      // Send Excel file to API route to get table data (ExcelJS tidak kompatibel dengan client-side webpack)
      const formData = new FormData()
      formData.append('file', excelFile)
      formData.append('sheet', selectedSheet)

      const response = await fetch('/api/converter/excel-to-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to convert Excel to PDF')
      }

      const { rows } = await response.json()

      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error('No data found in the selected sheet!')
      }

      // Dynamic import jsPDF and autoTable to create PDF from table data
      const jsPDFModule = await import('jspdf')
      const jsPDF = (jsPDFModule as any).jsPDF || jsPDFModule.default || jsPDFModule

      // Import autoTable plugin (it modifies jsPDF prototype)
      try {
        await import('jspdf-autotable' as any)
      } catch (e) {
        console.warn('jspdf-autotable import failed:', e)
      }

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      // Check if autoTable is available (it modifies jsPDF prototype)
      if ((pdf as any).autoTable) {
        // Use autoTable plugin for better table rendering
        const header = rows[0] || []
        const data = rows.slice(1) || []

          ; (pdf as any).autoTable({
            head: [header],
            body: data,
            startY: 15,
            margin: { left: 14, right: 14 },
            styles: {
              fontSize: 7,
              cellPadding: 1.5,
              overflow: 'linebreak',
              cellWidth: 'wrap',
              halign: 'left',
              valign: 'middle',
            },
            headStyles: {
              fillColor: [240, 240, 240],
              textColor: [0, 0, 0],
              fontStyle: 'bold',
              fontSize: 8,
              halign: 'center',
            },
            alternateRowStyles: {
              fillColor: [255, 255, 255],
            },
            theme: 'grid',
            horizontalPageBreak: true,
            horizontalPageBreakRepeat: 0, // Repeat first column on page break
            showHead: 'everyPage', // Show header on every page
          })
      } else {
        // Fallback: Manual table rendering with borders
        const maxCols = Math.max(...rows.map((r: string[]) => r.length))
        const pageWidth = 270 // A4 landscape width - margins (297mm - 20mm left - 7mm right)
        const pageHeight = 190 // A4 landscape height - margins
        const colWidth = pageWidth / maxCols
        const rowHeight = 7
        const cellPadding = 2

        let y = 20

        rows.forEach((row: string[], rowIndex: number) => {
          // Check if we need a new page
          if (y + rowHeight > pageHeight) {
            pdf.addPage()
            y = 20

            // Redraw header row on new page
            if (rows[0] && rows[0].length > 0) {
              let x = 14
              rows[0].forEach((cell: string, colIndex: number) => {
                // Draw cell border
                pdf.setDrawColor(200, 200, 200)
                pdf.setFillColor(245, 245, 245)
                pdf.rect(x, y, colWidth, rowHeight, 'FD')

                // Draw cell text (bold for header)
                pdf.setFont('helvetica', 'bold')
                pdf.setTextColor(0, 0, 0)
                const cellText = String(cell).substring(0, 20)
                pdf.text(cellText, x + cellPadding, y + rowHeight / 2 + 2, {
                  maxWidth: colWidth - cellPadding * 2,
                  align: 'left',
                })

                x += colWidth
              })
              y += rowHeight
            }
          }

          // Draw row
          let x = 14
          row.forEach((cell: string, colIndex: number) => {
            // Draw cell border
            pdf.setDrawColor(200, 200, 200)
            pdf.setFillColor(rowIndex === 0 ? 245 : 255, 245, 255)
            pdf.rect(x, y, colWidth, rowHeight, 'FD')

            // Draw cell text
            pdf.setFont('helvetica', rowIndex === 0 ? 'bold' : 'normal')
            pdf.setTextColor(0, 0, 0)
            const cellText = String(cell).substring(0, 25)
            pdf.text(cellText, x + cellPadding, y + rowHeight / 2 + 2, {
              maxWidth: colWidth - cellPadding * 2,
              align: 'left',
            })

            x += colWidth
          })

          y += rowHeight
        })
      }

      // Generate PDF blob
      const pdfBlob = pdf.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
    } catch (err: any) {
      console.error('Excel to PDF conversion error:', err)
      setError('Failed to convert Excel to PDF' + (err.message ? ': ' + err.message : ''))
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadPDF = () => {
    if (!pdfUrl) return

    const link = document.createElement('a') as HTMLAnchorElement
    link.href = pdfUrl
    link.download = excelFile?.name.replace(/\.(xlsx?|xls)$/i, '.pdf') || 'converted.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(pdfUrl)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto w-full px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Excel to PDF</h1>
        <p className="text-sm sm:text-base text-neutral-600">
          Convert Excel spreadsheet to PDF
        </p>
      </div>

      {/* File Upload */}
      <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Select Excel File
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
              {excelFile ? excelFile.name : 'Choose Excel File'}
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
            Select Sheet
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
                <FileSpreadsheet className="w-4 h-4" />
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
    </div>
  )
}

