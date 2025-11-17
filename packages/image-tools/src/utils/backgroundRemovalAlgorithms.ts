// Background removal algorithms

import {
    floodFill,
    getCornerColor,
    getEdgeStrength,
    colorDistance,
    computeSaliencyMap,
    detectBackgroundColors,
    morphClose,
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
 * Menggunakan edge detection untuk melindungi objek utama
 */
export function removeByEdge(
    pixels: Uint8ClampedArray,
    width: number,
    height: number
): void {
    const cornerColor = getCornerColor(pixels, width, height)
    const bgColors = detectBackgroundColors(pixels, width, height, 2)
    const allBgColors = [cornerColor, ...bgColors]

    const edgeThreshold = 30
    const colorTolerance = 55

    // First pass: mark strong edges (objek boundaries)
    const edgeStrength = new Float32Array(width * height)
    const isEdge = new Array(width * height).fill(false)

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const strength = getEdgeStrength(pixels, width, height, x, y)
            const idx = y * width + x
            edgeStrength[idx] = strength

            if (strength > edgeThreshold) {
                isEdge[idx] = true
            }
        }
    }

    // Second pass: create mask berdasarkan edge dan background colors
    const mask = new Uint8Array(width * height)

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4
            const pixelIdx = y * width + x

            const pixelColor: Color = {
                r: pixels[idx],
                g: pixels[idx + 1],
                b: pixels[idx + 2]
            }

            // Check jika berada di area dengan edge kuat (objek)
            const strength = edgeStrength[pixelIdx]
            const isStrongEdge = isEdge[pixelIdx]

            // Check similarity dengan background
            let minDistance = Infinity
            for (const bgColor of allBgColors) {
                const dist = colorDistance(pixelColor, bgColor)
                minDistance = Math.min(minDistance, dist)
            }

            // Jika ada edge kuat -> pertahankan (objek)
            // Jika tidak ada edge DAN mirip background -> hapus
            if (isStrongEdge || strength > edgeThreshold * 0.7) {
                mask[pixelIdx] = 255 // Objek - pertahankan
            } else if (minDistance <= colorTolerance) {
                mask[pixelIdx] = 0 // Background - hapus
            } else {
                mask[pixelIdx] = 128 // Uncertain
            }
        }
    }

    // Third pass: flood fill from edges untuk menghapus background yang terlewat
    const visited = new Array(width * height).fill(false)
    const fillTolerance = colorTolerance + 15

    for (let x = 0; x < width; x++) {
        const topIdx = width * 0 + x
        const bottomIdx = width * (height - 1) + x

        if (mask[topIdx] !== 255) {
            floodFill(pixels, width, height, x, 0, cornerColor, fillTolerance, visited).forEach(pixelIdx => {
                mask[Math.floor(pixelIdx / 4)] = 0
            })
        }
        if (mask[bottomIdx] !== 255) {
            floodFill(pixels, width, height, x, height - 1, cornerColor, fillTolerance, visited).forEach(pixelIdx => {
                mask[Math.floor(pixelIdx / 4)] = 0
            })
        }
    }

    for (let y = 0; y < height; y++) {
        const leftIdx = width * y + 0
        const rightIdx = width * y + (width - 1)

        if (mask[leftIdx] !== 255) {
            floodFill(pixels, width, height, 0, y, cornerColor, fillTolerance, visited).forEach(pixelIdx => {
                mask[Math.floor(pixelIdx / 4)] = 0
            })
        }
        if (mask[rightIdx] !== 255) {
            floodFill(pixels, width, height, width - 1, y, cornerColor, fillTolerance, visited).forEach(pixelIdx => {
                mask[Math.floor(pixelIdx / 4)] = 0
            })
        }
    }

    // Morphological operations untuk membersihkan mask
    morphClose(mask, width, height, 2)

    // Process uncertain pixels
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const pixelIdx = y * width + x
            if (mask[pixelIdx] === 128) {
                const neighbors = [
                    mask[(y - 1) * width + x],
                    mask[(y + 1) * width + x],
                    mask[y * width + (x - 1)],
                    mask[y * width + (x + 1)]
                ]

                const transparentCount = neighbors.filter(m => m === 0).length
                const objectCount = neighbors.filter(m => m === 255).length

                if (transparentCount >= 3) {
                    mask[pixelIdx] = 0
                } else if (objectCount >= 3 || isEdge[pixelIdx]) {
                    mask[pixelIdx] = 255
                } else {
                    // Check color again
                    const idx = pixelIdx * 4
                    const pixelColor: Color = {
                        r: pixels[idx],
                        g: pixels[idx + 1],
                        b: pixels[idx + 2]
                    }

                    let minDistance = Infinity
                    for (const bgColor of allBgColors) {
                        const dist = colorDistance(pixelColor, bgColor)
                        minDistance = Math.min(minDistance, dist)
                    }

                    if (minDistance <= fillTolerance) {
                        mask[pixelIdx] = 0
                    } else {
                        mask[pixelIdx] = 255
                    }
                }
            }
        }
    }

    // Apply mask
    for (let i = 0; i < mask.length; i++) {
        if (mask[i] === 0) {
            pixels[i * 4 + 3] = 0
        }
    }

    // Feather edges
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4

            if (pixels[idx + 3] > 0) {
                const neighbors = [
                    pixels[((y - 1) * width + x) * 4 + 3],
                    pixels[((y + 1) * width + x) * 4 + 3],
                    pixels[(y * width + (x - 1)) * 4 + 3],
                    pixels[(y * width + (x + 1)) * 4 + 3]
                ]

                const transparentNeighbors = neighbors.filter(a => a === 0).length

                if (transparentNeighbors > 0 && transparentNeighbors < 4) {
                    const alpha = Math.max(0, pixels[idx + 3] - (transparentNeighbors * 20))
                    pixels[idx + 3] = alpha
                }
            }
        }
    }
}

/**
 * Remove background secara otomatis dengan multi-pass intelligent removal
 * Menggunakan saliency detection dan background clustering untuk hasil yang lebih akurat
 */
export function removeAuto(
    pixels: Uint8ClampedArray,
    width: number,
    height: number
): void {
    // STEP 1: Compute saliency map untuk deteksi objek utama
    const saliency = computeSaliencyMap(pixels, width, height)

    // STEP 2: Detect background colors menggunakan K-means clustering
    const bgColors = detectBackgroundColors(pixels, width, height, 3)
    const cornerColor = getCornerColor(pixels, width, height)

    // Combine background colors (prioritas corner color)
    const allBgColors = [cornerColor, ...bgColors]

    // STEP 3: Create mask berdasarkan saliency dan background colors
    const mask = new Uint8Array(width * height)
    const saliencyThreshold = 0.3 // Threshold untuk objek utama
    const minColorTolerance = 30
    const maxColorTolerance = 60

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4
            const pixelIdx = y * width + x

            const pixelColor: Color = {
                r: pixels[idx],
                g: pixels[idx + 1],
                b: pixels[idx + 2]
            }

            // Check saliency - objek utama harus memiliki saliency tinggi
            const saliencyValue = saliency[pixelIdx]

            // Check jika pixel mirip dengan salah satu background color
            let minDistance = Infinity
            for (const bgColor of allBgColors) {
                const dist = colorDistance(pixelColor, bgColor)
                minDistance = Math.min(minDistance, dist)
            }

            // Adaptive tolerance berdasarkan posisi (edge pixels lebih toleran)
            const isEdge = x < width * 0.05 || x > width * 0.95 ||
                y < height * 0.05 || y > height * 0.95
            const edgeBoost = isEdge ? 15 : 0
            const adaptiveTolerance = minColorTolerance + (maxColorTolerance - minColorTolerance) * (1 - saliencyValue) + edgeBoost

            // Jika saliency rendah DAN mirip background -> hapus
            // Jika saliency tinggi -> pertahankan (objek utama)
            if (saliencyValue < saliencyThreshold && minDistance <= adaptiveTolerance) {
                mask[pixelIdx] = 0 // Mark untuk removal
            } else if (saliencyValue > saliencyThreshold * 1.5) {
                mask[pixelIdx] = 255 // Mark sebagai objek utama
            } else {
                // Gray area - check lebih lanjut
                if (minDistance <= adaptiveTolerance * 0.7) {
                    mask[pixelIdx] = 0
                } else {
                    mask[pixelIdx] = 128 // Uncertain, akan diproses lebih lanjut
                }
            }
        }
    }

    // STEP 4: Flood fill dari edges untuk menghapus background yang terlewat
    const visited = new Array(width * height).fill(false)
    const edgeTolerance = minColorTolerance + 20

    for (let x = 0; x < width; x++) {
        const topIdx = width * 0 + x
        const bottomIdx = width * (height - 1) + x

        if (mask[topIdx] !== 255) {
            floodFill(pixels, width, height, x, 0, cornerColor, edgeTolerance, visited).forEach(pixelIdx => {
                mask[Math.floor(pixelIdx / 4)] = 0
            })
        }
        if (mask[bottomIdx] !== 255) {
            floodFill(pixels, width, height, x, height - 1, cornerColor, edgeTolerance, visited).forEach(pixelIdx => {
                mask[Math.floor(pixelIdx / 4)] = 0
            })
        }
    }

    for (let y = 0; y < height; y++) {
        const leftIdx = width * y + 0
        const rightIdx = width * y + (width - 1)

        if (mask[leftIdx] !== 255) {
            floodFill(pixels, width, height, 0, y, cornerColor, edgeTolerance, visited).forEach(pixelIdx => {
                mask[Math.floor(pixelIdx / 4)] = 0
            })
        }
        if (mask[rightIdx] !== 255) {
            floodFill(pixels, width, height, width - 1, y, cornerColor, edgeTolerance, visited).forEach(pixelIdx => {
                mask[Math.floor(pixelIdx / 4)] = 0
            })
        }
    }

    // STEP 5: Morphological operations untuk membersihkan mask
    morphClose(mask, width, height, 3)

    // STEP 6: Process uncertain pixels (gray area = 128)
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const pixelIdx = y * width + x
            if (mask[pixelIdx] === 128) {
                // Check neighbors
                const neighbors = [
                    mask[(y - 1) * width + x],
                    mask[(y + 1) * width + x],
                    mask[y * width + (x - 1)],
                    mask[y * width + (x + 1)]
                ]

                const transparentCount = neighbors.filter(m => m === 0).length
                const objectCount = neighbors.filter(m => m === 255).length

                // Jika dikelilingi oleh background, hapus
                if (transparentCount >= 3) {
                    mask[pixelIdx] = 0
                } else if (objectCount >= 3) {
                    // Jika dikelilingi oleh objek, pertahankan
                    mask[pixelIdx] = 255
                } else {
                    // Check color similarity lagi
                    const idx = pixelIdx * 4
                    const pixelColor: Color = {
                        r: pixels[idx],
                        g: pixels[idx + 1],
                        b: pixels[idx + 2]
                    }

                    let minDistance = Infinity
                    for (const bgColor of allBgColors) {
                        const dist = colorDistance(pixelColor, bgColor)
                        minDistance = Math.min(minDistance, dist)
                    }

                    if (minDistance <= edgeTolerance) {
                        mask[pixelIdx] = 0
                    } else {
                        mask[pixelIdx] = 255
                    }
                }
            }
        }
    }

    // STEP 7: Remove isolated background pixels
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const pixelIdx = y * width + x
            if (mask[pixelIdx] > 0) {
                const neighbors = [
                    mask[(y - 1) * width + x],
                    mask[(y + 1) * width + x],
                    mask[y * width + (x - 1)],
                    mask[y * width + (x + 1)],
                    mask[(y - 1) * width + (x - 1)],
                    mask[(y - 1) * width + (x + 1)],
                    mask[(y + 1) * width + (x - 1)],
                    mask[(y + 1) * width + (x + 1)]
                ]

                const transparentCount = neighbors.filter(m => m === 0).length

                // Jika dikelilingi banyak background, kemungkinan juga background
                if (transparentCount >= 6) {
                    const idx = pixelIdx * 4
                    const pixelColor: Color = {
                        r: pixels[idx],
                        g: pixels[idx + 1],
                        b: pixels[idx + 2]
                    }

                    let minDistance = Infinity
                    for (const bgColor of allBgColors) {
                        const dist = colorDistance(pixelColor, bgColor)
                        minDistance = Math.min(minDistance, dist)
                    }

                    if (minDistance <= edgeTolerance + 10) {
                        mask[pixelIdx] = 0
                    }
                }
            }
        }
    }

    // STEP 8: Apply mask to pixels
    for (let i = 0; i < mask.length; i++) {
        if (mask[i] === 0) {
            pixels[i * 4 + 3] = 0 // Transparent
        }
    }

    // STEP 9: Final pass - feather edges untuk hasil yang lebih halus
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4
            const pixelIdx = y * width + x

            if (pixels[idx + 3] > 0) {
                // Check if on edge of object
                const neighbors = [
                    pixels[((y - 1) * width + x) * 4 + 3],
                    pixels[((y + 1) * width + x) * 4 + 3],
                    pixels[(y * width + (x - 1)) * 4 + 3],
                    pixels[(y * width + (x + 1)) * 4 + 3]
                ]

                const transparentNeighbors = neighbors.filter(a => a === 0).length

                // Feather edge jika ada background neighbors
                if (transparentNeighbors > 0 && transparentNeighbors < 4) {
                    const alpha = Math.max(0, pixels[idx + 3] - (transparentNeighbors * 20))
                    pixels[idx + 3] = alpha
                }
            }
        }
    }
}

