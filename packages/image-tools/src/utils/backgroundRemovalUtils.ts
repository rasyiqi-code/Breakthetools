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
 * Menghitung saliency map untuk deteksi objek utama
 * Menggunakan teknik contrast-based saliency
 */
export function computeSaliencyMap(
    pixels: Uint8ClampedArray,
    width: number,
    height: number
): Float32Array {
    const saliency = new Float32Array(width * height)

    // Compute saliency menggunakan center-surround contrast
    const kernelSize = Math.min(5, Math.floor(Math.min(width, height) / 20))
    const halfKernel = Math.floor(kernelSize / 2)

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4
            const centerR = pixels[idx]
            const centerG = pixels[idx + 1]
            const centerB = pixels[idx + 2]

            let contrast = 0
            let sampleCount = 0

            // Sample surrounding pixels
            for (let dy = -halfKernel; dy <= halfKernel; dy++) {
                for (let dx = -halfKernel; dx <= halfKernel; dx++) {
                    const ny = y + dy * 2
                    const nx = x + dx * 2

                    if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                        const nIdx = (ny * width + nx) * 4
                        const nr = pixels[nIdx]
                        const ng = pixels[nIdx + 1]
                        const nb = pixels[nIdx + 2]

                        const diff = Math.sqrt(
                            Math.pow(centerR - nr, 2) +
                            Math.pow(centerG - ng, 2) +
                            Math.pow(centerB - nb, 2)
                        )
                        contrast += diff
                        sampleCount++
                    }
                }
            }

            saliency[y * width + x] = sampleCount > 0 ? contrast / sampleCount : 0
        }
    }

    // Normalize saliency map
    let maxSaliency = 0
    for (let i = 0; i < saliency.length; i++) {
        maxSaliency = Math.max(maxSaliency, saliency[i])
    }

    if (maxSaliency > 0) {
        for (let i = 0; i < saliency.length; i++) {
            saliency[i] = saliency[i] / maxSaliency
        }
    }

    return saliency
}

/**
 * K-means clustering sederhana untuk mendeteksi warna background dominan
 */
export function detectBackgroundColors(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    k: number = 3
): Color[] {
    const samples: Color[] = []
    const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 50))

    // Sample pixels terutama dari edges
    for (let y = 0; y < height; y += sampleStep) {
        for (let x = 0; x < width; x += sampleStep) {
            // Prioritas edge pixels
            const isEdge = x < width * 0.1 || x > width * 0.9 ||
                y < height * 0.1 || y > height * 0.9

            if (isEdge || Math.random() < 0.3) {
                const idx = (y * width + x) * 4
                samples.push({
                    r: pixels[idx],
                    g: pixels[idx + 1],
                    b: pixels[idx + 2]
                })
            }
        }
    }

    if (samples.length === 0) return []

    // K-means clustering
    const clusters: Color[] = []
    const assignments: number[] = new Array(samples.length).fill(0)

    // Initialize centroids
    for (let i = 0; i < k; i++) {
        const randomIdx = Math.floor(Math.random() * samples.length)
        clusters.push({ ...samples[randomIdx] })
    }

    // Iterate k-means
    for (let iter = 0; iter < 10; iter++) {
        // Assign samples to nearest cluster
        for (let i = 0; i < samples.length; i++) {
            let minDist = Infinity
            let nearestCluster = 0

            for (let j = 0; j < clusters.length; j++) {
                const dist = colorDistance(samples[i], clusters[j])
                if (dist < minDist) {
                    minDist = dist
                    nearestCluster = j
                }
            }
            assignments[i] = nearestCluster
        }

        // Update centroids
        const clusterSums: Color[] = clusters.map(() => ({ r: 0, g: 0, b: 0 }))
        const clusterCounts = new Array(clusters.length).fill(0)

        for (let i = 0; i < samples.length; i++) {
            const clusterIdx = assignments[i]
            clusterSums[clusterIdx].r += samples[i].r
            clusterSums[clusterIdx].g += samples[i].g
            clusterSums[clusterIdx].b += samples[i].b
            clusterCounts[clusterIdx]++
        }

        for (let j = 0; j < clusters.length; j++) {
            if (clusterCounts[j] > 0) {
                clusters[j].r = Math.round(clusterSums[j].r / clusterCounts[j])
                clusters[j].g = Math.round(clusterSums[j].g / clusterCounts[j])
                clusters[j].b = Math.round(clusterSums[j].b / clusterCounts[j])
            }
        }
    }

    return clusters
}

/**
 * Morphological operations untuk membersihkan mask
 */
export function morphClose(
    mask: Uint8Array,
    width: number,
    height: number,
    kernelSize: number = 3
): void {
    const halfKernel = Math.floor(kernelSize / 2)
    const temp = new Uint8Array(mask.length)

    // Dilation
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x
            let maxVal = 0

            for (let dy = -halfKernel; dy <= halfKernel; dy++) {
                for (let dx = -halfKernel; dx <= halfKernel; dx++) {
                    const ny = y + dy
                    const nx = x + dx

                    if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                        const nIdx = ny * width + nx
                        maxVal = Math.max(maxVal, mask[nIdx])
                    }
                }
            }

            temp[idx] = maxVal
        }
    }

    // Erosion
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x
            let minVal = 255

            for (let dy = -halfKernel; dy <= halfKernel; dy++) {
                for (let dx = -halfKernel; dx <= halfKernel; dx++) {
                    const ny = y + dy
                    const nx = x + dx

                    if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                        const nIdx = ny * width + nx
                        minVal = Math.min(minVal, temp[nIdx])
                    }
                }
            }

            mask[idx] = minVal
        }
    }
}

/**
 * Gaussian blur untuk smoothing
 */
export function gaussianBlur(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    radius: number = 1
): void {
    const temp = new Uint8ClampedArray(pixels.length)

    // Generate Gaussian kernel
    const kernelSize = radius * 2 + 1
    const kernel: number[] = []
    let sum = 0
    const sigma = radius / 3

    for (let i = -radius; i <= radius; i++) {
        const value = Math.exp(-(i * i) / (2 * sigma * sigma))
        kernel.push(value)
        sum += value
    }

    // Normalize kernel
    for (let i = 0; i < kernel.length; i++) {
        kernel[i] /= sum
    }

    // Horizontal pass
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0

            for (let k = -radius; k <= radius; k++) {
                const nx = Math.max(0, Math.min(width - 1, x + k))
                const idx = (y * width + nx) * 4
                const weight = kernel[k + radius]

                r += pixels[idx] * weight
                g += pixels[idx + 1] * weight
                b += pixels[idx + 2] * weight
                a += pixels[idx + 3] * weight
            }

            const idx = (y * width + x) * 4
            temp[idx] = r
            temp[idx + 1] = g
            temp[idx + 2] = b
            temp[idx + 3] = a
        }
    }

    // Vertical pass
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0

            for (let k = -radius; k <= radius; k++) {
                const ny = Math.max(0, Math.min(height - 1, y + k))
                const idx = (ny * width + x) * 4
                const weight = kernel[k + radius]

                r += temp[idx] * weight
                g += temp[idx + 1] * weight
                b += temp[idx + 2] * weight
                a += temp[idx + 3] * weight
            }

            const idx = (y * width + x) * 4
            pixels[idx] = r
            pixels[idx + 1] = g
            pixels[idx + 2] = b
            pixels[idx + 3] = a
        }
    }
}

