export interface DownloadProgress {
    loaded: number
    total: number
    percentage: number
}

export interface DownloadOptions {
    filename?: string
    onProgress?: (progress: DownloadProgress) => void
}

export async function downloadFile(
    url: string,
    options: DownloadOptions = {}
): Promise<void> {
    const { filename, onProgress } = options

    // Ensure url is a string
    if (typeof url !== 'string') {
        console.error('❌ Invalid URL type:', typeof url, url)
        throw new Error('URL harus berupa string')
    }

    // Handle array URLs (take first element)
    let downloadUrl = url
    if (Array.isArray(url)) {
        if (url.length === 0) {
            throw new Error('URL array kosong')
        }
        downloadUrl = url[0]
        console.log('⚠️ URL is array, using first element:', downloadUrl)
    }

    // Ensure downloadUrl is a string
    if (typeof downloadUrl !== 'string') {
        console.error('❌ Invalid downloadUrl type:', typeof downloadUrl, downloadUrl)
        throw new Error('URL tidak valid')
    }

    console.log('🚀 Starting download:', {
        url: downloadUrl.substring(0, 100) + '...',
        filename
    })

    try {
        // Try direct download first (even for googlevideo.com) - browser has better access
        let response: Response
        const isGooglevideoUrl = downloadUrl.includes('googlevideo.com')

        // For googlevideo.com, try direct download first (browser can access it)
        if (isGooglevideoUrl) {
            console.log('🌐 Trying direct download for googlevideo.com (browser access)')
            try {
                // Try with CORS mode first (might work in some browsers)
                response = await fetch(downloadUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': '*/*',
                        'Range': 'bytes=0-',
                        'Referer': 'https://www.youtube.com/',
                    },
                    mode: 'cors',
                    credentials: 'omit',
                })

                console.log('✅ Direct download response:', {
                    status: response.status,
                    ok: response.ok,
                    type: response.type,
                    contentType: response.headers.get('content-type')
                })

                // If CORS fails, we'll catch it below
            } catch (directError: any) {
                console.log('⚠️ Direct download failed, trying proxy:', directError.message)
                // Fallback to proxy
                const proxyUrl = `/api/downloader/proxy?url=${encodeURIComponent(downloadUrl)}`
                response = await fetch(proxyUrl)
            }
        } else {
            // For other URLs, try direct download first
            try {
                response = await fetch(downloadUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': '*/*',
                        'Range': 'bytes=0-',
                    },
                    mode: 'cors',
                })
                console.log('✅ Direct download response:', {
                    status: response.status,
                    ok: response.ok,
                    contentType: response.headers.get('content-type')
                })
            } catch (directError: any) {
                // If direct fetch fails (CORS), use proxy
                console.log('⚠️ Direct download failed, using proxy:', directError.message)
                const proxyUrl = `/api/downloader/proxy?url=${encodeURIComponent(downloadUrl)}`
                response = await fetch(proxyUrl)
            }
        }

        if (!response.ok || response.status === 0 || response.type === 'opaque') {
            // If direct download fails or returns opaque, try proxy
            console.log('🔄 Direct download failed or opaque, trying proxy...')
            const proxyUrl = `/api/downloader/proxy?url=${encodeURIComponent(downloadUrl)}`
            response = await fetch(proxyUrl)

            if (!response.ok) {
                // If proxy also fails with 403, Google Video is blocking server-side access
                if (isGooglevideoUrl && response.status === 403) {
                    console.log('⚠️ Proxy failed with 403 - Google Video blocks server access')
                    throw new Error('Google Video memblokir download melalui server proxy. Silakan gunakan tombol "Copy URL" di atas dan gunakan URL tersebut di browser extension (Video DownloadHelper) atau tools seperti yt-dlp untuk download video ini.')
                }

                const errorText = await response.text().catch(() => '')
                console.error('❌ Proxy download failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText.substring(0, 200)
                })
                throw new Error(`Download failed: ${response.status} ${response.statusText}. Silakan coba download langsung dari browser atau gunakan extension seperti Video DownloadHelper.`)
            }
        }

        const contentLength = response.headers.get('content-length')
        const total = contentLength ? parseInt(contentLength, 10) : 0
        const contentType = response.headers.get('content-type') || ''
        
        // Extract MIME type (remove charset, etc.)
        const mimeType = contentType.split(';')[0].trim()

        console.log('📦 Download info:', {
            contentLength: total > 0 ? `${(total / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
            contentType,
            mimeType,
            hasBody: !!response.body
        })

        if (!response.body) {
            throw new Error('ReadableStream not supported')
        }

        const reader = response.body.getReader()
        const chunks: Uint8Array[] = []
        let loaded = 0
        const startTime = Date.now()

        console.log('📥 Starting to read stream...')

        while (true) {
            const { done, value } = await reader.read()

            if (done) {
                console.log('✅ Stream reading completed:', {
                    chunks: chunks.length,
                    totalBytes: loaded,
                    duration: `${((Date.now() - startTime) / 1000).toFixed(2)}s`
                })
                break
            }

            chunks.push(value)
            loaded += value.length

            if (onProgress) {
                if (total > 0) {
                    onProgress({
                        loaded,
                        total,
                        percentage: Math.round((loaded / total) * 100),
                    })
                } else {
                    // If no content-length, estimate progress
                    onProgress({
                        loaded,
                        total: loaded, // Use loaded as total for now
                        percentage: loaded > 0 ? 50 : 0, // Estimate 50% if we have data but no total
                    })
                }
            }

            // Log progress every 1MB
            if (loaded % (1024 * 1024) < value.length) {
                console.log(`📊 Download progress: ${(loaded / 1024 / 1024).toFixed(2)} MB`)
            }
        }

        if (chunks.length === 0) {
            throw new Error('No data received from server')
        }

        console.log('🔨 Creating blob...', {
            chunksCount: chunks.length,
            totalSize: `${(loaded / 1024 / 1024).toFixed(2)} MB`
        })

        const blob = new Blob(chunks as BlobPart[], { type: contentType })
        const blobUrl = URL.createObjectURL(blob)

        console.log('💾 Triggering download...', {
            filename,
            blobSize: `${(blob.size / 1024 / 1024).toFixed(2)} MB`
        })

        // Determine extension from MIME type if available
        const extension = mimeType ? getFileExtension(downloadUrl, mimeType) : getFileExtension(downloadUrl)
        const finalFilename = filename || getFilenameFromUrl(downloadUrl) || 'download'
        
        // Ensure filename has correct extension
        const filenameWithExt = finalFilename.includes('.') 
          ? finalFilename.split('.').slice(0, -1).join('.') + '.' + extension
          : finalFilename + '.' + extension

        const link = document.createElement('a')
        link.href = blobUrl
        link.download = filenameWithExt
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()

        // Wait a bit before removing
        setTimeout(() => {
            document.body.removeChild(link)
            URL.revokeObjectURL(blobUrl)
            console.log('✅ Download completed!')
        }, 100)
    } catch (error) {
        throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

export function getFilenameFromUrl(url: string): string {
    try {
        const urlObj = new URL(url)
        const pathname = urlObj.pathname
        const filename = pathname.split('/').pop() || 'download'

        // Remove query parameters from filename
        return filename.split('?')[0]
    } catch {
        return 'download'
    }
}

export function sanitizeFilename(filename: string): string {
    // Remove invalid characters for filenames
    return filename
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 255) // Max filename length
}

export function getFileExtension(url: string, mimeType?: string): string {
    // Try to get extension from MIME type first
    if (mimeType) {
        const mimeToExt: Record<string, string> = {
            'video/mp4': 'mp4',
            'video/webm': 'webm',
            'video/quicktime': 'mov',
            'audio/mpeg': 'mp3',
            'audio/mp4': 'm4a',
            'audio/webm': 'webm',
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
        }

        if (mimeToExt[mimeType]) {
            return mimeToExt[mimeType]
        }
    }

    // Fallback to URL extension
    try {
        const urlObj = new URL(url)
        const pathname = urlObj.pathname
        const match = pathname.match(/\.([a-z0-9]+)$/i)
        if (match) {
            return match[1].toLowerCase()
        }
    } catch {
        // Invalid URL, continue
    }

    return 'mp4' // Default extension
}

