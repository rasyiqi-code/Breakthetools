export interface ParsedUrl {
    platform: string
    id?: string
    playlistId?: string
    isValid: boolean
    type?: 'video' | 'playlist' | 'photo' | 'reel' | 'story' | 'tweet' | 'direct'
}

export function parseYouTubeUrl(url: string): ParsedUrl {
    const patterns = [
        // Regular video: https://www.youtube.com/watch?v=VIDEO_ID
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        // Playlist: https://www.youtube.com/playlist?list=PLAYLIST_ID
        /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
        // Video with playlist: https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID
        /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11}).*list=([a-zA-Z0-9_-]+)/,
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) {
            if (match[2]) {
                // Has playlist
                return {
                    platform: 'youtube',
                    id: match[1],
                    playlistId: match[2],
                    isValid: true,
                    type: 'playlist',
                }
            } else if (url.includes('playlist')) {
                return {
                    platform: 'youtube',
                    playlistId: match[1],
                    isValid: true,
                    type: 'playlist',
                }
            } else {
                return {
                    platform: 'youtube',
                    id: match[1],
                    isValid: true,
                    type: 'video',
                }
            }
        }
    }

    return { platform: 'youtube', isValid: false }
}

export function parseInstagramUrl(url: string): ParsedUrl {
    const patterns = [
        // Post: https://www.instagram.com/p/POST_ID/
        /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
        // Reel: https://www.instagram.com/reel/REEL_ID/ (singular)
        /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
        // Reels: https://www.instagram.com/reels/REEL_ID/ (plural)
        /instagram\.com\/reels\/([a-zA-Z0-9_-]+)/,
        // Story: https://www.instagram.com/stories/USERNAME/STORY_ID/
        /instagram\.com\/stories\/[^/]+\/([0-9]+)/,
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) {
            if (url.includes('/reel/') || url.includes('/reels/')) {
                return {
                    platform: 'instagram',
                    id: match[1],
                    isValid: true,
                    type: 'reel',
                }
            } else if (url.includes('/stories/')) {
                return {
                    platform: 'instagram',
                    id: match[1],
                    isValid: true,
                    type: 'story',
                }
            } else {
                return {
                    platform: 'instagram',
                    id: match[1],
                    isValid: true,
                    type: 'photo',
                }
            }
        }
    }

    return { platform: 'instagram', isValid: false }
}

export function parseTwitterUrl(url: string): ParsedUrl {
    const pattern = /(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/
    const match = url.match(pattern)

    if (match) {
        return {
            platform: 'twitter',
            id: match[2],
            isValid: true,
            type: 'tweet',
        }
    }

    return { platform: 'twitter', isValid: false }
}

export function parseTikTokUrl(url: string): ParsedUrl {
    const patterns = [
        // Regular: https://www.tiktok.com/@username/video/VIDEO_ID
        /tiktok\.com\/@[^/]+\/video\/(\d+)/,
        // Short: https://vm.tiktok.com/CODE
        /vm\.tiktok\.com\/([a-zA-Z0-9]+)/,
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) {
            return {
                platform: 'tiktok',
                id: match[1],
                isValid: true,
                type: 'video',
            }
        }
    }

    return { platform: 'tiktok', isValid: false }
}

export function parseFacebookUrl(url: string): ParsedUrl {
    const patterns = [
        // Reel: https://www.facebook.com/reel/REEL_ID
        /facebook\.com\/reel\/(\d+)/,
        // Reel: https://m.facebook.com/reel/REEL_ID
        /m\.facebook\.com\/reel\/(\d+)/,
        // Video: https://www.facebook.com/watch/?v=VIDEO_ID (dengan slash)
        /facebook\.com\/watch\/\?v=(\d+)/,
        // Video: https://www.facebook.com/watch?v=VIDEO_ID (tanpa slash)
        /facebook\.com\/watch\?v=(\d+)/,
        // Video: https://www.facebook.com/username/videos/VIDEO_ID/
        /facebook\.com\/[^/]+\/videos\/(\d+)/,
        // Video: https://m.facebook.com/watch/?v=VIDEO_ID
        /m\.facebook\.com\/watch\/\?v=(\d+)/,
        // Video: https://m.facebook.com/watch?v=VIDEO_ID
        /m\.facebook\.com\/watch\?v=(\d+)/,
        // Video: https://www.facebook.com/video.php?v=VIDEO_ID
        /facebook\.com\/video\.php\?v=(\d+)/,
        // Post: https://www.facebook.com/username/posts/POST_ID
        /facebook\.com\/[^/]+\/posts\/(\d+)/,
        // fb.watch: https://fb.watch/CODE
        /fb\.watch\/([a-zA-Z0-9_-]+)/,
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) {
            // Determine type based on URL pattern
            const isReel = url.includes('/reel/')
            return {
                platform: 'facebook',
                id: match[1],
                isValid: true,
                type: isReel ? 'reel' : 'video',
            }
        }
    }

    return { platform: 'facebook', isValid: false }
}

export function parseUrl(url: string): ParsedUrl {
    if (!url || typeof url !== 'string') {
        return { platform: 'unknown', isValid: false }
    }

    const normalizedUrl = url.trim().toLowerCase()

    if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
        return parseYouTubeUrl(url)
    }

    if (normalizedUrl.includes('instagram.com')) {
        return parseInstagramUrl(url)
    }

    if (normalizedUrl.includes('twitter.com') || normalizedUrl.includes('x.com')) {
        return parseTwitterUrl(url)
    }

    if (normalizedUrl.includes('tiktok.com')) {
        return parseTikTokUrl(url)
    }

    if (normalizedUrl.includes('facebook.com') || normalizedUrl.includes('fb.')) {
        return parseFacebookUrl(url)
    }

    // Direct media URL
    if (
        normalizedUrl.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|avi|mp3|wav|ogg)$/i) ||
        normalizedUrl.startsWith('data:') ||
        normalizedUrl.startsWith('blob:')
    ) {
        return {
            platform: 'direct',
            isValid: true,
            type: 'direct',
        }
    }

    return { platform: 'unknown', isValid: false }
}

