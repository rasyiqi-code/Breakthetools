import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore - ab-downloader doesn't have type definitions
import { fbdown } from 'ab-downloader'

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
    // Determine URL format based on input
    let facebookUrl = fullUrl
    if (!facebookUrl && videoId) {
      // If we have an ID but no full URL, try to construct it
      // Check if it's a reel ID (usually longer) or regular video ID
      // For now, default to watch format, but ab-downloader should handle reel URLs
      facebookUrl = `https://www.facebook.com/watch/?v=${videoId}`
    }

    if (!facebookUrl) {
      throw new Error('URL Facebook tidak valid')
    }

    // Ensure URL is valid Facebook URL
    if (!facebookUrl.includes('facebook.com') && !facebookUrl.includes('fb.watch')) {
      throw new Error('URL Facebook tidak valid')
    }

    // Normalize reel URLs - ensure they're in the correct format
    if (facebookUrl.includes('/reel/')) {
      // Keep reel URL as is, ab-downloader should handle it
      facebookUrl = facebookUrl.split('?')[0] // Remove query params for consistency
    }

    console.log('🔍 Using ab-downloader to fetch Facebook video:', facebookUrl)

    // Try to get thumbnail from Facebook page first
    let thumbnail = ''
    let title = 'Facebook Video'
    const isReel = facebookUrl.includes('/reel/')

    try {
      const pageResponse = await fetch(facebookUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      })

      if (pageResponse.ok) {
        const html = await pageResponse.text()

        // Extract thumbnail from og:image - try multiple patterns
        const ogImagePatterns = [
          /property=["']og:image["']\s+content=["']([^"']+)["']/i,
          /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
          /<meta\s+name=["']og:image["']\s+content=["']([^"']+)["']/i,
          /"og:image":\s*"([^"]+)"/i,
          // For Reels, try additional patterns
          /<meta\s+property=["']og:image:url["']\s+content=["']([^"']+)["']/i,
          /"image":\s*"([^"]+)"/i,
        ]

        for (const pattern of ogImagePatterns) {
          const match = html.match(pattern)
          if (match && match[1]) {
            thumbnail = match[1].trim()
            // Decode HTML entities
            thumbnail = thumbnail.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
            if (thumbnail && thumbnail.startsWith('http')) {
              break
            }
          }
        }

        // For Reels, try to extract from video poster or preview
        if (!thumbnail && isReel) {
          // Try to find video poster attribute
          const videoPosterMatch = html.match(/<video[^>]*poster=["']([^"']+)["']/i)
          if (videoPosterMatch && videoPosterMatch[1]) {
            thumbnail = videoPosterMatch[1].trim()
          }

          // Try to find in data attributes
          if (!thumbnail) {
            const dataImageMatch = html.match(/data-image=["']([^"']+)["']/i) ||
              html.match(/data-src=["']([^"']+\.(jpg|jpeg|png|webp))["']/i)
            if (dataImageMatch && dataImageMatch[1]) {
              thumbnail = dataImageMatch[1].trim()
            }
          }
        }

        // Also try to extract from JSON-LD
        if (!thumbnail) {
          const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
          if (jsonLdMatch) {
            try {
              const jsonLd = JSON.parse(jsonLdMatch[1])
              if (jsonLd.image && typeof jsonLd.image === 'string') {
                thumbnail = jsonLd.image
              } else if (jsonLd.image && Array.isArray(jsonLd.image) && jsonLd.image.length > 0) {
                thumbnail = jsonLd.image[0]
              } else if (jsonLd.thumbnailUrl) {
                thumbnail = jsonLd.thumbnailUrl
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        }

        // Try to extract from Facebook's internal data structures (for Reels)
        if (!thumbnail && isReel) {
          // Look for __d("image") or similar patterns in script tags
          const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi)
          if (scriptMatches) {
            for (const script of scriptMatches) {
              // Try to find image URLs in the script
              const imageUrlMatch = script.match(/https?:\/\/[^"'\s]+\.(jpg|jpeg|png|webp)/i)
              if (imageUrlMatch && imageUrlMatch[0] && imageUrlMatch[0].includes('scontent')) {
                thumbnail = imageUrlMatch[0]
                break
              }
            }
          }
        }

        // For Reels, extract description/caption instead of title
        if (isReel) {
          // Try to extract description from og:description first
          const ogDescPatterns = [
            /property=["']og:description["']\s+content=["']([^"']+)["']/i,
            /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i,
            /<meta\s+name=["']og:description["']\s+content=["']([^"']+)["']/i,
            /"og:description":\s*"([^"]+)"/i,
          ]

          for (const pattern of ogDescPatterns) {
            const match = html.match(pattern)
            if (match && match[1]) {
              let desc = match[1].trim()
              // Decode HTML entities
              desc = desc.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
              if (desc && desc.length > 5 && desc !== 'Facebook' && !desc.includes('Facebook Video')) {
                title = desc
                break
              }
            }
          }

          // Try to extract from meta description
          if (!title || title === 'Facebook Video' || title === 'Facebook') {
            const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
            if (metaDescMatch && metaDescMatch[1]) {
              let desc = metaDescMatch[1].trim()
              desc = desc.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
              if (desc && desc.length > 5 && desc !== 'Facebook' && !desc.includes('Facebook Video')) {
                title = desc
              }
            }
          }

          // Try to extract from JSON-LD
          if (!title || title === 'Facebook Video' || title === 'Facebook') {
            const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
            if (jsonLdMatch) {
              try {
                const jsonLd = JSON.parse(jsonLdMatch[1])
                if (jsonLd.description && typeof jsonLd.description === 'string') {
                  const desc = jsonLd.description.trim()
                  if (desc && desc.length > 5) {
                    title = desc
                  }
                } else if (jsonLd.caption && typeof jsonLd.caption === 'string') {
                  const caption = jsonLd.caption.trim()
                  if (caption && caption.length > 5) {
                    title = caption
                  }
                }
              } catch (e) {
                // Ignore JSON parse errors
              }
            }
          }

          // Try to extract from script tags (Facebook's internal data)
          if (!title || title === 'Facebook Video' || title === 'Facebook') {
            const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi)
            if (scriptMatches) {
              for (const script of scriptMatches) {
                // Try to find description/caption in various formats
                const descPatterns = [
                  /"description":\s*"([^"]{10,500})"/i,
                  /"caption":\s*"([^"]{10,500})"/i,
                  /"text":\s*"([^"]{10,500})"/i,
                  /"content":\s*"([^"]{10,500})"/i,
                  /__d\("description",\s*"([^"]{10,500})"/i,
                  /__d\("caption",\s*"([^"]{10,500})"/i,
                ]

                for (const pattern of descPatterns) {
                  const match = script.match(pattern)
                  if (match && match[1]) {
                    let extractedDesc = match[1].trim()
                    // Filter out generic descriptions
                    if (extractedDesc &&
                      extractedDesc !== 'Facebook' &&
                      extractedDesc !== 'Facebook Video' &&
                      !extractedDesc.match(/^Facebook\s*[-|]/i) &&
                      extractedDesc.length > 5 &&
                      extractedDesc.length < 500) {
                      title = extractedDesc
                      break
                    }
                  }
                }
                if (title && title !== 'Facebook Video' && title !== 'Facebook') {
                  break
                }
              }
            }
          }
        } else {
          // For regular videos, extract title
          const ogTitlePatterns = [
            /property=["']og:title["']\s+content=["']([^"']+)["']/i,
            /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i,
            /<meta\s+name=["']og:title["']\s+content=["']([^"']+)["']/i,
            /"og:title":\s*"([^"]+)"/i,
          ]

          for (const pattern of ogTitlePatterns) {
            const match = html.match(pattern)
            if (match && match[1]) {
              title = match[1].trim()
              // Decode HTML entities
              title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
              if (title && title !== 'Facebook' && !title.includes('Facebook Video')) {
                break
              }
            }
          }

          // Try alternative title patterns for regular videos
          if (!title || title === 'Facebook Video' || title === 'Facebook') {
            const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
            if (titleMatch && titleMatch[1]) {
              let extractedTitle = titleMatch[1].trim()
              extractedTitle = extractedTitle.replace(/\s*[-|]\s*Facebook$/, '')
              extractedTitle = extractedTitle.replace(/\s*[-|]\s*Facebook Video$/, '')
              if (extractedTitle && extractedTitle !== 'Facebook' && extractedTitle !== 'Facebook Video') {
                title = extractedTitle
              }
            }
          }
        }

        console.log('📸 Thumbnail extraction result:', {
          isReel,
          hasThumbnail: !!thumbnail,
          thumbnailLength: thumbnail.length,
          thumbnailPreview: thumbnail.substring(0, 100),
          title,
        })
      }
    } catch (pageError) {
      console.warn('Failed to fetch Facebook page for thumbnail:', pageError)
      // Continue with ab-downloader even if page fetch fails
    }

    // Use ab-downloader library
    const result = await fbdown(facebookUrl)

    if (result.status === false || !result) {
      throw new Error(result.message || 'Gagal mengambil informasi video dari Facebook')
    }

    // Check if ab-downloader returned a thumbnail
    if (!thumbnail && result.thumbnail && typeof result.thumbnail === 'string') {
      thumbnail = result.thumbnail
      console.log('📸 Using thumbnail from ab-downloader:', thumbnail.substring(0, 100))
    } else if (!thumbnail && result.cover && typeof result.cover === 'string') {
      thumbnail = result.cover
      console.log('📸 Using cover from ab-downloader:', thumbnail.substring(0, 100))
    } else if (!thumbnail && result.image && typeof result.image === 'string') {
      thumbnail = result.image
      console.log('📸 Using image from ab-downloader:', thumbnail.substring(0, 100))
    }

    // Check if ab-downloader returned a title/description
    if (isReel) {
      // For Reels, prioritize description/caption
      if ((!title || title === 'Facebook Video' || title === 'Facebook') && result.description && typeof result.description === 'string') {
        const desc = result.description.trim()
        if (desc.length > 5) {
          title = desc
          console.log('📝 Using description from ab-downloader for Reel:', title.substring(0, 100))
        }
      } else if ((!title || title === 'Facebook Video' || title === 'Facebook') && result.caption && typeof result.caption === 'string') {
        const caption = result.caption.trim()
        if (caption.length > 5) {
          title = caption
          console.log('📝 Using caption from ab-downloader for Reel:', title.substring(0, 100))
        }
      } else if ((!title || title === 'Facebook Video' || title === 'Facebook') && result.text && typeof result.text === 'string') {
        const text = result.text.trim()
        if (text.length > 5) {
          title = text
          console.log('📝 Using text from ab-downloader for Reel:', title.substring(0, 100))
        }
      }
    } else {
      // For regular videos, use title/name
      if ((!title || title === 'Facebook Video' || title === 'Facebook') && result.title && typeof result.title === 'string') {
        title = result.title.trim()
        console.log('📝 Using title from ab-downloader:', title)
      } else if ((!title || title === 'Facebook Video' || title === 'Facebook') && result.name && typeof result.name === 'string') {
        title = result.name.trim()
        console.log('📝 Using name from ab-downloader:', title)
      }
    }

    const formats: Array<{
      quality: string
      url: string
      format: 'video' | 'audio' | 'image'
      size?: number
    }> = []

    // Process video URLs from result
    // fbdown returns: { Normal_video, HD }
    if (result.HD && typeof result.HD === 'string') {
      formats.push({
        quality: 'HD',
        url: String(result.HD),
        format: 'video',
      })
    }

    if (result.Normal_video && typeof result.Normal_video === 'string') {
      formats.push({
        quality: 'Normal',
        url: String(result.Normal_video),
        format: 'video',
      })
    }

    // If HD is not a string, it might be an object with URL
    if (result.HD && typeof result.HD === 'object' && result.HD.url) {
      formats.push({
        quality: 'HD',
        url: String(result.HD.url),
        format: 'video',
      })
    }

    if (result.Normal_video && typeof result.Normal_video === 'object' && result.Normal_video.url) {
      formats.push({
        quality: 'Normal',
        url: String(result.Normal_video.url),
        format: 'video',
      })
    }

    if (formats.length === 0) {
      throw new Error('Tidak ada format video yang tersedia. Video mungkin tidak dapat diakses secara publik.')
    }

    // Log thumbnail info for debugging
    console.log('📸 Final thumbnail result:', {
      isReel,
      hasThumbnail: !!thumbnail,
      thumbnailLength: thumbnail.length,
      thumbnailPreview: thumbnail ? thumbnail.substring(0, 100) : 'N/A',
      title,
    })

    return NextResponse.json({
      title: title,
      thumbnail: thumbnail || '', // Ensure it's always a string
      type: 'video',
      formats,
    })
  } catch (error: any) {
    console.error('Facebook API error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch Facebook video info',
        note: 'Pastikan URL Facebook valid dan video dapat diakses secara publik.',
      },
      { status: 500 }
    )
  }
}

