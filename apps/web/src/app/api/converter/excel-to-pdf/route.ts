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
    const uint8Array = new Uint8Array(arrayBuffer)
    const buffer = Buffer.from(uint8Array)

    // Load Excel workbook
    const workbook = new ExcelJS.Workbook()
    // @ts-expect-error - Buffer type mismatch between Node.js Buffer and ExcelJS expected type
    await workbook.xlsx.load(buffer)

    // Get the specified worksheet
    const worksheet = workbook.getWorksheet(sheetName)
    if (!worksheet) {
      return NextResponse.json(
        { error: `Sheet "${sheetName}" not found` },
        { status: 400 }
      )
    }

    // Extract all rows as array of arrays
    const rows: string[][] = []
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const rowData: string[] = []
      row.eachCell({ includeEmpty: false }, (cell) => {
        let value = ''
        if (cell.value !== null && cell.value !== undefined) {
          if (typeof cell.value === 'object') {
            if ('richText' in cell.value) {
              value = cell.value.richText.map((rt: any) => rt.text).join('')
            } else if ('formula' in cell.value) {
              value = cell.value.result?.toString() || cell.value.formula || ''
            } else if ('text' in cell.value) {
              value = cell.value.text
            } else {
              value = String(cell.value)
            }
          } else {
            value = String(cell.value)
          }
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

    // Return table data for client-side PDF generation
    return NextResponse.json({
      rows,
      sheetName,
    })
  } catch (error: any) {
    console.error('Excel to PDF conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to convert Excel to PDF: ' + (error.message || error.toString()) },
      { status: 500 }
    )
  }
}

// GET endpoint to get sheet names from Excel file
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fileUrl = searchParams.get('file')

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'File URL is required' },
        { status: 400 }
      )
    }

    // For now, we'll use POST for getting sheets too
    // This GET endpoint can be implemented if needed
    return NextResponse.json({ error: 'Use POST method' }, { status: 405 })
  } catch (error: any) {
    console.error('Error getting Excel sheets:', error)
    return NextResponse.json(
      { error: 'Failed to read Excel file: ' + (error.message || error.toString()) },
      { status: 500 }
    )
  }
}

