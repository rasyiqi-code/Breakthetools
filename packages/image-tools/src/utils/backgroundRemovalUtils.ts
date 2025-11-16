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

