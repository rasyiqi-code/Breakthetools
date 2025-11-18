import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const pdfFile = formData.get('pdf') as File
        const pagesData = formData.get('pages') as string // JSON string of table data per page

        if (!pdfFile) {
            return NextResponse.json(
                { error: 'PDF file is required' },
                { status: 400 }
            )
        }

        if (!pagesData) {
            return NextResponse.json(
                { error: 'Pages data is required' },
                { status: 400 }
            )
        }

        // Parse pages data (array of { pageNum: number, table: string[][] })
        const pages = JSON.parse(pagesData) as Array<{ pageNum: number; table: string[][] }>

        if (!Array.isArray(pages) || pages.length === 0) {
            return NextResponse.json(
                { error: 'No table data found in PDF' },
                { status: 400 }
            )
        }

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook()
        let hasData = false

        // Add worksheets for each page with table data
        for (const page of pages) {
            if (page.table && page.table.length > 0) {
                hasData = true
                const worksheet = workbook.addWorksheet(`Page ${page.pageNum}`)

                // Add rows to worksheet
                page.table.forEach((row, rowIndex) => {
                    // First row as header
                    if (rowIndex === 0) {
                        const headerRow = worksheet.addRow(row)
                        headerRow.font = { bold: true }
                    } else {
                        worksheet.addRow(row)
                    }
                })

                // Auto-fit columns
                worksheet.columns.forEach((column: any) => {
                    if (column && column.eachCell) {
                        let maxLength = 0
                        column.eachCell({ includeEmpty: false }, (cell: any) => {
                            const cellValue = cell.value?.toString() || ''
                            maxLength = Math.max(maxLength, cellValue.length)
                        })
                        column.width = Math.min(maxLength + 2, 50)
                    }
                })
            }
        }

        if (!hasData) {
            return NextResponse.json(
                { error: 'No table data found in PDF' },
                { status: 400 }
            )
        }

        // Generate Excel file buffer
        const buffer = await workbook.xlsx.writeBuffer()

        // Return Excel file as response
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${pdfFile.name.replace('.pdf', '.xlsx')}"`,
            },
        })
    } catch (error: any) {
        console.error('PDF to Excel conversion error:', error)
        return NextResponse.json(
            { error: 'Failed to convert PDF to Excel: ' + (error.message || error.toString()) },
            { status: 500 }
        )
    }
}

