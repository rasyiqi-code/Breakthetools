// Utility functions for background removal

export interface Color {
    r: number
    g: number
    b: number
}

/**
 * Flood fill algorithm untuk menghapus area dengan warna serupa
 */
export function floodFill(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    startX: number,
    startY: number,
    targetColor: Color,
    tolerance: number,
    visited: boolean[]
): number[] {
    const stack: Array<[number, number]> = [[startX, startY]]
    const toRemove: number[] = []

    while (stack.length > 0) {
        const [x, y] = stack.pop()!
        if (x < 0 || x >= width || y < 0 || y >= height) continue

        const idx = (y * width + x) * 4
        const visitIdx = y * width + x

        if (visited[visitIdx]) continue
        visited[visitIdx] = true

        const r = pixels[idx]
        const g = pixels[idx + 1]
        const b = pixels[idx + 2]

        const distance = Math.sqrt(
            Math.pow(r - targetColor.r, 2) +
            Math.pow(g - targetColor.g, 2) +
            Math.pow(b - targetColor.b, 2)
        )

        if (distance <= tolerance) {
            toRemove.push(idx)
            // Add neighbors
            stack.push([x + 1, y])
            stack.push([x - 1, y])
            stack.push([x, y + 1])
            stack.push([x, y - 1])
        }
    }

    return toRemove
}

/**
 * Mendapatkan rata-rata warna dari corner pixels
 */
export function getCornerColor(
    pixels: Uint8ClampedArray,
    width: number,
    height: number
): Color {
    const sampleSize = Math.min(20, Math.floor(width / 10), Math.floor(height / 10))
    const samples: Color[] = []

    for (let y = 0; y < sampleSize; y++) {
        for (let x = 0; x < sampleSize; x++) {
            // Top-left
            const idx1 = (y * width + x) * 4
            samples.push({ r: pixels[idx1], g: pixels[idx1 + 1], b: pixels[idx1 + 2] })

            // Top-right
            const idx2 = (y * width + (width - 1 - x)) * 4
            samples.push({ r: pixels[idx2], g: pixels[idx2 + 1], b: pixels[idx2 + 2] })

            // Bottom-left
            const idx3 = ((height - 1 - y) * width + x) * 4
            samples.push({ r: pixels[idx3], g: pixels[idx3 + 1], b: pixels[idx3 + 2] })

            // Bottom-right
            const idx4 = ((height - 1 - y) * width + (width - 1 - x)) * 4
            samples.push({ r: pixels[idx4], g: pixels[idx4 + 1], b: pixels[idx4 + 2] })
        }
    }

    const avg = samples.reduce(
        (acc, c) => ({ r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b }),
        { r: 0, g: 0, b: 0 }
    )
    return {
        r: Math.round(avg.r / samples.length),
        g: Math.round(avg.g / samples.length),
        b: Math.round(avg.b / samples.length)
    }
}

/**
 * Menghitung edge strength untuk deteksi tepi objek
 */
export function getEdgeStrength(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    x: number,
    y: number
): number {
    if (x === 0 || x === width - 1 || y === 0 || y === height - 1) return 0

    const idx = (y * width + x) * 4
    const center: Color = {
        r: pixels[idx],
        g: pixels[idx + 1],
        b: pixels[idx + 2]
    }

    let maxDiff = 0

    // Check 8 neighbors
    const neighbors = [
        [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
        [x - 1, y], [x + 1, y],
        [x - 1, y + 1], [x, y + 1], [x + 1, y + 1]
    ]

    for (const [nx, ny] of neighbors) {
        const nIdx = (ny * width + nx) * 4
        const neighbor: Color = {
            r: pixels[nIdx],
            g: pixels[nIdx + 1],
            b: pixels[nIdx + 2]
        }

        const diff = Math.sqrt(
            Math.pow(center.r - neighbor.r, 2) +
            Math.pow(center.g - neighbor.g, 2) +
            Math.pow(center.b - neighbor.b, 2)
        )
        maxDiff = Math.max(maxDiff, diff)
    }

    return maxDiff
}

/**
 * Menghitung jarak warna antara dua warna
 */
export function colorDistance(color1: Color, color2: Color): number {
    return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
    )
}

/**
 * Parse hex color ke RGB
 */
export function hexToRgb(hex: string): Color {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
}

/**
 * Deteksi saliency (area yang menarik perhatian) menggunakan teknik sederhana
 * Berdasarkan kontras, edge strength, dan posisi
 */
export function calculateSaliency(
    pixels: Uint8ClampedArray,
    width: number,
    height: number
): number[] {
    const saliency = new Array(width * height).fill(0)

    // Pass 1: Calculate local contrast and edge strength
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4
            const center: Color = {
                r: pixels[idx],
                g: pixels[idx + 1],
                b: pixels[idx + 2]
            }

            let localContrast = 0
            let maxDiff = 0

            // Check 8 neighbors
            const neighbors = [
                [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
                [x - 1, y], [x + 1, y],
                [x - 1, y + 1], [x, y + 1], [x + 1, y + 1]
            ]

            for (const [nx, ny] of neighbors) {
                const nIdx = (ny * width + nx) * 4
                const neighbor: Color = {
                    r: pixels[nIdx],
                    g: pixels[nIdx + 1],
                    b: pixels[nIdx + 2]
                }

                const diff = colorDistance(center, neighbor)
                localContrast += diff
                maxDiff = Math.max(maxDiff, diff)
            }

            saliency[y * width + x] = (localContrast / neighbors.length) * 0.7 + maxDiff * 0.3
        }
    }

    // Pass 2: Center bias - objek biasanya di tengah gambar
    const centerX = width / 2
    const centerY = height / 2
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY)

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const distFromCenter = Math.sqrt(
                Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
            )
            const centerWeight = 1 - (distFromCenter / maxDist) * 0.3 // 30% boost untuk area tengah
            saliency[y * width + x] *= centerWeight
        }
    }

    return saliency
}

/**
 * Detect object region berdasarkan saliency dan connectivity
 */
export function detectObjectRegion(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    saliency: number[]
): boolean[] {
    // Find saliency threshold (top 40% most salient)
    const sortedSaliency = [...saliency].sort((a, b) => b - a)
    const threshold = sortedSaliency[Math.floor(sortedSaliency.length * 0.4)]

    const isObject = new Array(width * height).fill(false)

    // Mark high saliency areas as potential object
    for (let i = 0; i < saliency.length; i++) {
        if (saliency[i] > threshold) {
            isObject[i] = true
        }
    }

    // Expand object region using flood fill from high saliency seeds
    const visited = new Array(width * height).fill(false)
    const queue: Array<[number, number]> = []

    // Find seeds (high saliency points)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (saliency[y * width + x] > threshold * 1.5) {
                queue.push([x, y])
            }
        }
    }

    // Flood fill from seeds
    while (queue.length > 0) {
        const [x, y] = queue.shift()!
        if (x < 0 || x >= width || y < 0 || y >= height) continue

        const idx = y * width + x
        if (visited[idx]) continue
        visited[idx] = true

        isObject[idx] = true

        // Add neighbors if they have decent saliency
        const neighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
        for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = ny * width + nx
                if (!visited[nIdx] && saliency[nIdx] > threshold * 0.5) {
                    queue.push([nx, ny])
                }
            }
        }
    }

    return isObject
}

/**
 * Morphological erosion - menghapus pixel kecil yang terisolasi
 */
export function erode(
    alpha: Uint8ClampedArray,
    width: number,
    height: number,
    iterations: number = 1
): void {
    for (let iter = 0; iter < iterations; iter++) {
        const newAlpha = new Uint8ClampedArray(alpha.length)
        newAlpha.set(alpha)

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x
                if (alpha[idx] === 0) continue // Skip already transparent

                // Check if all neighbors are transparent (erode)
                let hasSolidNeighbor = false
                const neighbors = [
                    alpha[(y - 1) * width + x],
                    alpha[(y + 1) * width + x],
                    alpha[y * width + (x - 1)],
                    alpha[y * width + (x + 1)]
                ]

                for (const neighbor of neighbors) {
                    if (neighbor > 0) {
                        hasSolidNeighbor = true
                        break
                    }
                }

                // If isolated, remove it
                if (!hasSolidNeighbor) {
                    newAlpha[idx] = 0
                }
            }
        }

        // Copy back
        for (let i = 0; i < alpha.length; i++) {
            alpha[i] = newAlpha[i]
        }
    }
}

/**
 * Morphological dilation - memperbaiki edge yang rusak
 */
export function dilate(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    iterations: number = 1
): void {
    for (let iter = 0; iter < iterations; iter++) {
        const newPixels = new Uint8ClampedArray(pixels)

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4
                if (pixels[idx + 3] > 0) continue // Skip already solid

                // Check if any neighbor is solid (dilate)
                let hasSolidNeighbor = false
                const neighbors = [
                    pixels[((y - 1) * width + x) * 4 + 3],
                    pixels[((y + 1) * width + x) * 4 + 3],
                    pixels[(y * width + (x - 1)) * 4 + 3],
                    pixels[(y * width + (x + 1)) * 4 + 3]
                ]

                for (const neighbor of neighbors) {
                    if (neighbor > 0) {
                        hasSolidNeighbor = true
                        break
                    }
                }

                // If near solid pixel, restore with average color of neighbors
                if (hasSolidNeighbor) {
                    let r = 0, g = 0, b = 0, count = 0

                    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
                        const nIdx = (ny * width + nx) * 4
                        if (pixels[nIdx + 3] > 0) {
                            r += pixels[nIdx]
                            g += pixels[nIdx + 1]
                            b += pixels[nIdx + 2]
                            count++
                        }
                    }

                    if (count > 0) {
                        newPixels[idx] = Math.round(r / count)
                        newPixels[idx + 1] = Math.round(g / count)
                        newPixels[idx + 2] = Math.round(b / count)
                        newPixels[idx + 3] = 128 // Semi-transparent for smooth edge
                    }
                }
            }
        }

        pixels.set(newPixels)
    }
}

/**
 * Edge refinement - memperbaiki edge dengan smoothing alpha channel
 */
export function refineEdges(
    pixels: Uint8ClampedArray,
    width: number,
    height: number
): void {
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4
            const alpha = pixels[idx + 3]

            // Only process edge pixels (partially transparent)
            if (alpha === 0 || alpha === 255) continue

            // Get neighbor alphas
            const neighborAlphas = [
                pixels[((y - 1) * width + x) * 4 + 3],
                pixels[((y + 1) * width + x) * 4 + 3],
                pixels[(y * width + (x - 1)) * 4 + 3],
                pixels[(y * width + (x + 1)) * 4 + 3]
            ]

            // Smooth alpha based on neighbors
            const avgAlpha = neighborAlphas.reduce((a, b) => a + b, 0) / neighborAlphas.length
            pixels[idx + 3] = Math.round(alpha * 0.7 + avgAlpha * 0.3)
        }
    }
}

