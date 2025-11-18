import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const excelFile = formData.get('file') as File
    const sheetName = formData.get('sheet') as string

    if (!excelFile) {
      return NextResponse.json(
        { error: 'Excel file is required' },
        { status: 400 }
      )
    }

    if (!sheetName) {
      return NextResponse.json(
        { error: 'Sheet name is required' },
        { status: 400 }
      )
    }

    // Convert Excel file to Buffer
    const arrayBuffer = await excelFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Load Excel workbook
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    // Get the specified worksheet
    const worksheet = workbook.getWorksheet(sheetName)
    if (!worksheet) {
      return NextResponse.json(
        { error: `Sheet "${sheetName}" not found` },
        { status: 400 }
      )
    }

    // Convert worksheet to CSV
    const rows: string[][] = []
    
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const rowData: string[] = []
      row.eachCell({ includeEmpty: false }, (cell) => {
        let value = ''
        
        // Handle different cell value types
        if (cell.value !== null && cell.value !== undefined) {
          if (typeof cell.value === 'object') {
            if ('richText' in cell.value) {
              // Rich text
              value = cell.value.richText.map((rt: any) => rt.text).join('')
            } else if ('formula' in cell.value) {
              // Formula - use calculated value if available, otherwise formula
              value = cell.value.result?.toString() || cell.value.formula
            } else if ('text' in cell.value) {
              // Text
              value = cell.value.text
            } else {
              value = String(cell.value)
            }
          } else {
            value = String(cell.value)
          }
        }
        
        // Escape CSV values (wrap in quotes if contains comma, newline, or quote)
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = '"' + value.replace(/"/g, '""') + '"'
        }
        
        rowData.push(value)
      })
      rows.push(rowData)
    })

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No data found in the selected sheet' },
        { status: 400 }
      )
    }

    // Convert to CSV string
    const csvString = rows.map(row => row.join(',')).join('\n')

    // Return CSV content
    return NextResponse.json({
      csv: csvString,
    })
  } catch (error: any) {
    console.error('Excel to CSV conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to convert Excel to CSV: ' + (error.message || error.toString()) },
      { status: 500 }
    )
  }
}

