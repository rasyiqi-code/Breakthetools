import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const csvData = formData.get('data') as string // JSON string of parsed CSV data
    const sheetName = formData.get('sheetName') as string

    if (!csvData) {
      return NextResponse.json(
        { error: 'CSV data is required' },
        { status: 400 }
      )
    }

    if (!sheetName || !sheetName.trim()) {
      return NextResponse.json(
        { error: 'Sheet name is required' },
        { status: 400 }
      )
    }

    // Parse CSV data (should be array of arrays from Papa Parse)
    const rows = JSON.parse(csvData) as any[][]

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'No data found in CSV' },
        { status: 400 }
      )
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(sheetName)

    // Add data to worksheet
    if (rows.length > 0) {
      // Check if first row looks like headers (all strings or non-numeric)
      const firstRow = rows[0] as any[]
      const mightBeHeaders = firstRow.every(cell => 
        typeof cell === 'string' || cell === null || cell === undefined || cell === ''
      )

      let startRow = 0
      if (mightBeHeaders) {
        // Add headers
        worksheet.addRow(firstRow)
        worksheet.getRow(1).font = { bold: true }
        startRow = 1
      }

      // Add data rows
      for (let i = startRow; i < rows.length; i++) {
        const row = rows[i] as any[]
        if (row && row.length > 0) {
          worksheet.addRow(row)
        }
      }

      // Auto-fit columns
      worksheet.columns.forEach((column: any) => {
        if (column && column.eachCell) {
          let maxLength = 0
          column.eachCell({ includeEmpty: false }, (cell: any) => {
            const cellValue = cell.value?.toString() || ''
            maxLength = Math.max(maxLength, cellValue.length)
          })
          column.width = Math.min(maxLength + 2, 50) // Max width 50
        }
      })
    }

    // Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer()
    const uint8Array = new Uint8Array(buffer)

    // Return Excel file as response
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="converted.xlsx"`,
      },
    })
  } catch (error: any) {
    console.error('CSV to Excel conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to convert CSV to Excel: ' + (error.message || error.toString()) },
      { status: 500 }
    )
  }
}

