// Background removal algorithms

import {
    floodFill,
    getCornerColor,
    getEdgeStrength,
    colorDistance,
    calculateSaliency,
    detectObjectRegion,
    erode,
    dilate,
    refineEdges,
    type Color
} from './backgroundRemovalUtils'

/**
 * Remove background berdasarkan warna spesifik dengan flood fill
 */
export function removeByColor(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    targetColor: Color,
    tolerance: number
): void {
    const visited = new Array(width * height).fill(false)
    const toRemove = new Set<number>()

    // Start flood fill from edges
    for (let x = 0; x < width; x++) {
        // Top edge
        const removed1 = floodFill(pixels, width, height, x, 0, targetColor, tolerance, visited)
        removed1.forEach(idx => toRemove.add(idx))

        // Bottom edge
        const removed2 = floodFill(pixels, width, height, x, height - 1, targetColor, tolerance, visited)
        removed2.forEach(idx => toRemove.add(idx))
    }

    for (let y = 0; y < height; y++) {
        // Left edge
        const removed1 = floodFill(pixels, width, height, 0, y, targetColor, tolerance, visited)
        removed1.forEach(idx => toRemove.add(idx))

        // Right edge
        const removed2 = floodFill(pixels, width, height, width - 1, y, targetColor, tolerance, visited)
        removed2.forEach(idx => toRemove.add(idx))
    }

    // Apply removal
    toRemove.forEach(idx => {
        pixels[idx + 3] = 0
    })
}

/**
 * Remove background dengan edge detection yang cerdas dan morphological operations
 */
export function removeByEdge(
    pixels: Uint8ClampedArray,
    width: number,
    height: number
): void {
    const cornerColor = getCornerColor(pixels, width, height)
    const edgeThreshold = 25
    const colorTolerance = 50

    // First pass: mark edges dengan threshold yang lebih sensitif
    const isEdge = new Array(width * height).fill(false)
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const strength = getEdgeStrength(pixels, width, height, x, y)
            if (strength > edgeThreshold) {
                isEdge[y * width + x] = true
            }
        }
    }

    // Second pass: remove non-edge areas similar to corners
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4
            const visitIdx = y * width + x

            if (!isEdge[visitIdx]) {
                const pixelColor: Color = {
                    r: pixels[idx],
                    g: pixels[idx + 1],
                    b: pixels[idx + 2]
                }

                const distance = colorDistance(pixelColor, cornerColor)

                if (distance <= colorTolerance) {
                    pixels[idx + 3] = 0
                }
            }
        }
    }

    // Third pass: flood fill from edges untuk menghapus background yang terhubung
    const visited = new Array(width * height).fill(false)
    for (let x = 0; x < width; x++) {
        floodFill(pixels, width, height, x, 0, cornerColor, colorTolerance + 10, visited).forEach(idx => {
            pixels[idx + 3] = 0
        })
        floodFill(pixels, width, height, x, height - 1, cornerColor, colorTolerance + 10, visited).forEach(idx => {
            pixels[idx + 3] = 0
        })
    }
    for (let y = 0; y < height; y++) {
        floodFill(pixels, width, height, 0, y, cornerColor, colorTolerance + 10, visited).forEach(idx => {
            pixels[idx + 3] = 0
        })
        floodFill(pixels, width, height, width - 1, y, cornerColor, colorTolerance + 10, visited).forEach(idx => {
            pixels[idx + 3] = 0
        })
    }

    // Fourth pass: Cleanup isolated background pixels
    for (let pass = 0; pass < 2; pass++) {
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4
                if (pixels[idx + 3] === 0) continue

                let transparentNeighbors = 0
                const neighbors = [
                    pixels[((y - 1) * width + x) * 4 + 3],
                    pixels[((y + 1) * width + x) * 4 + 3],
                    pixels[(y * width + (x - 1)) * 4 + 3],
                    pixels[(y * width + (x + 1)) * 4 + 3]
                ]
                transparentNeighbors = neighbors.filter(a => a === 0).length

                if (transparentNeighbors >= 3) {
                    const pixelColor: Color = {
                        r: pixels[idx],
                        g: pixels[idx + 1],
                        b: pixels[idx + 2]
                    }
                    const distance = colorDistance(pixelColor, cornerColor)
                    if (distance <= colorTolerance + (pass * 10) + 20) {
                        pixels[idx + 3] = 0
                    }
                }
            }
        }
    }

    // Fifth pass: Morphological operations untuk hasil yang lebih bersih
    const alphaChannel = new Uint8ClampedArray(width * height)
    for (let i = 0; i < pixels.length; i += 4) {
        alphaChannel[Math.floor(i / 4)] = pixels[i + 3]
    }

    erode(alphaChannel, width, height, 1)

    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i + 3] = alphaChannel[Math.floor(i / 4)]
    }

    dilate(pixels, width, height, 1)
    refineEdges(pixels, width, height)
}

/**
 * Remove background secara otomatis dengan deteksi objek yang canggih
 * Menggunakan saliency detection, object region detection, dan morphological operations
 */
export function removeAuto(
    pixels: Uint8ClampedArray,
    width: number,
    height: number
): void {
    const cornerColor = getCornerColor(pixels, width, height)
    const brightness = (cornerColor.r + cornerColor.g + cornerColor.b) / 3

    // Adaptive threshold based on corner brightness
    let colorTolerance: number
    if (brightness > 200) {
        colorTolerance = 40
    } else if (brightness < 50) {
        colorTolerance = 30
    } else {
        colorTolerance = 35
    }

    // Pass 1: Calculate saliency untuk deteksi objek utama
    const saliency = calculateSaliency(pixels, width, height)
    
    // Pass 2: Detect object region menggunakan saliency
    const isObjectRegion = detectObjectRegion(pixels, width, height, saliency)

    // Pass 3: Initial removal - hapus background berdasarkan edge detection dan corner color
    // Mulai dengan mengasumsikan semua pixel adalah background
    for (let i = 0; i < pixels.length; i += 4) {
        const idx = Math.floor(i / 4)
        const pixelColor: Color = {
            r: pixels[i],
            g: pixels[i + 1],
            b: pixels[i + 2]
        }

        // Jika di object region (berdasarkan saliency), preserve pixel
        if (isObjectRegion[idx]) {
            continue
        }

        // Jika tidak di object region, cek apakah mirip dengan background
        const distance = colorDistance(pixelColor, cornerColor)
        if (distance <= colorTolerance) {
            pixels[i + 3] = 0 // Transparent
        }
    }

    // Pass 4: Flood fill from edges untuk menghapus background yang terhubung ke edge
    const visited = new Array(width * height).fill(false)
    for (let x = 0; x < width; x++) {
        floodFill(pixels, width, height, x, 0, cornerColor, colorTolerance + 15, visited).forEach(idx => {
            const pixelIdx = idx / 4
            // Hanya hapus jika tidak di object region yang kuat
            if (!isObjectRegion[pixelIdx] || saliency[pixelIdx] < 50) {
                pixels[idx + 3] = 0
            }
        })
        floodFill(pixels, width, height, x, height - 1, cornerColor, colorTolerance + 15, visited).forEach(idx => {
            const pixelIdx = idx / 4
            if (!isObjectRegion[pixelIdx] || saliency[pixelIdx] < 50) {
                pixels[idx + 3] = 0
            }
        })
    }
    for (let y = 0; y < height; y++) {
        floodFill(pixels, width, height, 0, y, cornerColor, colorTolerance + 15, visited).forEach(idx => {
            const pixelIdx = idx / 4
            if (!isObjectRegion[pixelIdx] || saliency[pixelIdx] < 50) {
                pixels[idx + 3] = 0
            }
        })
        floodFill(pixels, width, height, width - 1, y, cornerColor, colorTolerance + 15, visited).forEach(idx => {
            const pixelIdx = idx / 4
            if (!isObjectRegion[pixelIdx] || saliency[pixelIdx] < 50) {
                pixels[idx + 3] = 0
            }
        })
    }

    // Pass 5: Remove isolated background pixels dengan iterasi lebih agresif
    for (let pass = 0; pass < 3; pass++) {
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4
                const pixelIdx = y * width + x
                
                if (pixels[idx + 3] === 0) continue // Skip already transparent
                
                // Jika di object region yang kuat, skip
                if (isObjectRegion[pixelIdx] && saliency[pixelIdx] > 80) {
                    continue
                }

                // Count transparent neighbors (8-connectivity)
                let transparentNeighbors = 0
                let solidNeighbors = 0
                const neighbors = [
                    [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
                    [x - 1, y], [x + 1, y],
                    [x - 1, y + 1], [x, y + 1], [x + 1, y + 1]
                ]

                for (const [nx, ny] of neighbors) {
                    const nIdx = (ny * width + nx) * 4
                    if (pixels[nIdx + 3] === 0) {
                        transparentNeighbors++
                    } else {
                        solidNeighbors++
                    }
                }

                // Jika sebagian besar neighbors transparan dan pixel mirip background, hapus
                if (transparentNeighbors >= 5 || (transparentNeighbors >= 3 && solidNeighbors <= 1)) {
                    const pixelColor: Color = {
                        r: pixels[idx],
                        g: pixels[idx + 1],
                        b: pixels[idx + 2]
                    }
                    const distance = colorDistance(pixelColor, cornerColor)
                    
                    // Lebih agresif di pass selanjutnya
                    const threshold = colorTolerance + (pass * 10) + 20
                    if (distance <= threshold) {
                        pixels[idx + 3] = 0
                    }
                }
            }
        }
    }

    // Pass 6: Morphological operations untuk membersihkan hasil
    // Extract alpha channel untuk erosion
    const alphaChannel = new Uint8ClampedArray(width * height)
    for (let i = 0; i < pixels.length; i += 4) {
        alphaChannel[Math.floor(i / 4)] = pixels[i + 3]
    }

    // Erode untuk menghapus noise kecil (1-2 pixel)
    erode(alphaChannel, width, height, 1)

    // Apply eroded alpha back
    for (let i = 0; i < pixels.length; i += 4) {
        const alphaIdx = Math.floor(i / 4)
        // Hanya update jika tidak di object region yang kuat
        if (!isObjectRegion[alphaIdx] || saliency[alphaIdx] < 100) {
            pixels[i + 3] = alphaChannel[alphaIdx]
        }
    }

    // Pass 7: Dilation untuk memperbaiki edge yang rusak
    dilate(pixels, width, height, 1)

    // Pass 8: Edge refinement untuk transisi yang lebih smooth
    refineEdges(pixels, width, height)

    // Pass 9: Final cleanup - hapus pixel yang masih sangat mirip dengan background
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4
            const pixelIdx = y * width + x
            
            if (pixels[idx + 3] === 0) continue
            
            // Skip jika di object region yang kuat
            if (isObjectRegion[pixelIdx] && saliency[pixelIdx] > 70) {
                continue
            }

            const pixelColor: Color = {
                r: pixels[idx],
                g: pixels[idx + 1],
                b: pixels[idx + 2]
            }
            const distance = colorDistance(pixelColor, cornerColor)

            // Final aggressive cleanup
            if (distance <= colorTolerance + 25) {
                pixels[idx + 3] = 0
            }
        }
    }
}

