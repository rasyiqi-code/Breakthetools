'use client'

import { useState, useRef } from 'react'
import { Upload, Download, Image as ImageIcon, FileImage, RotateCw, FlipVertical, FlipHorizontal, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ImageRotatorFlip() {
    const t = useTranslations('tools')
    
    const [originalFile, setOriginalFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string>('')
    const [processedUrl, setProcessedUrl] = useState<string>('')
    const [rotation, setRotation] = useState(0)
    const [flipHorizontal, setFlipHorizontal] = useState(false)
    const [flipVertical, setFlipVertical] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert(t('imageRotatorFlip.errors.invalidFileType'))
            return
        }

        setOriginalFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
            setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
        setProcessedUrl('')
        // Reset transforms
        setRotation(0)
        setFlipHorizontal(false)
        setFlipVertical(false)
    }

    const applyTransforms = () => {
        if (!preview) {
            alert(t('imageRotatorFlip.errors.noFileSelected'))
            return
        }

        setIsProcessing(true)

        setTimeout(() => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
                const canvas = document.createElement('canvas') as HTMLCanvasElement
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    setIsProcessing(false)
                    return
                }

                // Calculate new canvas size based on rotation
                const radians = (rotation * Math.PI) / 180
                const sin = Math.abs(Math.sin(radians))
                const cos = Math.abs(Math.cos(radians))
                
                let newWidth = img.width * cos + img.height * sin
                let newHeight = img.width * sin + img.height * cos

                // If flipping, keep original dimensions
                if (flipHorizontal || flipVertical) {
                    newWidth = img.width
                    newHeight = img.height
                }

                canvas.width = newWidth
                canvas.height = newHeight

                // Set transform origin to center
                ctx.translate(canvas.width / 2, canvas.height / 2)

                // Apply rotation
                if (rotation !== 0) {
                    ctx.rotate(radians)
                }

                // Apply flips
                if (flipHorizontal) {
                    ctx.scale(-1, 1)
                }
                if (flipVertical) {
                    ctx.scale(1, -1)
                }

                // Draw image centered
                ctx.drawImage(
                    img,
                    -img.width / 2,
                    -img.height / 2,
                    img.width,
                    img.height
                )

                canvas.toBlob((blob: Blob | null) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob)
                        setProcessedUrl(url)
                    }
                    setIsProcessing(false)
                }, 'image/png')
            }
            img.src = preview
        }, 100)
    }

    const handleRotate = (degrees: number) => {
        setRotation((prev) => (prev + degrees) % 360)
    }

    const handleReset = () => {
        setRotation(0)
        setFlipHorizontal(false)
        setFlipVertical(false)
        setProcessedUrl('')
    }

    const handleDownload = () => {
        if (!processedUrl) return

        const link = document.createElement('a') as HTMLAnchorElement
        link.href = processedUrl
        link.download = `rotated-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="max-w-full sm:max-w-6xl mx-auto px-4">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('imageRotatorFlip.title')}</h1>
                <p className="text-sm sm:text-base text-neutral-600">{t('imageRotatorFlip.description')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="tool-card p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        {t('imageRotatorFlip.uploadAndTransform')}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                {t('imageRotatorFlip.selectImage')}
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="btn-secondary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
                            >
                                <FileImage className="w-4 h-4" />
                                {t('imageRotatorFlip.selectImage')}
                            </button>
                            {originalFile && (
                                <div className="mt-2 text-xs sm:text-sm text-neutral-600 break-words">
                                    {originalFile.name}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                {t('imageRotatorFlip.rotation')}: {rotation}°
                            </label>
                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={() => handleRotate(-90)}
                                    className="flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                >
                                    <RotateCw className="w-4 h-4 mx-auto rotate-180" />
                                    -90°
                                </button>
                                <button
                                    onClick={() => handleRotate(90)}
                                    className="flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                >
                                    <RotateCw className="w-4 h-4 mx-auto" />
                                    +90°
                                </button>
                                <button
                                    onClick={() => handleRotate(180)}
                                    className="flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                >
                                    <RotateCw className="w-4 h-4 mx-auto" />
                                    180°
                                </button>
                            </div>
                            <input
                                type="range"
                                min="-180"
                                max="180"
                                value={rotation}
                                onChange={(e) => setRotation(parseInt(e.target.value))}
                                className="w-full h-2 accent-primary-500"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                {t('imageRotatorFlip.flip')}
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFlipHorizontal(!flipHorizontal)}
                                    className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${
                                        flipHorizontal
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                    }`}
                                >
                                    <FlipHorizontal className="w-4 h-4 mx-auto mb-1" />
                                    {t('imageRotatorFlip.horizontal')}
                                </button>
                                <button
                                    onClick={() => setFlipVertical(!flipVertical)}
                                    className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${
                                        flipVertical
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                    }`}
                                >
                                    <FlipVertical className="w-4 h-4 mx-auto mb-1" />
                                    {t('imageRotatorFlip.vertical')}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleReset}
                                className="flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            >
                                {t('imageRotatorFlip.reset')}
                            </button>
                            <button
                                onClick={applyTransforms}
                                disabled={!originalFile || isProcessing}
                                className="flex-1 btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t('imageRotatorFlip.processing')}
                                    </>
                                ) : (
                                    <>
                                        <RotateCw className="w-4 h-4" />
                                        {t('imageRotatorFlip.applyTransforms')}
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800">
                            💡 <strong>{t('imageRotatorFlip.tipsLabel')}:</strong> {t('imageRotatorFlip.tips')}
                        </div>
                    </div>
                </div>

                <div className="tool-card p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        {t('imageRotatorFlip.previewAndDownload')}
                    </h3>

                    {preview ? (
                        <div className="space-y-4">
                            <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200">
                                <div className="text-xs text-neutral-600 mb-2">{t('imageRotatorFlip.original')}</div>
                                <img src={preview} alt={t('imageRotatorFlip.original')} className="max-w-full h-auto rounded" />
                            </div>

                            {processedUrl && (
                                <>
                                    <div className="bg-primary-50 p-3 sm:p-4 rounded-lg border border-primary-200">
                                        <div className="text-xs text-neutral-600 mb-2">{t('imageRotatorFlip.transformed')}</div>
                                        <img src={processedUrl} alt={t('imageRotatorFlip.processed')} className="max-w-full h-auto rounded" />
                                    </div>
                                    <button
                                        onClick={handleDownload}
                                        className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
                                    >
                                        <Download className="w-4 h-4" />
                                        {t('imageRotatorFlip.downloadImage')}
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[250px] sm:min-h-[300px] text-neutral-400">
                            <div className="text-center">
                                <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-xs sm:text-sm">{t('imageRotatorFlip.selectImageToStart')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

