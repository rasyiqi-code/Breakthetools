'use client'

import { useState, useEffect } from 'react'
import { Loader2, Download, PlayCircle, Music, Video, CheckCircle, Info } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface VideoInfo {
    title: string
    thumbnail: string
    author: string
    videoId: string
    fullUrl: string
}

interface FormatOption {
    id: string
    label: string
    format: string
    icon: React.ReactNode
    color: string
    category: 'audio' | 'video'
}

export function YouTubeDownloader() {
    const t = useTranslations('tools.youtubeDownloader')
    const [videoUrl, setVideoUrl] = useState('')
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [selectedFormat, setSelectedFormat] = useState<string | null>(null)
    const [downloadStatus, setDownloadStatus] = useState<'idle' | 'loading' | 'ready' | 'downloading'>('idle')
    const [statusMessage, setStatusMessage] = useState('')

    // Format options using Button API (Free)
    const formatOptions: FormatOption[] = [
        // Audio formats
        { id: 'mp3', label: 'MP3 Audio', format: 'mp3', icon: <Music className="w-5 h-5" />, color: 'bg-green-500 hover:bg-green-600', category: 'audio' },
        { id: 'm4a', label: 'M4A Audio', format: 'm4a', icon: <Music className="w-5 h-5" />, color: 'bg-green-600 hover:bg-green-700', category: 'audio' },
        { id: 'flac', label: 'FLAC Audio', format: 'flac', icon: <Music className="w-5 h-5" />, color: 'bg-green-700 hover:bg-green-800', category: 'audio' },
        { id: 'wav', label: 'WAV Audio', format: 'wav', icon: <Music className="w-5 h-5" />, color: 'bg-green-800 hover:bg-green-900', category: 'audio' },
        // Video formats
        { id: '360', label: 'MP4 360p', format: '360', icon: <Video className="w-5 h-5" />, color: 'bg-blue-500 hover:bg-blue-600', category: 'video' },
        { id: '480', label: 'MP4 480p', format: '480', icon: <Video className="w-5 h-5" />, color: 'bg-blue-600 hover:bg-blue-700', category: 'video' },
        { id: '720', label: 'MP4 720p', format: '720', icon: <Video className="w-5 h-5" />, color: 'bg-primary-500 hover:bg-primary-600', category: 'video' },
        { id: '1080', label: 'MP4 1080p', format: '1080', icon: <Video className="w-5 h-5" />, color: 'bg-primary-600 hover:bg-primary-700', category: 'video' },
        { id: '4k', label: 'MP4 4K', format: '4k', icon: <Video className="w-5 h-5" />, color: 'bg-purple-500 hover:bg-purple-600', category: 'video' },
    ]

    // Extract YouTube video ID from URL
    const extractVideoId = (url: string): string | null => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
        ]

        for (const pattern of patterns) {
            const match = url.match(pattern)
            if (match) {
                return match[1]
            }
        }
        return null
    }

    // Fetch video info from YouTube oEmbed API
    const fetchVideoInfo = async (videoId: string, fullUrl: string) => {
        try {
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(fullUrl)}&format=json`
            const response = await fetch(oembedUrl)

            if (!response.ok) {
                throw new Error(t('errors.fetchFailed'))
            }

            const data = await response.json()

            // Get higher quality thumbnail
            const thumbnail = data.thumbnail_url?.replace('hqdefault', 'maxresdefault') || data.thumbnail_url

            setVideoInfo({
                title: data.title,
                thumbnail: thumbnail,
                author: data.author_name,
                videoId,
                fullUrl
            })
            setError('')
        } catch (err: any) {
            setError(err.message || t('errors.fetchFailed'))
            setVideoInfo(null)
        }
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!videoUrl.trim()) {
            return
        }

        // Validate YouTube URL
        const videoId = extractVideoId(videoUrl.trim())
        if (!videoId) {
            setError(t('errors.invalidUrl'))
            return
        }

        // Construct full YouTube URL if needed
        let fullUrl = videoUrl.trim()
        if (!fullUrl.includes('youtube.com') && !fullUrl.includes('youtu.be')) {
            fullUrl = `https://www.youtube.com/watch?v=${videoId}`
        }

        // Ensure URL is properly formatted
        if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
            fullUrl = `https://${fullUrl}`
        }

        setIsLoading(true)
        setError('')
        setVideoInfo(null)

        await fetchVideoInfo(videoId, fullUrl)
        setIsLoading(false)
    }

    // Get Button API URL for a specific format
    const getButtonApiUrl = (format: string) => {
        if (!videoInfo) return ''

        const buttonUrl = new URL('https://p.savenow.to/api/button/')
        buttonUrl.searchParams.set('url', videoInfo.fullUrl)
        buttonUrl.searchParams.set('f', format)
        return buttonUrl.toString()
    }

    // Handle download - embed iframe directly in page
    const handleDownload = (format: string) => {
        const formatLabel = formatOptions.find(f => f.format === format)?.label || format
        setSelectedFormat(format)
        setDownloadStatus('loading')
        setStatusMessage(t('preparingDownload', { format: formatLabel }))
    }

    // Handle iframe load - detect when Button API is ready
    const handleIframeLoad = () => {
        if (selectedFormat && downloadStatus === 'loading') {
            setDownloadStatus('ready')
            const formatLabel = formatOptions.find(f => f.format === selectedFormat)?.label || selectedFormat
            setStatusMessage(t('downloadReady', { format: formatLabel }))
        }
    }

    // Reset status when format changes
    useEffect(() => {
        if (selectedFormat) {
            const formatLabel = formatOptions.find(f => f.format === selectedFormat)?.label || selectedFormat
            if (downloadStatus === 'idle') {
                setDownloadStatus('loading')
                setStatusMessage(t('preparingDownload', { format: formatLabel }))
            }
        } else {
            setDownloadStatus('idle')
            setStatusMessage('')
        }
    }, [selectedFormat, downloadStatus, t])

    return (
        <div className="max-w-full sm:max-w-4xl lg:max-w-6xl mx-auto w-full px-4">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('title')}</h1>
                <p className="text-sm sm:text-base text-neutral-600 mb-2">
                    {t('description')}
                </p>
            </div>

            {/* Custom URL Input Form */}
            <div className="tool-card p-4 sm:p-6 w-full mb-4 sm:mb-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <PlayCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                            <input
                                type="text"
                                value={videoUrl}
                                onChange={(e) => {
                                    setVideoUrl(e.target.value)
                                    setError('')
                                }}
                                placeholder={t('placeholder')}
                                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!videoUrl.trim() || isLoading}
                            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('loading')}
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    {t('searchVideo')}
                                </>
                            )}
                        </button>
                    </div>
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            {error}
                        </div>
                    )}
                </form>
            </div>

            {/* Video Info & Download Options */}
            {videoInfo && (
                <div className="tool-card p-4 sm:p-6 w-full">
                    {/* Video Info Card */}
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden mb-4 sm:mb-6">
                        <div className="flex flex-col md:flex-row">
                            {/* Thumbnail */}
                            <div className="w-full md:w-1/3 relative aspect-video md:aspect-auto">
                                <img
                                    src={videoInfo.thumbnail}
                                    alt={videoInfo.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 sm:p-4">
                                    <PlayCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                            </div>

                            {/* Video Details */}
                            <div className="w-full md:w-2/3 p-4 sm:p-6 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 mb-2 line-clamp-2">
                                        {videoInfo.title}
                                    </h2>
                                    <p className="text-sm sm:text-base text-neutral-600 mb-2">
                                        <span className="font-medium">{t('channel')}:</span> {videoInfo.author}
                                    </p>
                                    <p className="text-xs sm:text-sm text-neutral-500 break-all">
                                        {videoInfo.fullUrl}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Format Options */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Audio Formats */}
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-3 sm:mb-4 flex items-center gap-2">
                                <Music className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                                {t('audioFormats')}
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                                {formatOptions
                                    .filter(f => f.category === 'audio')
                                    .map((format) => (
                                        <button
                                            key={format.id}
                                            onClick={() => handleDownload(format.format)}
                                            className={`${format.color} text-white p-3 sm:p-4 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center gap-1.5 sm:gap-2 shadow-md min-h-[80px] sm:min-h-[100px] ${selectedFormat === format.format ? 'ring-2 sm:ring-4 ring-primary-300 ring-offset-1 sm:ring-offset-2' : ''
                                                }`}
                                        >
                                            {format.icon}
                                            <span className="text-xs sm:text-sm text-center">{format.label}</span>
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* Video Formats */}
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-3 sm:mb-4 flex items-center gap-2">
                                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                                {t('videoFormats')}
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                                {formatOptions
                                    .filter(f => f.category === 'video')
                                    .map((format) => (
                                        <button
                                            key={format.id}
                                            onClick={() => handleDownload(format.format)}
                                            className={`${format.color} text-white p-3 sm:p-4 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center gap-1.5 sm:gap-2 shadow-md min-h-[80px] sm:min-h-[100px] ${selectedFormat === format.format ? 'ring-2 sm:ring-4 ring-primary-300 ring-offset-1 sm:ring-offset-2' : ''
                                                }`}
                                        >
                                            {format.icon}
                                            <span className="text-xs sm:text-sm text-center">{format.label}</span>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Download Button API Iframe */}
                    {selectedFormat && videoInfo && (
                        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs sm:text-sm font-semibold text-neutral-700">
                                    {t('download')} {formatOptions.find(f => f.format === selectedFormat)?.label}
                                </h4>
                                <button
                                    onClick={() => {
                                        setSelectedFormat(null)
                                        setDownloadStatus('idle')
                                        setStatusMessage('')
                                    }}
                                    className="text-xs sm:text-sm text-neutral-500 hover:text-neutral-700 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                >
                                    {t('close')}
                                </button>
                            </div>

                            {/* Status Info */}
                            {statusMessage && (
                                <div className={`mb-4 p-3 rounded-lg flex items-start gap-3 ${downloadStatus === 'loading'
                                    ? 'bg-blue-50 border border-blue-200 text-blue-800'
                                    : downloadStatus === 'ready'
                                        ? 'bg-green-50 border border-green-200 text-green-800'
                                        : downloadStatus === 'downloading'
                                            ? 'bg-primary-50 border border-primary-200 text-primary-800'
                                            : 'bg-neutral-50 border border-neutral-200 text-neutral-800'
                                    }`}>
                                    <div className="flex-shrink-0 mt-0.5">
                                        {downloadStatus === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
                                        {downloadStatus === 'ready' && <CheckCircle className="w-5 h-5" />}
                                        {downloadStatus === 'downloading' && <Download className="w-5 h-5 animate-bounce" />}
                                        {downloadStatus === 'idle' && <Info className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{statusMessage}</p>
                                        {downloadStatus === 'ready' && (
                                            <p className="text-xs mt-1 opacity-75">
                                                {t('downloadReadyHint')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="bg-white rounded-lg overflow-hidden border border-neutral-200">
                                <iframe
                                    src={getButtonApiUrl(selectedFormat)}
                                    onLoad={handleIframeLoad}
                                    style={{
                                        width: '100%',
                                        height: '60px',
                                        border: 'none',
                                        display: 'block'
                                    }}
                                    scrolling="no"
                                />
                            </div>

                            {/* Additional Info */}
                            {downloadStatus === 'ready' && (
                                <div className="mt-3 text-xs text-neutral-500 text-center">
                                    <Info className="w-4 h-4 inline mr-1" />
                                    {t('downloadTroubleshoot')}
                                </div>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-neutral-500 mt-6 text-center">
                        {t('serviceInfo')}
                    </p>
                </div>
            )}

            {/* Empty state */}
            {!videoInfo && !isLoading && (
                <div className="tool-card p-12 w-full text-center">
                    <PlayCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                        {t('emptyState.title')}
                    </h3>
                    <p className="text-neutral-500">
                        {t('emptyState.description')}
                    </p>
                </div>
            )}
        </div>
    )
}
