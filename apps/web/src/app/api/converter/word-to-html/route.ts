import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const wordFile = formData.get('file') as File

    if (!wordFile) {
      return NextResponse.json(
        { error: 'Word file is required' },
        { status: 400 }
      )
    }

    // Convert Word file to Buffer (Node.js Buffer, not ArrayBuffer)
    // mammoth expects Buffer in server-side Node.js environment
    const arrayBuffer = await wordFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Convert Word to HTML using mammoth (server-side)
    // mammoth.convertToHtml accepts buffer directly in Node.js
    const result = await mammoth.convertToHtml(
      { buffer },
      {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Heading 4'] => h4:fresh",
          "r[style-name='Strong'] => strong",
          "p[style-name='Title'] => h1.title:fresh",
          "p[style-name='Subtitle'] => h2.subtitle:fresh",
        ],
      }
    )

    const htmlContent = result.value

    // Wrap HTML in proper structure
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted Document</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    p {
      margin: 1em 0;
    }
    strong {
      font-weight: bold;
    }
    em {
      font-style: italic;
    }
    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    table td, table th {
      border: 1px solid #ddd;
      padding: 8px;
    }
    table th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`

    // Return HTML content
    return NextResponse.json({
      html: fullHTML,
      messages: result.messages || [],
    })
  } catch (error: any) {
    console.error('Word to HTML conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to convert Word to HTML: ' + (error.message || error.toString()) },
      { status: 500 }
    )
  }
}
