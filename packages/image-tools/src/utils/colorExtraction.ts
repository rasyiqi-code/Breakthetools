// Color extraction utilities

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: h * 360, s, l }
}

export interface ExtractedColor {
  rgb: [number, number, number]
  count: number
}

/**
 * Extract dominant colors from image data
 */
export function extractDominantColors(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  numColors: number
): ExtractedColor[] {
  const colorMap = new Map<string, number>()

  // Count color frequencies with quantization
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    if (pixels[i + 3] < 128) continue // Skip transparent pixels

    // Quantize colors to reduce noise
    const qr = Math.floor(r / 16) * 16
    const qg = Math.floor(g / 16) * 16
    const qb = Math.floor(b / 16) * 16
    const key = `${qr},${qg},${qb}`
    colorMap.set(key, (colorMap.get(key) || 0) + 1)
  }

  // Convert to array and sort by frequency
  const colorArray: ExtractedColor[] = []
  colorMap.forEach((count, key) => {
    const [r, g, b] = key.split(',').map(Number)
    colorArray.push({ rgb: [r, g, b], count })
  })

  colorArray.sort((a, b) => b.count - a.count)

  return colorArray.slice(0, numColors)
}

/**
 * Resize image for performance
 */
export function resizeImageForAnalysis(
  img: HTMLImageElement,
  maxSize: number = 300
): { width: number; height: number } {
  let width = img.width
  let height = img.height
  
  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height)
    width = Math.floor(width * ratio)
    height = Math.floor(height * ratio)
  }
  
  return { width, height }
}

