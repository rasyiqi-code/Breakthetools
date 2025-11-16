import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore - ab-downloader doesn't have type definitions
import { igdl } from 'ab-downloader'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const postId = searchParams.get('id')
  const fullUrl = searchParams.get('url')

  if (!postId && !fullUrl) {
    return NextResponse.json(
      { error: 'Post ID or URL is required' },
      { status: 400 }
    )
  }

  try {
    const instagramUrl = fullUrl || `https://www.instagram.com/p/${postId}/`

    // Ensure URL is valid Instagram URL
    if (!instagramUrl.includes('instagram.com')) {
      throw new Error('URL Instagram tidak valid')
    }

    // Detect if URL is a Reel
    const isReel = instagramUrl.includes('/reel/') || instagramUrl.includes('/reels/')

    console.log('🔍 Using ab-downloader to fetch Instagram media:', instagramUrl, { isReel })

    // Use ab-downloader library
    // igdl returns an array of media items
    const result = await igdl(instagramUrl)

    // Check if result is error
    if (!Array.isArray(result) || (result.length > 0 && result[0].status === false)) {
      const errorMsg = Array.isArray(result) && result[0]?.message
        ? result[0].message
        : 'Gagal mengambil informasi media dari Instagram'
      throw new Error(errorMsg)
    }

    // If result is empty array
    if (!Array.isArray(result) || result.length === 0) {
      throw new Error('Tidak ada media yang ditemukan. Pastikan post dapat diakses secara publik.')
    }

    const formats: Array<{
      quality: string
      url: string
      format: 'video' | 'audio' | 'image'
      size?: number
    }> = []

    // Process media array from igdl
    // Each item has: { thumbnail, url, resolution, shouldRender, type }
    result.forEach((item: any, index: number) => {
      if (item.url && typeof item.url === 'string') {
        const itemUrl = String(item.url)

        // Skip thumbnail URLs for Reels (they usually contain 'scontent' and image extensions)
        if (isReel && itemUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && itemUrl.includes('scontent')) {
          console.log('⏭️ Skipping thumbnail for Reel:', itemUrl.substring(0, 100))
          return // Skip this item
        }

        // Determine format from multiple sources
        let isVideo = false

        // For Reels, default to video (unless it's clearly a thumbnail)
        if (isReel) {
          // If URL has image extension, it's likely a thumbnail, skip it
          if (!itemUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            isVideo = true
          }
        }
        // Check item properties
        else if (item.shouldRender === true) {
          isVideo = true
        }
        // Check item type
        else if (item.type === 'video' || item.type === 'Video') {
          isVideo = true
        }
        // Check URL patterns
        else if (itemUrl.includes('.mp4') ||
          itemUrl.includes('video') ||
          itemUrl.includes('video_manifest') ||
          itemUrl.match(/\.(mp4|webm|mov|avi)$/i)) {
          isVideo = true
        }
        // Check if URL doesn't contain image extensions
        else if (!itemUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          // If not a known image format, might be video
          isVideo = true
        }

        const quality = item.resolution
          ? `${item.resolution}${index > 0 ? ` (${index + 1})` : ''}`
          : `Media ${index + 1}`

        formats.push({
          quality: quality,
          url: itemUrl,
          format: isVideo ? 'video' : 'image',
        })

        console.log('📦 Processed media item:', {
          index,
          url: itemUrl.substring(0, 100),
          isVideo,
          shouldRender: item.shouldRender,
          type: item.type,
          resolution: item.resolution,
        })
      }
    })

    if (formats.length === 0) {
      throw new Error('Tidak ada format media yang tersedia. Post mungkin tidak memiliki media atau tidak dapat diakses secara publik.')
    }

    // Get thumbnail from first item
    const thumbnail = result[0]?.thumbnail && typeof result[0].thumbnail === 'string'
      ? String(result[0].thumbnail)
      : ''

    // Determine type based on formats or URL
    const hasVideo = formats.some(f => f.format === 'video')
    const type = isReel ? 'video' : (hasVideo ? 'video' : 'image')

    console.log('✅ Instagram API result:', {
      isReel,
      formatsCount: formats.length,
      videoFormats: formats.filter(f => f.format === 'video').length,
      imageFormats: formats.filter(f => f.format === 'image').length,
      type,
      hasThumbnail: !!thumbnail,
    })

    return NextResponse.json({
      title: 'Instagram Media',
      thumbnail: thumbnail,
      type: type,
      formats,
    })
  } catch (error: any) {
    console.error('Instagram API error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch Instagram media info',
        note: 'Pastikan URL Instagram valid dan post dapat diakses secara publik. Mendukung Posts, Stories, dan Reels.',
      },
      { status: 500 }
    )
  }
}

