'use client'

import { useState, useRef } from 'react'
import { Upload, Download, Image as ImageIcon, FileImage, Type, Loader2, Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function WatermarkMaker() {
    const t = useTranslations('tools.watermarkMaker')
    
    const [originalFile, setOriginalFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string>('')
    const [processedUrl, setProcessedUrl] = useState<string>('')
    const [watermarkText, setWatermarkText] = useState('Breaktools')
    const [textColor, setTextColor] = useState('#ffffff')
    const [textSize, setTextSize] = useState(48)
    const [opacity, setOpacity] = useState(70)
    const [position, setPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>('bottom-right')
    const [rotation, setRotation] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert(t('errors.invalidFileType'))
            return
        }

        setOriginalFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
            setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
        setProcessedUrl('')
    }

    const applyWatermark = () => {
        if (!preview || !watermarkText.trim()) {
            alert(t('errors.noImageOrText'))
            return
        }

        setIsProcessing(true)

        setTimeout(() => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    setIsProcessing(false)
                    return
                }

                canvas.width = img.width
                canvas.height = img.height

                // Draw original image
                ctx.drawImage(img, 0, 0)

                // Configure text style
                ctx.font = `bold ${textSize}px Arial, sans-serif`
                ctx.fillStyle = textColor
                ctx.globalAlpha = opacity / 100
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'

                // Calculate position
                const textMetrics = ctx.measureText(watermarkText)
                const textWidth = textMetrics.width
                const textHeight = textSize

                let x = 0
                let y = 0

                switch (position) {
                    case 'top-left':
                        x = textWidth / 2 + 20
                        y = textHeight / 2 + 20
                        break
                    case 'top-right':
                        x = canvas.width - textWidth / 2 - 20
                        y = textHeight / 2 + 20
                        break
                    case 'bottom-left':
                        x = textWidth / 2 + 20
                        y = canvas.height - textHeight / 2 - 20
                        break
                    case 'bottom-right':
                        x = canvas.width - textWidth / 2 - 20
                        y = canvas.height - textHeight / 2 - 20
                        break
                    case 'center':
                        x = canvas.width / 2
                        y = canvas.height / 2
                        break
                }

                // Apply rotation
                if (rotation !== 0) {
                    ctx.save()
                    ctx.translate(x, y)
                    ctx.rotate((rotation * Math.PI) / 180)
                    ctx.translate(-x, -y)
                    ctx.fillText(watermarkText, x, y)
                    ctx.restore()
                } else {
                    ctx.fillText(watermarkText, x, y)
                }

                // Add text stroke for better visibility
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
                ctx.lineWidth = 2
                ctx.globalAlpha = opacity / 100

                if (rotation !== 0) {
                    ctx.save()
                    ctx.translate(x, y)
                    ctx.rotate((rotation * Math.PI) / 180)
                    ctx.translate(-x, -y)
                    ctx.strokeText(watermarkText, x, y)
                    ctx.restore()
                } else {
                    ctx.strokeText(watermarkText, x, y)
                }

                canvas.toBlob((blob) => {
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

    const handleDownload = () => {
        if (!processedUrl) return

        const link = document.createElement('a')
        link.href = processedUrl
        link.download = `watermarked-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="max-w-full sm:max-w-6xl mx-auto px-4">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('title')}</h1>
                <p className="text-sm sm:text-base text-neutral-600">{t('description')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="tool-card p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        {t('uploadAndSettings')}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                {t('selectImage')}
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
                                {t('selectImage')}
                            </button>
                            {originalFile && (
                                <div className="mt-2 text-xs sm:text-sm text-neutral-600 break-words">
                                    {originalFile.name}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                {t('watermarkText')}
                            </label>
                            <input
                                type="text"
                                value={watermarkText}
                                onChange={(e) => setWatermarkText(e.target.value)}
                                placeholder={t('watermarkTextPlaceholder')}
                                className="input-field w-full min-h-[44px] text-sm sm:text-base"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                {t('textColor')}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={textColor}
                                    onChange={(e) => setTextColor(e.target.value)}
                                    className="w-12 sm:w-16 h-10 cursor-pointer rounded border border-neutral-300 flex-shrink-0"
                                />
                                <input
                                    type="text"
                                    value={textColor}
                                    onChange={(e) => setTextColor(e.target.value)}
                                    className="input-field flex-1 font-mono text-sm sm:text-base min-h-[44px]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                {t('textSize')}: {textSize}px
                            </label>
                            <input
                                type="range"
                                min="12"
                                max="200"
                                value={textSize}
                                onChange={(e) => setTextSize(parseInt(e.target.value))}
                                className="w-full h-2 accent-primary-500"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                {t('opacity')}: {opacity}%
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={opacity}
                                onChange={(e) => setOpacity(parseInt(e.target.value))}
                                className="w-full h-2 accent-primary-500"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                {t('position')}
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'] as const).map((pos) => (
                                    <button
                                        key={pos}
                                        onClick={() => setPosition(pos)}
                                        className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${
                                            position === pos
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                        }`}
                                    >
                                        {t(`positions.${pos}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                {t('rotation')}: {rotation}°
                            </label>
                            <input
                                type="range"
                                min="-180"
                                max="180"
                                value={rotation}
                                onChange={(e) => setRotation(parseInt(e.target.value))}
                                className="w-full h-2 accent-primary-500"
                            />
                        </div>

                        <button
                            onClick={applyWatermark}
                            disabled={!originalFile || !watermarkText.trim() || isProcessing}
                            className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('processing')}
                                </>
                            ) : (
                                <>
                                    <Type className="w-4 h-4" />
                                    {t('applyWatermark')}
                                </>
                            )}
                        </button>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800">
                            💡 <strong>{t('tipsLabel')}:</strong> {t('tips')}
                        </div>
                    </div>
                </div>

                <div className="tool-card p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        {t('previewAndDownload')}
                    </h3>

                    {preview ? (
                        <div className="space-y-4">
                            <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200">
                                <div className="text-xs text-neutral-600 mb-2">{t('original')}</div>
                                <img src={preview} alt={t('original')} className="max-w-full h-auto rounded" />
                            </div>

                            {processedUrl && (
                                <>
                                    <div className="bg-primary-50 p-3 sm:p-4 rounded-lg border border-primary-200">
                                        <div className="text-xs text-neutral-600 mb-2">{t('watermarked')}</div>
                                        <img src={processedUrl} alt={t('processed')} className="max-w-full h-auto rounded" />
                                    </div>
                                    <button
                                        onClick={handleDownload}
                                        className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
                                    >
                                        <Download className="w-4 h-4" />
                                        {t('downloadImage')}
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[250px] sm:min-h-[300px] text-neutral-400">
                            <div className="text-center">
                                <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-xs sm:text-sm">{t('selectImageToStart')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

