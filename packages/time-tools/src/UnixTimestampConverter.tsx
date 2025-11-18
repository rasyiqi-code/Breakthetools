'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, Copy, Check, Calendar, Hash, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

type ConversionType = 'timestamp-to-date' | 'date-to-timestamp'

interface ConversionResult {
    timestamp: number
    dateLocal: string
    dateUTC: string
    dateISO: string
    readableFormat: string
}

export function UnixTimestampConverter() {
    const t = useTranslations('tools')

    const [conversionType, setConversionType] = useState<ConversionType>('timestamp-to-date')
    const [timestampInput, setTimestampInput] = useState('')
    const [dateInput, setDateInput] = useState('')
    const [result, setResult] = useState<ConversionResult | null>(null)
    const [copied, setCopied] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleTimestampToDate = useCallback((timestampStr: string) => {
        setError(null)
        
        if (!timestampStr.trim()) {
            setResult(null)
            return
        }

        // Handle milliseconds timestamp (13 digits)
        let timestamp = parseInt(timestampStr)
        if (timestampStr.length > 10) {
            timestamp = Math.floor(timestamp / 1000)
        }

        if (isNaN(timestamp) || timestamp < 0) {
            setError(t('unixTimestampConverter.errors.invalidTimestamp'))
            setResult(null)
            return
        }

        // Check if timestamp is in reasonable range (before 1970 or too far in future)
        const maxTimestamp = 4102444800 // Year 2100
        if (timestamp > maxTimestamp) {
            setError(t('unixTimestampConverter.errors.timestampTooLarge'))
            setResult(null)
            return
        }

        try {
            const date = new Date(timestamp * 1000)
            
            if (isNaN(date.getTime())) {
                setError(t('unixTimestampConverter.errors.invalidTimestamp'))
                setResult(null)
                return
            }

            // Local date
            const localDate = date.toLocaleString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'local'
            })

            // UTC date
            const utcDate = date.toUTCString()

            // ISO date
            const isoDate = date.toISOString()

            // Readable format
            const readableFormat = date.toLocaleString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            })

            setResult({
                timestamp,
                dateLocal: localDate,
                dateUTC: utcDate,
                dateISO: isoDate,
                readableFormat
            })
        } catch (err) {
            setError(t('unixTimestampConverter.errors.invalidTimestamp'))
            setResult(null)
        }
    }, [t])

    const handleDateToTimestamp = useCallback((dateStr: string) => {
        setError(null)
        
        if (!dateStr.trim()) {
            setResult(null)
            return
        }

        try {
            let date: Date

            // Try to parse the date string
            if (dateStr.includes('T')) {
                // ISO format
                date = new Date(dateStr)
            } else {
                // Try local date format
                date = new Date(dateStr)
            }

            if (isNaN(date.getTime())) {
                setError(t('unixTimestampConverter.errors.invalidDate'))
                setResult(null)
                return
            }

            const timestamp = Math.floor(date.getTime() / 1000)

            // Local date
            const localDate = date.toLocaleString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'local'
            })

            // UTC date
            const utcDate = date.toUTCString()

            // ISO date
            const isoDate = date.toISOString()

            // Readable format
            const readableFormat = date.toLocaleString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            })

            setResult({
                timestamp,
                dateLocal: localDate,
                dateUTC: utcDate,
                dateISO: isoDate,
                readableFormat
            })
        } catch (err) {
            setError(t('unixTimestampConverter.errors.invalidDate'))
            setResult(null)
        }
    }, [t])

    // Auto-update current timestamp every second
    useEffect(() => {
        if (conversionType === 'timestamp-to-date' && !timestampInput) {
            const updateCurrent = () => {
                const now = Math.floor(Date.now() / 1000)
                setTimestampInput(now.toString())
                handleTimestampToDate(now.toString())
            }
            updateCurrent()
            const interval = setInterval(updateCurrent, 1000)
            return () => clearInterval(interval)
        }
    }, [conversionType, timestampInput, handleTimestampToDate])

    // Auto-convert when timestampInput changes
    useEffect(() => {
        if (conversionType === 'timestamp-to-date' && timestampInput) {
            handleTimestampToDate(timestampInput)
        }
    }, [timestampInput, conversionType, handleTimestampToDate])

    // Auto-convert when dateInput changes
    useEffect(() => {
        if (conversionType === 'date-to-timestamp' && dateInput) {
            handleDateToTimestamp(dateInput)
        }
    }, [dateInput, conversionType, handleDateToTimestamp])

    const handleCopy = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(type)
            setTimeout(() => setCopied(null), 2000)
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('unixTimestampConverter.textarea')
            textarea.value = text
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            setCopied(type)
            setTimeout(() => setCopied(null), 2000)
        }
    }

    const handleCurrentTimestamp = () => {
        const now = Math.floor(Date.now() / 1000)
        setTimestampInput(now.toString())
        handleTimestampToDate(now.toString())
    }

    const handleCurrentDate = () => {
        const now = new Date()
        const dateStr = now.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
        setDateInput(dateStr)
        handleDateToTimestamp(dateStr)
    }

    return (
        <div className="max-w-full sm:max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <Clock className="w-6 h-6 text-primary-600" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                            {t('unixTimestampConverter.title')}
                        </h1>
                    </div>
                    <p className="text-sm sm:text-base text-neutral-600">
                        {t('unixTimestampConverter.description')}
                    </p>
                </div>

                {/* Conversion Type Selector */}
                <div className="flex gap-2 p-1 bg-neutral-100 rounded-lg">
                    <button
                        onClick={() => {
                            setConversionType('timestamp-to-date')
                            setResult(null)
                            setError(null)
                        }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            conversionType === 'timestamp-to-date'
                                ? 'bg-white text-primary-700 shadow-sm'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        {t('unixTimestampConverter.timestampToDate')}
                    </button>
                    <button
                        onClick={() => {
                            setConversionType('date-to-timestamp')
                            setResult(null)
                            setError(null)
                        }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            conversionType === 'date-to-timestamp'
                                ? 'bg-white text-primary-700 shadow-sm'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        {t('unixTimestampConverter.dateToTimestamp')}
                    </button>
                </div>

                {/* Input Section */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-700">
                            {conversionType === 'timestamp-to-date' ? t('unixTimestampConverter.enterTimestamp') : t('unixTimestampConverter.enterDate')}
                        </label>
                        
                        {conversionType === 'timestamp-to-date' ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={timestampInput}
                                    onChange={(e) => setTimestampInput(e.target.value)}
                                    placeholder={t('unixTimestampConverter.timestampPlaceholder')}
                                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleCurrentTimestamp}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                                    title={t('unixTimestampConverter.useCurrentTimestamp')}
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="datetime-local"
                                    value={dateInput}
                                    onChange={(e) => setDateInput(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleCurrentDate}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                                    title={t('unixTimestampConverter.useCurrentDate')}
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Result Section */}
                {result && (
                    <div className="space-y-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                        <div className="flex items-center gap-2">
                            <Hash className="w-5 h-5 text-primary-600" />
                            <h2 className="text-lg font-semibold text-primary-900">
                                {t('unixTimestampConverter.result')}
                            </h2>
                        </div>

                        {/* Timestamp */}
                        {conversionType === 'date-to-timestamp' && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-neutral-700">
                                        {t('unixTimestampConverter.unixTimestamp')}
                                    </label>
                                    <button
                                        onClick={() => handleCopy(result.timestamp.toString(), 'timestamp')}
                                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        {copied === 'timestamp' ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                {t('unixTimestampConverter.copied')}
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                {t('unixTimestampConverter.copy')}
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="p-3 bg-white rounded border border-neutral-200 font-mono text-lg">
                                    {result.timestamp}
                                </div>
                            </div>
                        )}

                        {/* Date Formats */}
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {t('unixTimestampConverter.localDate')}
                                    </label>
                                    <button
                                        onClick={() => handleCopy(result.dateLocal, 'local')}
                                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        {copied === 'local' ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                {t('unixTimestampConverter.copied')}
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                {t('unixTimestampConverter.copy')}
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="p-3 bg-white rounded border border-neutral-200 text-sm">
                                    {result.dateLocal}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-neutral-700">
                                        {t('unixTimestampConverter.utcDate')}
                                    </label>
                                    <button
                                        onClick={() => handleCopy(result.dateUTC, 'utc')}
                                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        {copied === 'utc' ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                {t('unixTimestampConverter.copied')}
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                {t('unixTimestampConverter.copy')}
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="p-3 bg-white rounded border border-neutral-200 text-sm font-mono">
                                    {result.dateUTC}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-neutral-700">
                                        {t('unixTimestampConverter.isoDate')}
                                    </label>
                                    <button
                                        onClick={() => handleCopy(result.dateISO, 'iso')}
                                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        {copied === 'iso' ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                {t('unixTimestampConverter.copied')}
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                {t('unixTimestampConverter.copy')}
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="p-3 bg-white rounded border border-neutral-200 text-sm font-mono">
                                    {result.dateISO}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">
                                    {t('unixTimestampConverter.readableFormat')}
                                </label>
                                <div className="p-3 bg-white rounded border border-neutral-200 text-sm">
                                    {result.readableFormat}
                                </div>
                            </div>
                        </div>

                        {/* Timestamp (if converting from date) */}
                        {conversionType === 'timestamp-to-date' && (
                            <div className="space-y-2 pt-2 border-t border-primary-200">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                                        <Hash className="w-4 h-4" />
                                        {t('unixTimestampConverter.unixTimestamp')}
                                    </label>
                                    <button
                                        onClick={() => handleCopy(result.timestamp.toString(), 'timestamp')}
                                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        {copied === 'timestamp' ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                {t('unixTimestampConverter.copied')}
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                {t('unixTimestampConverter.copy')}
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="p-3 bg-white rounded border border-neutral-200 font-mono text-lg">
                                    {result.timestamp}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tips */}
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                        {t('unixTimestampConverter.tipsLabel')}
                    </h3>
                    <p className="text-sm text-neutral-600">
                        {t('unixTimestampConverter.tips')}
                    </p>
                </div>
            </div>
        </div>
    )
}

