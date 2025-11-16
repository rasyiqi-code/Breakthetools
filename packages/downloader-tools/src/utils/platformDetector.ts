export type Platform =
    | 'youtube'
    | 'instagram'
    | 'twitter'
    | 'tiktok'
    | 'facebook'
    | 'direct'
    | 'unknown'

export interface PlatformInfo {
    platform: Platform
    name: string
    icon: string
}

export function detectPlatform(url: string): PlatformInfo {
    if (!url || typeof url !== 'string') {
        return { platform: 'unknown', name: 'Unknown', icon: '🌐' }
    }

    const normalizedUrl = url.trim().toLowerCase()

    // YouTube
    if (
        normalizedUrl.includes('youtube.com') ||
        normalizedUrl.includes('youtu.be') ||
        normalizedUrl.includes('m.youtube.com')
    ) {
        return { platform: 'youtube', name: 'YouTube', icon: '▶️' }
    }

    // Instagram
    if (
        normalizedUrl.includes('instagram.com') ||
        normalizedUrl.includes('instagr.am')
    ) {
        return { platform: 'instagram', name: 'Instagram', icon: '📷' }
    }

    // Twitter/X
    if (
        normalizedUrl.includes('twitter.com') ||
        normalizedUrl.includes('x.com') ||
        normalizedUrl.includes('t.co')
    ) {
        return { platform: 'twitter', name: 'Twitter/X', icon: '🐦' }
    }

    // TikTok
    if (
        normalizedUrl.includes('tiktok.com') ||
        normalizedUrl.includes('vm.tiktok.com')
    ) {
        return { platform: 'tiktok', name: 'TikTok', icon: '🎵' }
    }

    // Facebook
    if (
        normalizedUrl.includes('facebook.com') ||
        normalizedUrl.includes('fb.com') ||
        normalizedUrl.includes('fb.watch')
    ) {
        return { platform: 'facebook', name: 'Facebook', icon: '👤' }
    }

    // Direct media URLs
    if (
        normalizedUrl.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|avi|mp3|wav|ogg)$/i) ||
        normalizedUrl.startsWith('data:image/') ||
        normalizedUrl.startsWith('data:video/') ||
        normalizedUrl.startsWith('blob:')
    ) {
        return { platform: 'direct', name: 'Direct Media', icon: '📎' }
    }

    return { platform: 'unknown', name: 'Unknown', icon: '🌐' }
}

export function isValidUrl(url: string): boolean {
    try {
        const urlObj = new URL(url)
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
        return false
    }
}

