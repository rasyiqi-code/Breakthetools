import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const pdfFile = formData.get('file') as File
        const pagesData = formData.get('pages') as string // JSON string of text per page

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

        // Parse pages data (array of { pageNum: number, text: string })
        const pages = JSON.parse(pagesData) as Array<{ pageNum: number; text: string }>

        if (!Array.isArray(pages) || pages.length === 0) {
            return NextResponse.json(
                { error: 'No text data found in PDF' },
                { status: 400 }
            )
        }

        // Create DOCX document with text from PDF pages
        const children: (Paragraph | Paragraph[])[] = []

        pages.forEach((page, index) => {
            // Add page heading if multiple pages
            if (pages.length > 1) {
                children.push(
                    new Paragraph({
                        text: `Page ${page.pageNum}`,
                        heading: HeadingLevel.HEADING_2,
                        spacing: { after: 200 },
                    })
                )
            }

            // Split text into paragraphs (by double newlines or single newlines)
            const paragraphs = page.text
                .split(/\n\n+/)
                .filter(p => p.trim().length > 0)

            if (paragraphs.length === 0) {
                // If no paragraphs found, split by single newline
                const lines = page.text.split('\n').filter(l => l.trim().length > 0)
                lines.forEach(line => {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: line.trim(),
                                    size: 22, // 11pt font size (in half-points)
                                }),
                            ],
                            spacing: { after: 120 },
                        })
                    )
                })
            } else {
                // Add paragraphs
                paragraphs.forEach((para, paraIndex) => {
                    const text = para.trim()
                    if (text.length > 0) {
                        // Check if paragraph looks like a heading (short, all caps, or ends without period)
                        const isHeading = text.length < 100 && (
                            text === text.toUpperCase() ||
                            !text.match(/[.!?]$/)
                        )

                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: text,
                                        size: isHeading ? 28 : 22, // 14pt for headings, 11pt for regular
                                        bold: isHeading,
                                    }),
                                ],
                                heading: isHeading ? HeadingLevel.HEADING_3 : undefined,
                                spacing: { after: isHeading ? 200 : 120 },
                            })
                        )
                    }
                })
            }

            // Add page break between pages (except for last page)
            if (index < pages.length - 1) {
                children.push(
                    new Paragraph({
                        children: [new TextRun({ text: '', break: 1 })], // Page break
                    })
                )
            }
        })

        // Create DOCX document
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: children.flat(),
                },
            ],
        })

        // Generate DOCX buffer
        const buffer = await Packer.toBuffer(doc)

        // Convert Buffer to Uint8Array for NextResponse
        const uint8Array = new Uint8Array(buffer)

        // Return DOCX file as response
        return new NextResponse(uint8Array, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${pdfFile.name.replace('.pdf', '.docx')}"`,
            },
        })
    } catch (error: any) {
        console.error('PDF to Word conversion error:', error)
        return NextResponse.json(
            { error: 'Failed to convert PDF to Word: ' + (error.message || error.toString()) },
            { status: 500 }
        )
    }
}

