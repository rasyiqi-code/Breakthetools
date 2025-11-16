// Background removal algorithms

import {
    floodFill,
    getCornerColor,
    getEdgeStrength,
    colorDistance,
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
 * Remove background dengan edge detection yang cerdas
 */
export function removeByEdge(
    pixels: Uint8ClampedArray,
    width: number,
    height: number
): void {
    const cornerColor = getCornerColor(pixels, width, height)
    const edgeThreshold = 25
    const colorTolerance = 50

    // First pass: mark edges
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

    // Third pass: flood fill from edges for remaining background
    const visited = new Array(width * height).fill(false)
    for (let x = 0; x < width; x++) {
        floodFill(pixels, width, height, x, 0, cornerColor, colorTolerance, visited).forEach(idx => {
            pixels[idx + 3] = 0
        })
        floodFill(pixels, width, height, x, height - 1, cornerColor, colorTolerance, visited).forEach(idx => {
            pixels[idx + 3] = 0
        })
    }
    for (let y = 0; y < height; y++) {
        floodFill(pixels, width, height, 0, y, cornerColor, colorTolerance, visited).forEach(idx => {
            pixels[idx + 3] = 0
        })
        floodFill(pixels, width, height, width - 1, y, cornerColor, colorTolerance, visited).forEach(idx => {
            pixels[idx + 3] = 0
        })
    }
}

/**
 * Remove background secara otomatis dengan multi-pass intelligent removal
 */
export function removeAuto(
    pixels: Uint8ClampedArray,
    width: number,
    height: number
): void {
    const cornerColor = getCornerColor(pixels, width, height)
    const brightness = (cornerColor.r + cornerColor.g + cornerColor.b) / 3

    // Adaptive threshold based on corner brightness
    let threshold: number
    let colorTolerance: number

    if (brightness > 200) {
        // Light background
        threshold = 220
        colorTolerance = 40
    } else if (brightness < 50) {
        // Dark background
        threshold = 60
        colorTolerance = 30
    } else {
        // Medium background
        threshold = brightness + 20
        colorTolerance = 35
    }

    // First pass: remove very similar colors
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const pixelBrightness = (r + g + b) / 3

        const pixelColor: Color = { r, g, b }
        const distance = colorDistance(pixelColor, cornerColor)

        if (distance <= colorTolerance) {
            pixels[i + 3] = 0
        } else if (Math.abs(pixelBrightness - brightness) < 30 && pixelBrightness > threshold) {
            pixels[i + 3] = 0
        }
    }

    // Second pass: flood fill from edges
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

    // Third pass: remove isolated background pixels
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4
            if (pixels[idx + 3] > 0) {
                // Count transparent neighbors
                let transparentNeighbors = 0
                const neighbors = [
                    pixels[((y - 1) * width + x) * 4 + 3],
                    pixels[((y + 1) * width + x) * 4 + 3],
                    pixels[(y * width + (x - 1)) * 4 + 3],
                    pixels[(y * width + (x + 1)) * 4 + 3]
                ]
                transparentNeighbors = neighbors.filter(a => a === 0).length

                // If 3+ neighbors are transparent and pixel is similar to background, remove it
                if (transparentNeighbors >= 3) {
                    const pixelColor: Color = {
                        r: pixels[idx],
                        g: pixels[idx + 1],
                        b: pixels[idx + 2]
                    }
                    const distance = colorDistance(pixelColor, cornerColor)
                    if (distance <= colorTolerance + 20) {
                        pixels[idx + 3] = 0
                    }
                }
            }
        }
    }
}

