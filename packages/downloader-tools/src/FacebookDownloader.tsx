'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Download, Loader2, Video, AlertCircle } from 'lucide-react'
import { parseFacebookUrl, type ParsedUrl } from './utils/urlParser'
import { downloadFile, sanitizeFilename, getFileExtension, type DownloadProgress } from './utils/downloader'

// Video Preview Component
function VideoPreview({ url, title }: { url: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (videoRef.current) {
      // Seek to 1 second to show a frame
      const video = videoRef.current
      const handleLoadedMetadata = () => {
        if (video.duration > 0) {
          video.currentTime = Math.min(1, video.duration * 0.1) // Seek to 10% or 1 second, whichever is smaller
        }
      }
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
    }
  }, [])

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100">
        <Video className="w-16 h-16 text-neutral-400 mb-2" />
        <span className="text-neutral-500 text-sm">Preview tidak tersedia</span>
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      src={url}
      className="w-full h-full object-cover"
      controls={false}
      muted
      playsInline
      preload="metadata"
      onError={() => {
        console.log('⚠️ Video preview failed to load')
        setHasError(true)
      }}
      onLoadedMetadata={() => {
        console.log('✅ Video preview metadata loaded')
      }}
    />
  )
}

interface MediaInfo {
  title?: string
  thumbnail?: string
  formats?: Array<{
    quality: string
    url: string
    format: 'video' | 'audio' | 'image'
    size?: number
  }>
  type: 'video' | 'audio' | 'image'
  note?: string
}

export function FacebookDownloader() {
  const [url, setUrl] = useState('')
  const [parsedUrl, setParsedUrl] = useState<ParsedUrl | null>(null)
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedQuality, setSelectedQuality] = useState<string>('')
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (url.trim()) {
      // Normalize URL - ensure it's a valid Facebook URL
      let normalizedUrl = url.trim()

      // Add https:// if missing
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl
      }

      // Fix common Facebook URL variations
      normalizedUrl = normalizedUrl.replace(/facebook\.com\/watch\?v=/g, 'facebook.com/watch/?v=')

      // Normalize reel URLs - remove query params
      if (normalizedUrl.includes('/reel/')) {
        normalizedUrl = normalizedUrl.split('?')[0]
      }

      const parsed = parseFacebookUrl(normalizedUrl)
      setParsedUrl(parsed)
      if (!parsed.isValid) {
        setError('URL Facebook tidak valid. Pastikan URL adalah link video atau Reel Facebook yang benar.')
      } else {
        setError('')
      }
    } else {
      setParsedUrl(null)
      setMediaInfo(null)
      setError('')
    }
  }, [url])

  useEffect(() => {
    if (parsedUrl?.isValid) {
      const timer = setTimeout(() => {
        fetchMediaInfo()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [parsedUrl])

  const fetchMediaInfo = useCallback(async () => {
    if (!parsedUrl?.isValid) {
      return
    }

    setLoading(true)
    setError('')
    setMediaInfo(null)

    try {
      // Normalize URL for API call
      let normalizedUrl = url.trim()
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl
      }
      normalizedUrl = normalizedUrl.replace(/facebook\.com\/watch\?v=/g, 'facebook.com/watch/?v=')

      // Normalize reel URLs - remove query params
      if (normalizedUrl.includes('/reel/')) {
        normalizedUrl = normalizedUrl.split('?')[0]
      }

      const apiUrl = `/api/downloader/facebook?id=${parsedUrl.id || ''}&url=${encodeURIComponent(normalizedUrl)}`
      const response = await fetch(apiUrl)

      if (response.ok) {
        const data = await response.json()
        if (data.note) {
          throw new Error(data.note)
        }

        // Log for debugging
        console.log('📥 Facebook API response:', {
          title: data.title,
          hasThumbnail: !!data.thumbnail,
          thumbnailLength: data.thumbnail?.length || 0,
          thumbnailPreview: data.thumbnail?.substring(0, 100) || 'N/A',
          formatsCount: data.formats?.length || 0,
        })

        setMediaInfo(data)

        if (data.formats && data.formats.length > 0) {
          setSelectedQuality(data.formats[0].quality)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Gagal mengambil informasi video')
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil informasi dari Facebook')
      setMediaInfo(null)
    } finally {
      setLoading(false)
    }
  }, [parsedUrl, url])

  const handleDownload = async () => {
    if (!mediaInfo || !selectedQuality || isDownloading) return

    try {
      setIsDownloading(true)
      setDownloadProgress({ loaded: 0, total: 100, percentage: 0 })
      setError('')

      const format = mediaInfo.formats?.find(
        (f) => f.quality === selectedQuality
      )

      if (!format || !format.url) {
        throw new Error('Format tidak ditemukan atau URL tidak valid')
      }

      // Determine extension based on format type
      let extension = getFileExtension(format.url)

      // Fallback extension for video
      if (!extension) {
        if (format.url.includes('.mp4')) {
          extension = 'mp4'
        } else if (format.url.includes('.webm')) {
          extension = 'webm'
        } else {
          extension = 'mp4' // Default for videos
        }
      }

      // Create filename with proper extension
      const baseName = mediaInfo.title || 'facebook-video'
      const sanitizedBaseName = sanitizeFilename(baseName)

      // Remove existing extension if any, then add correct one
      const filenameWithoutExt = sanitizedBaseName.replace(/\.[^/.]+$/, '')
      const filename = `${filenameWithoutExt}.${extension}`

      await downloadFile(format.url, {
        filename,
        onProgress: (progress) => {
          setDownloadProgress(progress)
        },
      })

      setDownloadProgress(null)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Gagal mendownload')
      setDownloadProgress(null)
    } finally {
      setIsDownloading(false)
    }
  }

  const formatSize = (bytes?: number): string => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Facebook Downloader</h1>
        <p className="text-sm sm:text-base text-neutral-600 mb-2">Download video dan Reels dari Facebook</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Masukkan URL Facebook
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.facebook.com/watch/?v=... atau https://www.facebook.com/reel/..."
          className="w-full px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
        />

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <div className="flex-1 text-sm text-red-800">{error}</div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="tool-card p-6 mb-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
            <span className="text-neutral-600">Mengambil informasi video...</span>
          </div>
        </div>
      )}

      {mediaInfo && !loading && (
        <>
          <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900 mb-3 sm:mb-4">Preview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 aspect-video min-h-[200px]">
                {mediaInfo.thumbnail ? (
                  <img
                    src={mediaInfo.thumbnail}
                    alt={mediaInfo.title || 'Video preview'}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      // Try to use proxy for thumbnail
                      const img = e.currentTarget
                      const originalSrc = img.src
                      if (originalSrc && !originalSrc.includes('/api/downloader/proxy')) {
                        console.log('🔄 Thumbnail failed, trying proxy:', originalSrc.substring(0, 100))
                        img.src = `/api/downloader/proxy?url=${encodeURIComponent(originalSrc)}`
                      } else {
                        // Final fallback: hide image, video preview will be shown by conditional rendering
                        console.log('⚠️ Thumbnail failed even with proxy')
                        img.style.display = 'none'
                      }
                    }}
                    onLoad={() => {
                      console.log('✅ Thumbnail loaded successfully')
                    }}
                  />
                ) : mediaInfo.formats && mediaInfo.formats.length > 0 && mediaInfo.formats[0].url ? (
                  // Use video element as preview if thumbnail not available
                  <VideoPreview url={mediaInfo.formats[0].url} title={mediaInfo.title || 'Video preview'} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100">
                    <Video className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-400 mb-2" />
                    <span className="text-xs sm:text-sm text-neutral-500">Preview tidak tersedia</span>
                    {mediaInfo.formats && mediaInfo.formats.length > 0 && (
                      <span className="text-neutral-400 text-xs mt-1">
                        {mediaInfo.formats.length} format tersedia untuk download
                      </span>
                    )}
                  </div>
                )}
              </div>
              {mediaInfo.formats && mediaInfo.formats.length > 0 && (
                <div>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-neutral-700 mb-2 block">
                      Kualitas
                    </label>
                    <select
                      value={selectedQuality}
                      onChange={(e) => setSelectedQuality(e.target.value)}
                      className="w-full px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                    >
                      {mediaInfo.formats.map((format) => (
                        <option key={format.quality} value={format.quality}>
                          {format.quality} {format.size ? `(${formatSize(format.size)})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleDownload}
                    disabled={!selectedQuality || isDownloading}
                    className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    {downloadProgress ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm sm:text-base">Downloading... {downloadProgress.percentage}%</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span className="text-sm sm:text-base">Download Video</span>
                      </>
                    )}
                  </button>
                  {downloadProgress && (
                    <div className="mt-4">
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${downloadProgress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

