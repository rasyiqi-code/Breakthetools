import { NextRequest, NextResponse } from 'next/server'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
    },
  })
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { error: 'URL is required' },
      { status: 400 }
    )
  }

  try {
    // Validate URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      )
    }

    console.log('🔄 Proxy downloading:', url.substring(0, 100) + '...')

    // Fetch the file from the URL with browser-like headers
    const isGooglevideo = url.includes('googlevideo.com')

    // Build headers that mimic a real browser request
    const headers: HeadersInit = {
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'identity', // Don't compress, we need raw data
      'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.youtube.com/',
      'Origin': 'https://www.youtube.com',
    }

    // Add Sec-Fetch headers for googlevideo.com to mimic browser
    if (isGooglevideo) {
      headers['Sec-Fetch-Dest'] = 'video'
      headers['Sec-Fetch-Mode'] = 'no-cors'
      headers['Sec-Fetch-Site'] = 'cross-site'
      headers['Sec-Ch-Ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"'
      headers['Sec-Ch-Ua-Mobile'] = '?0'
      headers['Sec-Ch-Ua-Platform'] = '"Windows"'
    }

    // Support range requests if provided
    const rangeHeader = request.headers.get('Range')
    if (rangeHeader) {
      headers['Range'] = rangeHeader
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'follow',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error('❌ Proxy fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText.substring(0, 200)
      })
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}`, details: errorText.substring(0, 200) },
        { status: response.status }
      )
    }

    // Get content type and content length
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentLength = response.headers.get('content-length')
    const contentDisposition = response.headers.get('content-disposition')

    console.log('✅ Proxy response received:', {
      status: response.status,
      contentType,
      contentLength: contentLength ? `${(parseInt(contentLength) / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
      hasBody: !!response.body
    })

    // Stream the response back to client
    const stream = response.body

    if (!stream) {
      console.error('❌ No response body in proxy')
      return NextResponse.json(
        { error: 'No response body' },
        { status: 500 }
      )
    }

    // Return the stream with proper headers
    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength || '',
        'Content-Disposition': contentDisposition || `attachment; filename="download"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Range',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    console.error('Proxy download error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to proxy download' },
      { status: 500 }
    )
  }
}

