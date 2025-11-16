import { NextRequest, NextResponse } from 'next/server'
import { TwitterDL } from 'twitter-downloader'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tweetId = searchParams.get('id')
  const fullUrl = searchParams.get('url')

  if (!tweetId && !fullUrl) {
    return NextResponse.json(
      { error: 'Tweet ID or URL is required' },
      { status: 400 }
    )
  }

  try {
    const tweetUrl = fullUrl || `https://twitter.com/i/status/${tweetId}`

    // Ensure URL is valid Twitter/X URL
    if (!tweetUrl.includes('twitter.com') && !tweetUrl.includes('x.com')) {
      throw new Error('URL Twitter/X tidak valid')
    }

    console.log('🔍 Using twitter-downloader to fetch Twitter media:', tweetUrl)

    // Use twitter-downloader library
    // Config is optional, but if provided, both authorization and cookie are required
    // So we only pass config if both are available, otherwise pass undefined
    let config: any = undefined

    if (process.env.TWITTER_AUTHORIZATION && process.env.TWITTER_COOKIE) {
      config = {
        authorization: process.env.TWITTER_AUTHORIZATION,
        cookie: process.env.TWITTER_COOKIE,
      }
    }

    const result = await TwitterDL(tweetUrl, config)

    if (result.status === 'error' || !result.result) {
      throw new Error(result.message || 'Gagal mengambil informasi media dari Twitter/X')
    }

    const mediaData = result.result
    const formats: Array<{
      quality: string
      url: string
      format: 'video' | 'audio' | 'image'
      size?: number
    }> = []

    // Process media array
    if (mediaData.media && Array.isArray(mediaData.media) && mediaData.media.length > 0) {
      mediaData.media.forEach((media: any, index: number) => {
        if (media.type === 'video' && media.videos && Array.isArray(media.videos)) {
          // Video media - add all quality options
          media.videos.forEach((video: any) => {
            if (video.url && typeof video.url === 'string') {
              formats.push({
                quality: video.quality || `Video ${video.bitrate || index + 1}`,
                url: String(video.url),
                format: 'video',
              })
            }
          })
        } else if (media.type === 'photo' && media.image) {
          // Image media
          const imageUrl = Array.isArray(media.image) ? media.image[0] : media.image
          if (imageUrl && typeof imageUrl === 'string') {
            formats.push({
              quality: `Image ${index + 1}`,
              url: String(imageUrl),
              format: 'image',
            })
          }
        } else if (media.image && typeof media.image === 'string') {
          // Fallback for image
          formats.push({
            quality: `Image ${index + 1}`,
            url: String(media.image),
            format: 'image',
          })
        }
      })
    }

    // If no formats found, try to extract from cover or expandedUrl
    if (formats.length === 0 && mediaData.media && Array.isArray(mediaData.media)) {
      mediaData.media.forEach((media: any) => {
        if (media.cover && typeof media.cover === 'string') {
          formats.push({
            quality: 'Cover',
            url: String(media.cover),
            format: 'image',
          })
        }
        if (media.expandedUrl && typeof media.expandedUrl === 'string') {
          formats.push({
            quality: 'Original',
            url: String(media.expandedUrl),
            format: media.type === 'video' ? 'video' : 'image',
          })
        }
      })
    }

    if (formats.length === 0) {
      throw new Error('Tidak ada format media yang tersedia. Tweet mungkin tidak memiliki media atau tidak dapat diakses secara publik.')
    }

    // Get thumbnail (use first image or video cover)
    let thumbnail = ''
    if (mediaData.media && Array.isArray(mediaData.media) && mediaData.media.length > 0) {
      const firstMedia = mediaData.media[0]
      if (firstMedia.cover && typeof firstMedia.cover === 'string') {
        thumbnail = String(firstMedia.cover)
      } else if (firstMedia.image && typeof firstMedia.image === 'string') {
        thumbnail = String(firstMedia.image)
      } else if (Array.isArray(firstMedia.image) && firstMedia.image.length > 0) {
        thumbnail = String(firstMedia.image[0])
      } else if (firstMedia.type === 'video' && firstMedia.videos && firstMedia.videos.length > 0) {
        // Use first video URL as thumbnail fallback
        thumbnail = String(firstMedia.videos[0].url || '')
      }
    }

    // Get title from description or author
    const title = mediaData.description ||
      (mediaData.author ? `${mediaData.author.username}'s Tweet` : 'Twitter Media') ||
      'Twitter Media'

    return NextResponse.json({
      title: String(title),
      thumbnail: thumbnail,
      type: formats.some(f => f.format === 'video') ? 'video' : 'image',
      formats,
    })
  } catch (error: any) {
    console.error('Twitter API error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch Twitter media info',
        note: 'Pastikan URL Twitter/X valid dan tweet dapat diakses secara publik.',
      },
      { status: 500 }
    )
  }
}

