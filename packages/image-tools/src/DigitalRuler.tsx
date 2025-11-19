'use client'

import { useState, useRef, useEffect } from 'react'
import { Ruler, RotateCw, Maximize2, Minimize2, Settings, Info, RotateCcw } from 'lucide-react'

export function DigitalRuler() {

    const [unit, setUnit] = useState<'cm' | 'in'>('cm')
    const [dpi, setDpi] = useState(96) // Default DPI
    const [rulerLength, setRulerLength] = useState(15) // Default 15cm or 6in
    const rulerRef = useRef<HTMLDivElement>(null)
    const fullscreenRef = useRef<HTMLDivElement>(null)
    const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal')
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Auto-detect DPI on mount
    useEffect(() => {
        const autoDetectDPI = () => {
            // Method 1: Use devicePixelRatio to estimate DPI
            const devicePixelRatio = window.devicePixelRatio || 1
            const screenWidth = window.screen.width
            const screenHeight = window.screen.height

            // Common device DPI estimations
            // Desktop/Laptop: typically 72-96 DPI
            // High-DPI displays: 120-150 DPI
            // Mobile: 160-320 DPI
            // Tablets: 132-264 DPI

            let estimatedDPI = 96 // Default

            if (typeof window.screen.orientation !== 'undefined' || typeof (window as any).screen.orientation !== 'undefined') {
                // Try to detect based on screen size and pixel ratio
                const isMobile = screenWidth < 768 || screenHeight < 768
                const isTablet = (screenWidth >= 768 && screenWidth < 1024) || (screenHeight >= 768 && screenHeight < 1024)

                if (isMobile) {
                    // Mobile devices typically have higher DPI
                    estimatedDPI = devicePixelRatio >= 2 ? 144 : 96
                } else if (isTablet) {
                    // Tablets vary, but often around 132-150
                    estimatedDPI = devicePixelRatio >= 2 ? 132 : 96
                } else {
                    // Desktop/Laptop
                    if (devicePixelRatio >= 2) {
                        // Retina/high-DPI display
                        estimatedDPI = 120
                    } else {
                        // Standard display
                        estimatedDPI = 96
                    }
                }
            }

            setDpi(estimatedDPI)
        }

        autoDetectDPI()
    }, [])

    // Conversion: 1 inch = 2.54 cm
    // Standard DPI: 96 DPI means 1 inch = 96 pixels
    // Therefore: 1 cm = 96 / 2.54 ≈ 37.8 pixels at 96 DPI

    const getPixelsPerUnit = () => {
        if (unit === 'cm') {
            return dpi / 2.54 // pixels per cm
        } else {
            return dpi // pixels per inch
        }
    }

    const pixelsPerUnit = getPixelsPerUnit()

    // Auto-calculate ruler length to fit screen in fullscreen mode
    const getScreenSize = () => {
        if (isFullscreen && fullscreenRef.current) {
            const rect = fullscreenRef.current.getBoundingClientRect()
            return {
                width: rect.width || window.innerWidth,
                height: rect.height || window.innerHeight
            }
        }
        return {
            width: window.innerWidth,
            height: window.innerHeight
        }
    }

    const screenSize = getScreenSize()
    const maxScreenSize = orientation === 'horizontal'
        ? screenSize.width - 40 // Padding
        : screenSize.height - 40

    const calculatedRulerLength = Math.floor(maxScreenSize / pixelsPerUnit)
    const currentRulerLength = isFullscreen
        ? Math.min(rulerLength, calculatedRulerLength)
        : rulerLength

    const rulerPixels = currentRulerLength * pixelsPerUnit

    // Fullscreen handlers - menggunakan state-based fullscreen (custom overlay)
    const handleFullscreen = () => {
        const willBeFullscreen = !isFullscreen
        setIsFullscreen(willBeFullscreen)

        if (willBeFullscreen) {
            // Entering fullscreen - auto-adjust ruler length to fit screen
            setTimeout(() => {
                const width = window.innerWidth
                const height = window.innerHeight
                const pixelsPerUnit = getPixelsPerUnit()
                const maxLength = orientation === 'horizontal'
                    ? Math.floor((width - 40) / pixelsPerUnit)
                    : Math.floor((height - 40) / pixelsPerUnit)
                setRulerLength(prev => Math.min(prev, maxLength))
            }, 100)

            // Prevent body scroll when in fullscreen
            document.body.style.overflow = 'hidden'
        } else {
            // Exiting fullscreen - restore body scroll
            document.body.style.overflow = ''
        }
    }

    // Handle ESC key to exit fullscreen
    useEffect(() => {
        if (!isFullscreen) return

        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsFullscreen(false)
                document.body.style.overflow = ''
            }
        }

        document.addEventListener('keydown', handleKeyPress)
        return () => document.removeEventListener('keydown', handleKeyPress)
    }, [isFullscreen])

    // Auto-adjust ruler length when orientation or unit changes in fullscreen
    useEffect(() => {
        if (isFullscreen) {
            const width = window.innerWidth
            const height = window.innerHeight
            const pixelsPerUnit = getPixelsPerUnit()

            const maxLength = orientation === 'horizontal'
                ? Math.floor((width - 40) / pixelsPerUnit)
                : Math.floor((height - 40) / pixelsPerUnit)

            setRulerLength(prev => {
                const newLength = Math.min(prev, maxLength)
                return newLength !== prev ? newLength : prev
            })
        }
    }, [orientation, isFullscreen, unit, dpi])

    // Auto-calibrate button
    const handleAutoCalibrate = () => {
        // Use devicePixelRatio to better estimate DPI
        const devicePixelRatio = window.devicePixelRatio || 1
        const baseDPI = 96

        // More accurate estimation based on common device types
        const screenWidth = window.screen.width
        const screenHeight = window.screen.height
        const isMobile = screenWidth < 768 || screenHeight < 768
        const isTablet = (screenWidth >= 768 && screenWidth < 1024) || (screenHeight >= 768 && screenHeight < 1024)

        let newDPI = baseDPI

        if (isMobile) {
            // Mobile: typically 160-320 DPI, but CSS pixels are different
            newDPI = devicePixelRatio >= 3 ? 144 : devicePixelRatio >= 2 ? 132 : 96
        } else if (isTablet) {
            // Tablet: typically 132-264 DPI
            newDPI = devicePixelRatio >= 2 ? 132 : 96
        } else {
            // Desktop
            newDPI = devicePixelRatio >= 2 ? 120 : 96
        }

        setDpi(newDPI)
        alert(`Auto-calibrated to ${newDPI} DPI based on your device. For more accuracy, use manual calibration with a credit card.`)
    }

    // Calibration using known object (like credit card)
    const handleCalibration = () => {
        const creditCardWidthCM = 8.56
        const creditCardWidthIN = 3.375

        alert(`Place a credit card (${unit === 'cm' ? creditCardWidthCM : creditCardWidthIN} ${unit} wide) on your screen and adjust the DPI slider until the ruler matches the card width.`)
    }

    // Render ruler marks
    const renderRulerMarks = () => {
        const marks: JSX.Element[] = []
        const pixelsPerUnit = getPixelsPerUnit()
        const majorInterval = 1 // 1 cm or 1 inch
        const minorInterval = unit === 'cm' ? 0.1 : 0.125 // 0.1 cm or 1/8 inch

        const totalUnits = currentRulerLength
        const majorMarkSpacing = majorInterval * pixelsPerUnit
        const minorMarkSpacing = minorInterval * pixelsPerUnit

        const isLarge = isFullscreen
        const markHeight = isLarge ? (orientation === 'horizontal' ? 'h-16' : 'w-16') : (orientation === 'horizontal' ? 'h-10' : 'w-10')
        const textSize = isLarge ? 'text-base' : 'text-xs'
        const textWeight = isLarge ? 'font-bold' : 'font-semibold'

        for (let i = 0; i <= totalUnits; i++) {
            const position = i * majorMarkSpacing
            const value = i

            // Major marks (long lines with numbers)
            marks.push(
                <div
                    key={`major-${i}`}
                    className={`absolute ${orientation === 'horizontal' ? 'w-0.5' : 'h-0.5'} ${markHeight} bg-neutral-900 z-10`}
                    style={
                        orientation === 'horizontal'
                            ? { left: `${position}px`, top: '0' }
                            : { top: `${position}px`, left: '0' }
                    }
                >
                    <div
                        className={`absolute ${orientation === 'horizontal' ? `${isLarge ? 'top-16' : 'top-10'} left-1/2 -translate-x-1/2` : `${isLarge ? '-left-16' : '-left-12'} top-1/2 -translate-y-1/2`} ${textSize} ${textWeight} text-neutral-900 whitespace-nowrap`}
                    >
                        {value}
                    </div>
                </div>
            )

            // Minor marks (short lines between major marks)
            if (i < totalUnits) {
                const minorMarksCount = unit === 'cm' ? 9 : 7 // 9 minor marks for cm (0.1 each), 7 for inch (1/8 each)
                for (let j = 1; j <= minorMarksCount; j++) {
                    const minorPosition = position + j * minorMarkSpacing
                    if (minorPosition <= rulerPixels) {
                        const isMidMark = unit === 'cm' ? j === 5 : j === 4
                        const minorHeight = isLarge
                            ? (isMidMark ? (orientation === 'horizontal' ? 'h-10' : 'w-10') : (orientation === 'horizontal' ? 'h-8' : 'w-8'))
                            : (isMidMark ? (orientation === 'horizontal' ? 'h-6' : 'w-6') : (orientation === 'horizontal' ? 'h-4' : 'w-4'))
                        marks.push(
                            <div
                                key={`minor-${i}-${j}`}
                                className={`absolute ${orientation === 'horizontal' ? 'w-0.5' : 'h-0.5'} ${minorHeight} bg-neutral-600 z-10`}
                                style={
                                    orientation === 'horizontal'
                                        ? { left: `${minorPosition}px`, top: '0' }
                                        : { top: `${minorPosition}px`, left: '0' }
                                }
                            />
                        )
                    }
                }
            }
        }

        return marks
    }

    const rulerContent = (
        <div className="bg-white rounded-lg border-2 border-neutral-300 p-4 sm:p-6 overflow-auto">
            <div
                ref={rulerRef}
                className={`relative bg-gradient-to-b from-neutral-50 to-neutral-100 border-2 border-neutral-400 rounded ${orientation === 'horizontal'
                    ? 'w-full min-h-[60px]'
                    : 'h-[500px] min-w-[60px] mx-auto'
                    }`}
                style={{
                    [orientation === 'horizontal' ? 'width' : 'height']: `${rulerPixels}px`,
                    [orientation === 'horizontal' ? 'minHeight' : 'minWidth']: '60px'
                }}
            >
                {/* Ruler background with alternating pattern */}
                <div
                    className={`absolute inset-0 ${orientation === 'horizontal' ? 'w-full h-10' : 'w-10 h-full'} bg-white border-b-2 ${orientation === 'horizontal' ? '' : 'border-r-2'} border-neutral-400`}
                />

                {/* Ruler marks */}
                {renderRulerMarks()}

                {/* Unit label */}
                <div
                    className={`absolute ${orientation === 'horizontal' ? 'bottom-2 right-2' : 'top-2 left-12'} text-xs font-semibold text-neutral-700 bg-white px-2 py-1 rounded border border-neutral-300`}
                >
                    {unit.toUpperCase()}
                </div>
            </div>

            <div className="mt-4 text-center">
                <p className="text-xs sm:text-sm text-neutral-600">
                    Measure physical objects by placing them on your screen. Adjust DPI for accuracy.
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                    Current size: {currentRulerLength || rulerLength} {unit}
                </p>
            </div>
        </div>
    )

    if (isFullscreen) {
        return (
            <div
                ref={fullscreenRef}
                className="fixed inset-0 bg-neutral-50 z-[9999] flex items-center justify-center"
                style={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
                {/* Floating controls - top left */}
                <div className="fixed top-4 left-4 z-10 flex flex-col gap-2">
                    {/* Unit toggle */}
                    <div className="flex gap-1 bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-xl border border-neutral-200">
                        {(['cm', 'in'] as const).map((u) => (
                            <button
                                key={u}
                                onClick={() => {
                                    setUnit(u)
                                    const width = window.innerWidth
                                    const height = window.innerHeight
                                    const pixelsPerUnit = u === 'cm' ? (dpi / 2.54) : dpi
                                    const maxLength = orientation === 'horizontal'
                                        ? Math.floor((width - 40) / pixelsPerUnit)
                                        : Math.floor((height - 40) / pixelsPerUnit)
                                    setRulerLength(Math.min(rulerLength, maxLength))
                                }}
                                className={`px-3 py-2 rounded-md text-xs font-semibold transition-all ${unit === u
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'text-neutral-600 hover:bg-neutral-100'
                                    }`}
                            >
                                {u.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Orientation toggle */}
                    <div className="flex gap-1 bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-xl border border-neutral-200">
                        {(['horizontal', 'vertical'] as const).map((o) => (
                            <button
                                key={o}
                                onClick={() => setOrientation(o)}
                                className={`px-3 py-2 rounded-md text-xs font-semibold transition-all ${orientation === o
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'text-neutral-600 hover:bg-neutral-100'
                                    }`}
                            >
                                {o === 'horizontal' ? '⇄' : '⇅'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Exit button - top right */}
                <button
                    onClick={handleFullscreen}
                    className="fixed top-4 right-4 z-10 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold transition-all shadow-xl hover:shadow-2xl border border-red-400"
                    title="Exit Fullscreen"
                >
                    <Minimize2 className="w-4 h-4 inline mr-2" />
                    Exit Fullscreen
                </button>

                {/* Fullscreen ruler - centered dengan spacing yang baik */}
                <div
                    ref={rulerRef}
                    className={`relative ${orientation === 'horizontal'
                        ? 'w-full min-h-[120px]'
                        : 'h-full min-w-[120px]'
                        }`}
                    style={{
                        [orientation === 'horizontal' ? 'width' : 'height']: `${rulerPixels}px`,
                        [orientation === 'horizontal' ? 'minHeight' : 'minWidth']: '120px',
                        maxWidth: orientation === 'horizontal' ? '100vw' : '100vw',
                        maxHeight: orientation === 'vertical' ? '100vh' : '100vh'
                    }}
                >
                    {/* Ruler background - clean white dengan border */}
                    <div
                        className={`absolute inset-0 ${orientation === 'horizontal' ? 'w-full h-20' : 'w-20 h-full'
                            } bg-white border-2 ${orientation === 'horizontal' ? 'border-b-4' : 'border-r-4'} border-neutral-600 shadow-inner`}
                    />

                    {/* Ruler marks - larger in fullscreen */}
                    {renderRulerMarks()}

                    {/* Unit label - subtle di corner */}
                    <div
                        className={`absolute ${orientation === 'horizontal'
                            ? 'bottom-3 right-3'
                            : 'top-3 left-24'
                            } text-sm font-semibold text-neutral-500 bg-neutral-100/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-neutral-300`}
                    >
                        {unit.toUpperCase()}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-full sm:max-w-6xl mx-auto px-4">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Digital Ruler</h1>
                <p className="text-sm sm:text-base text-neutral-600">Measure physical objects by placing them on your screen - Perfect for when you forget to bring a ruler</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="tool-card p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        Settings
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                Unit
                            </label>
                            <div className="flex gap-2">
                                {(['cm', 'in'] as const).map((u) => (
                                    <button
                                        key={u}
                                        onClick={() => {
                                            setUnit(u)
                                            setRulerLength(u === 'cm' ? 15 : 6) // Default length
                                        }}
                                        className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${unit === u
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                            }`}
                                    >
                                        {u.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                Orientation
                            </label>
                            <div className="flex gap-2">
                                {(['horizontal', 'vertical'] as const).map((o) => (
                                    <button
                                        key={o}
                                        onClick={() => setOrientation(o)}
                                        className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${orientation === o
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                            }`}
                                    >
                                        {o === 'horizontal' ? 'Horizontal' : 'Vertical'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                Ruler Length: {rulerLength} {unit}
                            </label>
                            <input
                                type="range"
                                min={unit === 'cm' ? 5 : 2}
                                max={unit === 'cm' ? 30 : 12}
                                value={rulerLength}
                                onChange={(e) => setRulerLength(parseInt(e.target.value))}
                                className="w-full h-2 accent-primary-500"
                            />
                            <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                <span>{unit === 'cm' ? '5 cm' : '2 in'}</span>
                                <span>{unit === 'cm' ? '30 cm' : '12 in'}</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                Screen DPI: {dpi} DPI
                            </label>
                            <input
                                type="range"
                                min="72"
                                max="150"
                                value={dpi}
                                onChange={(e) => setDpi(parseInt(e.target.value))}
                                className="w-full h-2 accent-primary-500"
                            />
                            <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                <span>72 DPI</span>
                                <span>150 DPI</span>
                            </div>
                            <p className="text-xs text-neutral-600 mt-2">
                                Adjust DPI to match your screen for accurate measurements. Use auto-calibrate or manual calibration with a credit card.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleAutoCalibrate}
                                className="flex-1 py-2 sm:py-3 px-4 rounded-lg font-medium transition-colors min-h-[44px] text-sm sm:text-base bg-primary-600 text-white hover:bg-primary-700"
                            >
                                <RotateCcw className="w-4 h-4 inline mr-2" />
                                Auto Calibrate
                            </button>
                            <button
                                onClick={handleCalibration}
                                className="flex-1 py-2 sm:py-3 px-4 rounded-lg font-medium transition-colors min-h-[44px] text-sm sm:text-base bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                            >
                                <Info className="w-4 h-4 inline mr-2" />
                                Calibrate
                            </button>
                        </div>

                        <button
                            onClick={handleFullscreen}
                            className="w-full py-2 sm:py-3 px-4 rounded-lg font-medium transition-colors min-h-[44px] text-sm sm:text-base bg-green-600 text-white hover:bg-green-700"
                        >
                            {isFullscreen ? (
                                <>
                                    <Minimize2 className="w-4 h-4 inline mr-2" />
                                    Exit Fullscreen
                                </>
                            ) : (
                                <>
                                    <Maximize2 className="w-4 h-4 inline mr-2" />
                                    Enter Fullscreen
                                </>
                            )}
                        </button>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800">
                            💡 <strong>Tips:</strong> Use auto-calibrate for quick setup. For precise measurements, use manual calibration with a credit card (8.56 cm or 3.375 inches wide).
                        </div>
                    </div>
                </div>

                <div className="tool-card p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        Ruler Display
                    </h3>

                    {rulerContent}
                </div>
            </div>
        </div>
    )
}
