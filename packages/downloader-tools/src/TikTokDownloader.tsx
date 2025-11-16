'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, Loader2, Video, Music, AlertCircle } from 'lucide-react'
import { parseTikTokUrl, type ParsedUrl } from './utils/urlParser'
import { downloadFile, sanitizeFilename, getFileExtension, type DownloadProgress } from './utils/downloader'

interface MediaInfo {
    title?: string
    thumbnail?: string
    duration?: number
    formats?: Array<{
        quality: string
        url: string
        format: 'video' | 'audio' | 'image'
        size?: number
    }>
    type: 'video' | 'audio' | 'image'
    note?: string
}

export function TikTokDownloader() {
    const [url, setUrl] = useState('')
    const [parsedUrl, setParsedUrl] = useState<ParsedUrl | null>(null)
    const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [selectedFormat, setSelectedFormat] = useState<'video' | 'audio'>('video')
    const [selectedQuality, setSelectedQuality] = useState<string>('')
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
    const [isDownloading, setIsDownloading] = useState(false)

    useEffect(() => {
        if (url.trim()) {
            const parsed = parseTikTokUrl(url)
            setParsedUrl(parsed)
            if (!parsed.isValid) {
                setError('URL TikTok tidak valid')
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
            const apiUrl = `/api/downloader/tiktok?id=${parsedUrl.id || ''}&url=${encodeURIComponent(url)}`
            const response = await fetch(apiUrl)

            if (response.ok) {
                const data = await response.json()
                if (data.error || data.note) {
                    throw new Error(data.error || data.note || 'Gagal mengambil informasi video')
                }
                if (!data.formats || data.formats.length === 0) {
                    throw new Error('Tidak ada format video yang tersedia. Video mungkin tidak dapat diakses secara publik.')
                }
                setMediaInfo(data)

                if (data.formats && data.formats.length > 0) {
                    const videoFormats = data.formats.filter((f: any) => f.format === 'video')
                    const audioFormats = data.formats.filter((f: any) => f.format === 'audio')

                    if (videoFormats.length > 0) {
                        setSelectedFormat('video')
                        setSelectedQuality(videoFormats[0].quality)
                    } else if (audioFormats.length > 0) {
                        setSelectedFormat('audio')
                        setSelectedQuality(audioFormats[0].quality)
                    } else {
                        setSelectedQuality(data.formats[0].quality)
                    }
                }
            } else {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || 'Gagal mengambil informasi video')
            }
        } catch (err: any) {
            setError(err.message || 'Gagal mengambil informasi video dari TikTok')
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
                (f) => f.quality === selectedQuality && f.format === selectedFormat
            )

            if (!format || !format.url) {
                throw new Error('Format tidak ditemukan atau URL tidak valid')
            }

            const extension = selectedFormat === 'audio' ? 'mp3' : getFileExtension(format.url) || 'mp4'
            const filename = sanitizeFilename(
                `${mediaInfo.title || 'tiktok-video'}.${extension}`
            )

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
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">TikTok Downloader</h1>
                <p className="text-sm sm:text-base text-neutral-600 mb-2">Download video dan audio dari TikTok</p>
            </div>

            <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
                <label className="text-sm font-medium text-neutral-700 mb-3 block">
                    Masukkan URL TikTok
                </label>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.tiktok.com/@username/video/..."
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
                            {mediaInfo.thumbnail && (
                                <div className="relative rounded-lg overflow-hidden border border-neutral-200">
                                    <img
                                        src={mediaInfo.thumbnail}
                                        alt={mediaInfo.title || 'Video preview'}
                                        className="w-full h-auto"
                                    />
                                </div>
                            )}
                            <div>
                                {mediaInfo.title && (
                                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">
                                        {mediaInfo.title}
                                    </h3>
                                )}
                            </div>
                        </div>
                    </div>

                    {mediaInfo.formats && mediaInfo.formats.length > 0 && (
                        <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
                            <h2 className="text-base sm:text-lg font-semibold text-neutral-900 mb-3 sm:mb-4">Pilihan Format</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                        Format
                                    </label>
                                    <div className="flex gap-2">
                                        {['video', 'audio'].map((format) => {
                                            const hasFormat = mediaInfo.formats?.some((f) => f.format === format)
                                            if (!hasFormat) return null

                                            return (
                                                <button
                                                    key={format}
                                                    onClick={() => {
                                                        setSelectedFormat(format as 'video' | 'audio')
                                                        const formatOptions = mediaInfo.formats?.filter(
                                                            (f) => f.format === format
                                                        )
                                                        if (formatOptions && formatOptions.length > 0) {
                                                            setSelectedQuality(formatOptions[0].quality)
                                                        }
                                                    }}
                                                    className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px] ${selectedFormat === format
                                                        ? 'bg-primary-600 text-white'
                                                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                                        }`}
                                                >
                                                    {format === 'video' && <Video className="w-4 h-4" />}
                                                    {format === 'audio' && <Music className="w-4 h-4" />}
                                                    <span className="text-sm sm:text-base">{format.charAt(0).toUpperCase() + format.slice(1)}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                        Kualitas
                                    </label>
                                    <select
                                        value={selectedQuality}
                                        onChange={(e) => setSelectedQuality(e.target.value)}
                                        className="w-full px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                                    >
                                        {mediaInfo.formats
                                            ?.filter((f) => f.format === selectedFormat)
                                            .map((format) => (
                                                <option key={format.quality} value={format.quality}>
                                                    {format.quality} {format.size ? `(${formatSize(format.size)})` : ''}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="tool-card p-4 sm:p-6">
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
                                    <span className="text-sm sm:text-base">Download {selectedFormat === 'audio' ? 'Audio' : 'Video'}</span>
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
                </>
            )}
        </div>
    )
}

