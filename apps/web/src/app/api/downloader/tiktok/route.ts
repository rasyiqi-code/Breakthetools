import { NextRequest, NextResponse } from 'next/server'
import TiktokDownloader from '@tobyg74/tiktok-api-dl'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const videoId = searchParams.get('id')
  const fullUrl = searchParams.get('url')

  if (!videoId && !fullUrl) {
    return NextResponse.json(
      { error: 'Video ID or URL is required' },
      { status: 400 }
    )
  }

  try {
    const tiktokUrl = fullUrl || `https://www.tiktok.com/@user/video/${videoId}`

    // Use @tobyg74/tiktok-api-dl library for reliable extraction
    console.log('🔍 Using @tobyg74/tiktok-api-dl to fetch TikTok video:', tiktokUrl)

    const formats: Array<{
      quality: string
      url: string
      format: 'video' | 'audio' | 'image'
      size?: number
    }> = []

    let videoUrl = ''
    let thumbnail = ''
    let title = 'TikTok Video'
    let audioUrl = ''

    // Try v1 (TiktokAPI) first
    let result: any = await TiktokDownloader.Downloader(tiktokUrl, { version: 'v1' })

    if (result.status === 'success' && result.result) {
      const videoData = result.result
      // v1 structure: video.downloadAddr or video.playAddr
      if (videoData.video?.downloadAddr) {
        videoUrl = Array.isArray(videoData.video.downloadAddr)
          ? videoData.video.downloadAddr[0]
          : String(videoData.video.downloadAddr)
      } else if (videoData.video?.playAddr) {
        videoUrl = Array.isArray(videoData.video.playAddr)
          ? videoData.video.playAddr[0]
          : String(videoData.video.playAddr)
      }
      thumbnail = videoData.video?.cover || videoData.video?.originCover || videoData.video?.dynamicCover || ''
      title = videoData.desc || videoData.author?.nickname || 'TikTok Video'
      if (videoData.music?.playUrl && Array.isArray(videoData.music.playUrl) && videoData.music.playUrl.length > 0) {
        audioUrl = String(videoData.music.playUrl[0])
      }
    }

    // If v1 fails, try v2 (SSSTik)
    if (!videoUrl && result.status === 'error') {
      console.log('⚠️ v1 failed, trying v2...')
      result = await TiktokDownloader.Downloader(tiktokUrl, { version: 'v2' })

      if (result.status === 'success' && result.result) {
        const videoData = result.result
        // v2 structure: video.playAddr (array) or direct
        if (videoData.video?.playAddr && Array.isArray(videoData.video.playAddr) && videoData.video.playAddr.length > 0) {
          videoUrl = String(videoData.video.playAddr[0])
        } else if (videoData.direct) {
          videoUrl = Array.isArray(videoData.direct) ? String(videoData.direct[0]) : String(videoData.direct)
        }
        title = videoData.desc || videoData.author?.nickname || 'TikTok Video'
        if (videoData.music?.playUrl && Array.isArray(videoData.music.playUrl) && videoData.music.playUrl.length > 0) {
          audioUrl = String(videoData.music.playUrl[0])
        }
      }
    }

    // If v2 also fails, try v3 (MusicalDown)
    if (!videoUrl && result.status === 'error') {
      console.log('⚠️ v2 failed, trying v3...')
      result = await TiktokDownloader.Downloader(tiktokUrl, { version: 'v3' })

      if (result.status === 'success' && result.result) {
        const videoData = result.result
        // v3 structure: videoHD, videoSD, or videoWatermark
        const v3Url = videoData.videoHD || videoData.videoSD || videoData.videoWatermark || ''
        videoUrl = Array.isArray(v3Url) ? String(v3Url[0]) : String(v3Url)
        title = videoData.desc || videoData.author?.nickname || 'TikTok Video'
        if (videoData.music) {
          if (typeof videoData.music === 'string') {
            audioUrl = videoData.music
          } else if (Array.isArray(videoData.music) && videoData.music.length > 0) {
            audioUrl = String(videoData.music[0])
          }
        }
      }
    }

    // Ensure videoUrl is a string
    if (!videoUrl || typeof videoUrl !== 'string') {
      throw new Error(result.message || 'Tidak ada format video yang tersedia')
    }

    // Ensure audioUrl is a string if provided
    if (audioUrl && typeof audioUrl !== 'string') {
      audioUrl = String(audioUrl)
    }

    // Add video format
    formats.push({
      quality: 'Original',
      url: String(videoUrl),
      format: 'video',
    })

    // Add audio option
    if (audioUrl && typeof audioUrl === 'string') {
      formats.push({
        quality: 'Audio Only',
        url: String(audioUrl),
        format: 'audio',
      })
    } else {
      // Use video URL for audio extraction
      formats.push({
        quality: 'Audio Only',
        url: String(videoUrl),
        format: 'audio',
      })
    }

    return NextResponse.json({
      title: title,
      thumbnail: thumbnail,
      type: 'video',
      formats,
    })
  } catch (error: any) {
    console.error('TikTok API error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch TikTok video info',
        note: 'Pastikan URL TikTok valid dan video dapat diakses secara publik.',
      },
      { status: 500 }
    )
  }
}

