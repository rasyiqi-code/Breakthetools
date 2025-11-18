import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import { DOMParser } from '@xmldom/xmldom'

// PPTX dimensions: 25.4cm x 19.05cm (10" x 7.5") for standard slide
const PPTX_WIDTH_EMU = 9144000 // 10 inches in EMU
const PPTX_HEIGHT_EMU = 6858000 // 7.5 inches in EMU

// Convert EMU to mm (1 EMU = 0.000254 mm)
function emuToMm(emu: number): number {
    return emu * 0.000254
}

// Convert EMU to points (1 EMU = 0.009259 points, 1 point = 0.352778 mm)
function emuToPt(emu: number): number {
    return emu * 0.009259
}

// Interface for text element with position and formatting
interface TextElement {
    text: string
    x: number // position in mm
    y: number // position in mm
    width: number // width in mm
    height: number // height in mm
    fontSize?: number
    bold?: boolean
    italic?: boolean
    color?: string
    align?: 'left' | 'center' | 'right'
}

// Interface for image element
interface ImageElement {
    data: string // base64
    x: number // position in mm
    y: number // position in mm
    width: number // width in mm
    height: number // height in mm
}

// Interface for slide content
interface SlideContent {
    textElements: TextElement[]
    imageElements: ImageElement[]
}

// Extract text content from a paragraph (a:p)
function extractTextFromParagraph(pNode: any): { text: string; fontSize?: number; bold?: boolean; italic?: boolean; color?: string } {
    let text = ''
    let fontSize: number | undefined
    let bold = false
    let italic = false
    let color: string | undefined

    // Get text runs (a:r)
    const runs = pNode.getElementsByTagName('a:r') || []
    for (let i = 0; i < runs.length; i++) {
        const run = runs[i]
        const textNode = run.getElementsByTagName('a:t')[0]
        if (textNode) {
            const runText = textNode.textContent || ''
            text += runText

            // Get run properties (a:rPr)
            const rPr = run.getElementsByTagName('a:rPr')[0]
            if (rPr) {
                // Font size (sz attribute, in 100ths of a point)
                const sz = rPr.getAttribute('sz')
                if (sz) {
                    fontSize = parseInt(sz) / 100
                }

                // Bold
                if (rPr.getAttribute('b') === '1') {
                    bold = true
                }

                // Italic
                if (rPr.getAttribute('i') === '1') {
                    italic = true
                }

                // Color (solidFill)
                const solidFill = rPr.getElementsByTagName('a:solidFill')[0]
                if (solidFill) {
                    const srgbClr = solidFill.getElementsByTagName('a:srgbClr')[0]
                    if (srgbClr) {
                        const val = srgbClr.getAttribute('val')
                        if (val) {
                            color = '#' + val
                        }
                    }
                }
            }
        }
    }

    return { text, fontSize, bold, italic, color }
}

// Parse shape properties (position, size)
function parseShapeProperties(spPr: any, slideWidth: number, slideHeight: number): { x: number; y: number; width: number; height: number } {
    let x = 0
    let y = 0
    let width = 0
    let height = 0

    // Get transform (a:xfrm) - try with and without namespace
    let xfrm = spPr.getElementsByTagName('a:xfrm')[0]
    if (!xfrm) {
        xfrm = spPr.getElementsByTagName('xfrm')[0]
    }
    if (xfrm) {
        // Get offset (a:off) - position - try with and without namespace
        let off = xfrm.getElementsByTagName('a:off')[0]
        if (!off) {
            off = xfrm.getElementsByTagName('off')[0]
        }
        if (off) {
            const offX = parseInt(off.getAttribute('x') || '0')
            const offY = parseInt(off.getAttribute('y') || '0')
            x = emuToMm(offX)
            y = emuToMm(offY)
        }

        // Get extent (a:ext) - size - try with and without namespace
        let ext = xfrm.getElementsByTagName('a:ext')[0]
        if (!ext) {
            ext = xfrm.getElementsByTagName('ext')[0]
        }
        if (ext) {
            const extCx = parseInt(ext.getAttribute('cx') || '0')
            const extCy = parseInt(ext.getAttribute('cy') || '0')
            width = emuToMm(extCx)
            height = emuToMm(extCy)
        }
    }

    return { x, y, width, height }
}

// Parse slide XML and extract content with layout information
function parseSlideXML(slideXML: string, zip: JSZip): SlideContent {
    // Slide dimensions (standard is 10" x 7.5")
    const slideWidthMm = 254 // 10 inches = 254 mm
    const slideHeightMm = 190.5 // 7.5 inches = 190.5 mm

    const textElements: TextElement[] = []
    const imageElements: ImageElement[] = []

    // First, try simple regex extraction as fallback
    // Extract all text content from <a:t> or <t> tags
    // Use non-greedy matching and handle nested tags
    let textMatches: string[] = []
    try {
        // Try with namespace first
        const matches1 = slideXML.match(/<a:t[^>]*>([^<]*)<\/a:t>/g)
        if (matches1) {
            textMatches = matches1
        } else {
            // Try without namespace
            const matches2 = slideXML.match(/<t[^>]*>([^<]*)<\/t>/g)
            if (matches2) {
                textMatches = matches2
            }
        }
    } catch (e) {
        console.warn('Regex extraction error:', e)
    }

    console.log(`Found ${textMatches.length} text matches in slide XML`)

    // Try DOM parsing
    let shapes: any[] = []
    try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(slideXML, 'text/xml')

        // Try to find shapes with namespace (p:sp) or without (sp)
        shapes = Array.from(doc.getElementsByTagName('p:sp') || [])
        if (shapes.length === 0) {
            // Try without namespace
            shapes = Array.from(doc.getElementsByTagName('sp') || [])
        }

        console.log(`Found ${shapes.length} shapes in slide (DOM parsing)`)
    } catch (e) {
        console.warn('DOM parsing error, using fallback:', e)
    }

    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i]

        // Get shape properties (try with and without namespace)
        let spPr = shape.getElementsByTagName('p:spPr')[0]
        if (!spPr) {
            spPr = shape.getElementsByTagName('spPr')[0]
        }
        if (!spPr) continue

        const { x, y, width, height } = parseShapeProperties(spPr, slideWidthMm, slideHeightMm)

        // Check if this is a text shape (has txBody) - try with and without namespace
        let txBody = shape.getElementsByTagName('p:txBody')[0]
        if (!txBody) {
            txBody = shape.getElementsByTagName('txBody')[0]
        }

        if (txBody) {
            // Get text body properties for default formatting
            const bodyPr = txBody.getElementsByTagName('a:bodyPr')[0]

            // Get paragraphs (a:p) - try with and without namespace
            let paragraphs = txBody.getElementsByTagName('a:p') || []
            if (paragraphs.length === 0) {
                paragraphs = txBody.getElementsByTagName('p') || []
            }

            let currentY = y

            for (let j = 0; j < paragraphs.length; j++) {
                const para = paragraphs[j]

                // Get paragraph properties (a:pPr) for alignment and spacing
                let pPr = para.getElementsByTagName('a:pPr')[0]
                if (!pPr) {
                    pPr = para.getElementsByTagName('pPr')[0]
                }
                let align = 'left'
                if (pPr) {
                    const alignAttr = pPr.getAttribute('algn')
                    if (alignAttr) {
                        align = alignAttr === 'ctr' ? 'center' : alignAttr === 'r' ? 'right' : 'left'
                    }
                }

                // Get all text runs in this paragraph - try with and without namespace
                let runs = para.getElementsByTagName('a:r') || []
                if (runs.length === 0) {
                    runs = para.getElementsByTagName('r') || []
                }
                let paragraphText = ''
                let paragraphFontSize: number | undefined
                let paragraphBold = false
                let paragraphItalic = false
                let paragraphColor: string | undefined

                // Extract text from all runs in paragraph
                for (let k = 0; k < runs.length; k++) {
                    const run = runs[k]
                    // Try with and without namespace
                    let runTextNode = run.getElementsByTagName('a:t')[0]
                    if (!runTextNode) {
                        runTextNode = run.getElementsByTagName('t')[0]
                    }
                    if (runTextNode) {
                        const runText = runTextNode.textContent || ''
                        paragraphText += runText

                        // Get run properties for this specific run
                        let rPr = run.getElementsByTagName('a:rPr')[0]
                        if (!rPr) {
                            rPr = run.getElementsByTagName('rPr')[0]
                        }
                        if (rPr) {
                            // Font size (sz attribute, in 100ths of a point)
                            const sz = rPr.getAttribute('sz')
                            if (sz) {
                                paragraphFontSize = parseInt(sz) / 100
                            }

                            // Bold
                            if (rPr.getAttribute('b') === '1') {
                                paragraphBold = true
                            }

                            // Italic
                            if (rPr.getAttribute('i') === '1') {
                                paragraphItalic = true
                            }

                            // Color (solidFill)
                            let solidFill = rPr.getElementsByTagName('a:solidFill')[0]
                            if (!solidFill) {
                                solidFill = rPr.getElementsByTagName('solidFill')[0]
                            }
                            if (solidFill) {
                                let srgbClr = solidFill.getElementsByTagName('a:srgbClr')[0]
                                if (!srgbClr) {
                                    srgbClr = solidFill.getElementsByTagName('srgbClr')[0]
                                }
                                if (srgbClr) {
                                    const val = srgbClr.getAttribute('val')
                                    if (val) {
                                        paragraphColor = '#' + val
                                    }
                                }
                            }
                        }
                    }
                }

                if (paragraphText.trim()) {
                    textElements.push({
                        text: paragraphText.trim(),
                        x: x, // Store original x position
                        y: currentY,
                        width: width || 200,
                        height: height || 10,
                        fontSize: paragraphFontSize ? paragraphFontSize * 0.352778 : undefined, // Convert pt to mm
                        bold: paragraphBold,
                        italic: paragraphItalic,
                        color: paragraphColor,
                        align: align as 'left' | 'center' | 'right', // Store alignment
                    })

                    // Estimate line height and spacing between paragraphs
                    const lineHeight = paragraphFontSize ? paragraphFontSize * 0.352778 * 1.2 : 12 * 1.2
                    currentY += lineHeight + 2 // Add small spacing between paragraphs
                }
            }
        }

        // Check if this is an image (has pic or blip)
        let pic = shape.getElementsByTagName('p:pic')[0]
        if (!pic) {
            pic = shape.getElementsByTagName('pic')[0]
        }
        if (pic) {
            let blip = pic.getElementsByTagName('a:blip')[0]
            if (!blip) {
                blip = pic.getElementsByTagName('blip')[0]
            }
            if (blip) {
                const embed = blip.getAttribute('r:embed')
                if (embed) {
                    // Get image relationship to find image file
                    // Images are typically in ppt/media/ folder
                    // This would require parsing relationships, but for now we'll skip images
                    // as it requires more complex parsing
                }
            }
        }
    }

    // Fallback: if no text found in shapes, use regex extraction
    if (textElements.length === 0) {
        console.log('No text found in shapes, trying regex fallback extraction')
        console.log(`Text matches found: ${textMatches.length}`)

        let fallbackY = 50 // Start from top with margin
        for (let j = 0; j < textMatches.length; j++) {
            // Extract text content from XML tag
            const match = textMatches[j]
            // Try multiple patterns to extract text
            let textMatch = match.match(/>([^<]+)</)
            if (!textMatch) {
                // Try pattern without closing tag
                textMatch = match.match(/>([^<]*)/)
            }
            if (!textMatch) {
                // Try direct content extraction
                textMatch = match.match(/<[^>]*>([^<]*)<\/[^>]*>/)
            }

            if (textMatch && textMatch[1]) {
                let text = textMatch[1].trim()

                // Decode XML entities
                const decodedText = text
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&apos;/g, "'")
                    .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
                    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))

                if (decodedText && decodedText.length > 0) {
                    textElements.push({
                        text: decodedText,
                        x: 50,
                        y: fallbackY,
                        width: 200,
                        height: 10,
                        fontSize: 12,
                        align: 'left',
                    })
                    console.log(`Added text element: "${decodedText.substring(0, 50)}..."`)
                    fallbackY += 15
                }
            }
        }

        // If still no text, try extracting from entire XML as fallback
        if (textElements.length === 0) {
            console.log('Still no text, trying to extract from entire XML')
            // Try to get all text content from XML - more aggressive extraction
            let allText = slideXML
                // Remove all XML tags
                .replace(/<[^>]+>/g, ' ')
                // Decode common XML entities
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'")
                // Normalize whitespace
                .replace(/\s+/g, ' ')
                .trim()

            console.log(`Extracted raw text length: ${allText.length}`)

            if (allText && allText.length > 0) {
                // Filter out common XML/PPTX metadata text
                const metadataPatterns = [
                    /xmlns[^ ]*/gi,
                    /ppt\//gi,
                    /p:/gi,
                    /a:/gi,
                    /r:/gi,
                    /mc:/gi,
                    /p14:/gi,
                    /p15:/gi,
                    /Office Open XML/gi,
                    /Microsoft PowerPoint/gi,
                ]

                for (const pattern of metadataPatterns) {
                    allText = allText.replace(pattern, '')
                }

                allText = allText.replace(/\s+/g, ' ').trim()

                if (allText && allText.length > 2) {
                    // Split by spaces and group into paragraphs (skip very short strings)
                    const words = allText.split(' ').filter(w => w.length > 1)

                    if (words.length > 0) {
                        const chunks: string[] = []
                        for (let i = 0; i < words.length; i += 10) {
                            const chunk = words.slice(i, i + 10).join(' ')
                            if (chunk.trim().length > 2) {
                                chunks.push(chunk.trim())
                            }
                        }

                        console.log(`Created ${chunks.length} text chunks from XML`)

                        let fallbackY2 = 50
                        for (const chunk of chunks) {
                            if (chunk.trim() && chunk.trim().length > 2) {
                                textElements.push({
                                    text: chunk.trim(),
                                    x: 50,
                                    y: fallbackY2,
                                    width: 200,
                                    height: 10,
                                    fontSize: 12,
                                    align: 'left',
                                })
                                fallbackY2 += 15
                            }
                        }
                    }
                }
            }
        }
    }

    console.log(`Extracted ${textElements.length} text elements from slide (total matches: ${textMatches.length})`)

    return {
        textElements,
        imageElements,
    }
}

// Extract slide IDs from presentation.xml
function extractSlideIds(presentationXML: string): string[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(presentationXML, 'text/xml')

    // Find slide IDs in relationships or slide list
    const slideIds: string[] = []

    // Try to find slide list in presentation.xml
    const slideIdList = doc.getElementsByTagName('p:sldId')
    for (let i = 0; i < slideIdList.length; i++) {
        const slideId = slideIdList[i].getAttribute('r:id')
        if (slideId) {
            slideIds.push(slideId)
        }
    }

    // Alternative: look for slide references
    if (slideIds.length === 0) {
        // Try to find slides/slide*.xml files directly from ZIP
        // This will be handled in the main function
    }

    return slideIds
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const pptFile = formData.get('file') as File

        if (!pptFile) {
            return NextResponse.json(
                { error: 'PowerPoint file is required' },
                { status: 400 }
            )
        }

        // Only support .pptx (Office Open XML format), not legacy .ppt
        if (!pptFile.name.toLowerCase().endsWith('.pptx')) {
            return NextResponse.json(
                { error: 'Only .pptx format is supported. Legacy .ppt format is not supported.' },
                { status: 400 }
            )
        }

        // Convert file to array buffer
        const arrayBuffer = await pptFile.arrayBuffer()

        // Load PPTX file using JSZip (PPTX is a ZIP archive)
        const zip = await JSZip.loadAsync(arrayBuffer)

        // Extract presentation.xml
        const presentationFile = zip.file('ppt/presentation.xml')
        if (!presentationFile) {
            throw new Error('Invalid PPTX file: presentation.xml not found')
        }

        const presentationXML = await presentationFile.async('string')

        // Find all slide files (ppt/slides/slide*.xml)
        const slides: SlideContent[] = []
        const slideFiles = Object.keys(zip.files).filter(
            (name) => name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
        )

        // Sort slides by number
        slideFiles.sort((a, b) => {
            const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0')
            const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0')
            return numA - numB
        })

        if (slideFiles.length === 0) {
            throw new Error('No slides found in PPTX file')
        }

        console.log(`Found ${slideFiles.length} slide files`)

        // Parse each slide
        for (let idx = 0; idx < slideFiles.length; idx++) {
            const slidePath = slideFiles[idx]
            const slideFile = zip.file(slidePath)
            if (slideFile) {
                const slideXML = await slideFile.async('string')
                console.log(`Parsing slide ${idx + 1}/${slideFiles.length}: ${slidePath}`)
                const slideContent = parseSlideXML(slideXML, zip)
                slides.push(slideContent)
                console.log(`Slide ${idx + 1} parsed: ${slideContent.textElements.length} text elements, ${slideContent.imageElements.length} images`)
            }
        }

        // Check if we have any content at all
        const totalTextElements = slides.reduce((sum, slide) => sum + slide.textElements.length, 0)
        const totalImages = slides.reduce((sum, slide) => sum + slide.imageElements.length, 0)
        console.log(`Total extracted: ${totalTextElements} text elements, ${totalImages} images across ${slides.length} slides`)

        if (totalTextElements === 0 && totalImages === 0) {
            console.warn('No content found in any slide! Adding test content to verify PDF generation works.')
            // Add test text to first slide to verify PDF generation works
            if (slides.length > 0) {
                slides[0].textElements.push({
                    text: 'Test: PDF generation is working. However, no text content was found in the PowerPoint file.',
                    x: 50,
                    y: 100,
                    width: 200,
                    height: 10,
                    fontSize: 14,
                    align: 'left',
                })
            }
        }

        // Import jsPDF dynamically
        const jsPDFModule = await import('jspdf')
        const jsPDF = (jsPDFModule as any).jsPDF || jsPDFModule.default || jsPDFModule

        // Create PDF with landscape orientation
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        })

        // PPTX standard dimensions: 10" x 7.5" (254mm x 190.5mm)
        const pptxWidthMm = 254
        const pptxHeightMm = 190.5

        // PDF page dimensions (landscape A4)
        const pdfWidthMm = 297
        const pdfHeightMm = 210

        // Calculate scaling factor to fit PPTX slide in PDF page
        const scaleX = pdfWidthMm / pptxWidthMm
        const scaleY = pdfHeightMm / pptxHeightMm
        const scale = Math.min(scaleX, scaleY) // Use smaller scale to fit both dimensions

        // Calculate offset to center slide in PDF page
        const scaledWidth = pptxWidthMm * scale
        const scaledHeight = pptxHeightMm * scale
        const offsetX = (pdfWidthMm - scaledWidth) / 2
        const offsetY = (pdfHeightMm - scaledHeight) / 2

        // Convert each slide to a PDF page
        for (let i = 0; i < slides.length; i++) {
            if (i > 0) {
                pdf.addPage()
            }

            const slide = slides[i]

            console.log(`Processing slide ${i + 1}, found ${slide.textElements.length} text elements, ${slide.imageElements.length} images`)

            // Debug: log first few text elements
            if (slide.textElements.length > 0) {
                console.log(`First text element: "${slide.textElements[0].text.substring(0, 50)}..."`)
            }

            // If no content at all, add a placeholder
            if (slide.textElements.length === 0 && slide.imageElements.length === 0) {
                console.log(`Slide ${i + 1} has no content, adding placeholder`)
                pdf.setFontSize(12)
                pdf.setTextColor(128, 128, 128)
                pdf.text('(Empty slide - no content found)', offsetX + scaledWidth / 2, offsetY + scaledHeight / 2, {
                    align: 'center',
                })
                continue
            }

            // Sort text elements by y position (top to bottom)
            const sortedTextElements = [...slide.textElements].sort((a, b) => a.y - b.y)

            console.log(`Rendering ${sortedTextElements.length} text elements for slide ${i + 1}`)

            // Render each text element at its position
            for (let idx = 0; idx < sortedTextElements.length; idx++) {
                const textEl = sortedTextElements[idx]

                // Scale position and size
                const x = offsetX + (textEl.x * scale)
                const y = offsetY + (textEl.y * scale)
                const width = textEl.width * scale

                // Set font properties
                const fontSize = textEl.fontSize ? textEl.fontSize * scale : 12 * scale
                pdf.setFontSize(fontSize)

                console.log(`Rendering text ${idx + 1}/${sortedTextElements.length}: "${textEl.text.substring(0, 30)}..." at (${x.toFixed(1)}, ${y.toFixed(1)}) with fontSize ${fontSize.toFixed(1)}`)

                // Set font style (jsPDF doesn't support bold+italic together well, so prioritize bold)
                if (textEl.bold) {
                    pdf.setFont('helvetica', 'bold')
                } else if (textEl.italic) {
                    pdf.setFont('helvetica', 'italic')
                } else {
                    pdf.setFont('helvetica', 'normal')
                }

                // Set text color
                if (textEl.color) {
                    // Convert hex color to RGB
                    const hex = textEl.color.replace('#', '')
                    if (hex.length === 6) {
                        const r = parseInt(hex.substring(0, 2), 16)
                        const g = parseInt(hex.substring(2, 4), 16)
                        const b = parseInt(hex.substring(4, 6), 16)
                        pdf.setTextColor(r, g, b)
                    } else {
                        pdf.setTextColor(0, 0, 0)
                    }
                } else {
                    pdf.setTextColor(0, 0, 0)
                }

                // Split text to fit width and render
                const lines = pdf.splitTextToSize(textEl.text, width)

                // Use stored alignment if available
                const align = textEl.align || 'left'

                // Render text with appropriate alignment
                for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
                    const line = lines[lineIdx]
                    const lineY = y + (lineIdx * fontSize * 1.2)

                    if (align === 'center') {
                        // Center alignment: x is the center of the text box
                        pdf.text(line, x, lineY, { align: 'center', maxWidth: width })
                    } else if (align === 'right') {
                        // Right alignment: x + width is the right edge
                        pdf.text(line, x + width, lineY, { align: 'right', maxWidth: width })
                    } else {
                        // Left alignment (default)
                        pdf.text(line, x, lineY, { maxWidth: width })
                    }
                }
            }

            // Render images if any
            for (const imageEl of slide.imageElements) {
                const x = offsetX + (imageEl.x * scale)
                const y = offsetY + (imageEl.y * scale)
                const width = imageEl.width * scale
                const height = imageEl.height * scale

                try {
                    pdf.addImage(imageEl.data, 'PNG', x, y, width, height)
                } catch (e) {
                    console.warn('Failed to add image to PDF:', e)
                }
            }

            // If no content, add placeholder
            if (slide.textElements.length === 0 && slide.imageElements.length === 0) {
                pdf.setFontSize(12)
                pdf.setTextColor(128, 128, 128)
                pdf.text('(Empty slide)', offsetX + scaledWidth / 2, offsetY + scaledHeight / 2, {
                    align: 'center',
                })
            }
        }

        // Generate PDF buffer
        console.log('Generating PDF buffer...')
        const pdfBlob = pdf.output('arraybuffer')
        const uint8Array = new Uint8Array(pdfBlob)

        console.log(`PDF generated successfully: ${uint8Array.length} bytes`)

        // Return PDF file as response
        return new NextResponse(uint8Array, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${pptFile.name.replace(/\.pptx?$/i, '.pdf')}"`,
            },
        })
    } catch (error: any) {
        console.error('PowerPoint to PDF conversion error:', error)

        const errorMsg = error.message || error.toString()

        // Provide helpful error messages
        if (errorMsg.includes('Invalid PPTX') || errorMsg.includes('not found')) {
            return NextResponse.json(
                { error: 'Invalid PPTX file format. Please ensure the file is a valid PowerPoint presentation (.pptx).' },
                { status: 400 }
            )
        }

        if (errorMsg.includes('No slides')) {
            return NextResponse.json(
                { error: 'No slides found in the PowerPoint file.' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to convert PowerPoint to PDF: ' + errorMsg },
            { status: 500 }
        )
    }
}

