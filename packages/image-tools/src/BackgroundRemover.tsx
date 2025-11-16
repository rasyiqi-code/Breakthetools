'use client'

import { useState, useRef } from 'react'
import { Upload, Download, Image as ImageIcon, FileImage, Wand2, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { removeByColor, removeByEdge, removeAuto } from './utils/backgroundRemovalAlgorithms'
import { hexToRgb } from './utils/backgroundRemovalUtils'

export function BackgroundRemover() {
    const t = useTranslations('tools.backgroundRemover')
    const [originalFile, setOriginalFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string>('')
    const [processedUrl, setProcessedUrl] = useState<string>('')
    const [removalMode, setRemovalMode] = useState<'auto' | 'color' | 'edge'>('auto')
    const [targetColor, setTargetColor] = useState('#ffffff')
    const [tolerance, setTolerance] = useState(30)
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

    const removeBackground = () => {
        if (!preview) {
            alert(t('errors.noFileSelected'))
            return
        }

        setIsProcessing(true)

        // Use setTimeout to allow UI to update
        setTimeout(() => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d', { willReadFrequently: true })
                if (!ctx) {
                    setIsProcessing(false)
                    return
                }

                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0)

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const pixels = imageData.data
                const width = canvas.width
                const height = canvas.height

                // Apply removal algorithm based on mode
                if (removalMode === 'color') {
                    const targetColorRgb = hexToRgb(targetColor)
                    removeByColor(pixels, width, height, targetColorRgb, tolerance)
                } else if (removalMode === 'edge') {
                    removeByEdge(pixels, width, height)
                } else {
                    removeAuto(pixels, width, height)
                }

                ctx.putImageData(imageData, 0, 0)
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
        link.download = `background-removed-${Date.now()}.png`
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
                        {t('uploadAndProcess')}
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
                                {t('removalMode')}
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                {(['auto', 'color', 'edge'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setRemovalMode(mode)}
                                        className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${removalMode === mode
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                            }`}
                                    >
                                        {t(`modes.${mode}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {removalMode === 'color' && (
                            <div>
                                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                    {t('targetColor')}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={targetColor}
                                        onChange={(e) => setTargetColor(e.target.value)}
                                        className="w-12 sm:w-16 h-10 cursor-pointer rounded border border-neutral-300 flex-shrink-0"
                                    />
                                    <input
                                        type="text"
                                        value={targetColor}
                                        onChange={(e) => setTargetColor(e.target.value)}
                                        className="input-field flex-1 font-mono text-sm sm:text-base min-h-[44px]"
                                    />
                                </div>
                                <div className="mt-2">
                                    <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                        {t('tolerance')}: {tolerance}
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={tolerance}
                                        onChange={(e) => setTolerance(parseInt(e.target.value))}
                                        className="w-full h-2 accent-primary-500"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={removeBackground}
                            disabled={!originalFile || isProcessing}
                            className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('processing')}
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4" />
                                    {t('removeBackground')}
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
                                        <div className="text-xs text-neutral-600 mb-2">{t('backgroundRemoved')}</div>
                                        <div className="bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=')] p-2 rounded">
                                            <img src={processedUrl} alt={t('processed')} className="max-w-full h-auto rounded" />
                                        </div>
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

