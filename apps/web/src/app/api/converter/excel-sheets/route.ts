import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const excelFile = formData.get('file') as File

    if (!excelFile) {
      return NextResponse.json(
        { error: 'Excel file is required' },
        { status: 400 }
      )
    }

    // Convert Excel file to Buffer
    const arrayBuffer = await excelFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Load Excel workbook
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    // Get all sheet names
    const sheetNames = workbook.worksheets.map(ws => ws.name)

    if (sheetNames.length === 0) {
      return NextResponse.json(
        { error: 'No sheets found in Excel file' },
        { status: 400 }
      )
    }

    // Return sheet names
    return NextResponse.json({
      sheets: sheetNames,
    })
  } catch (error: any) {
    console.error('Error reading Excel sheets:', error)
    return NextResponse.json(
      { error: 'Failed to read Excel file: ' + (error.message || error.toString()) },
      { status: 500 }
    )
  }
}

