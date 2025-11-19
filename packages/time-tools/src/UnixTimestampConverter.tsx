'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, Copy, Check, Calendar, Hash, RefreshCw } from 'lucide-react'

type ConversionType = 'timestamp-to-date' | 'date-to-timestamp'

interface ConversionResult {
    timestamp: number
    dateLocal: string
    dateUTC: string
    dateISO: string
    readableFormat: string
}

export function UnixTimestampConverter() {

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
            setError('Invalid timestamp! Please enter a valid Unix timestamp (seconds since 1970).')
            setResult(null)
            return
        }

        // Check if timestamp is in reasonable range (before 1970 or too far in future)
        const maxTimestamp = 4102444800 // Year 2100
        if (timestamp > maxTimestamp) {
            setError('Timestamp is too large! Maximum supported year is 2100.')
            setResult(null)
            return
        }

        try {
            const date = new Date(timestamp * 1000)
            
            if (isNaN(date.getTime())) {
                setError('Invalid timestamp! Please enter a valid Unix timestamp (seconds since 1970).')
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
            setError('Invalid timestamp! Please enter a valid Unix timestamp (seconds since 1970).')
            setResult(null)
        }
    }, [])

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
                setError('Invalid date format! Please enter a valid date and time.')
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
            setError('Invalid date format! Please enter a valid date and time.')
            setResult(null)
        }
    }, [])

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
            const textarea = document.createElement('textarea') as HTMLTextAreaElement
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
                            Unix Timestamp Converter
                        </h1>
                    </div>
                    <p className="text-sm sm:text-base text-neutral-600">
                        Convert between Unix timestamp and date format - Essential for developers
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
                        Timestamp to Date
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
                        Date to Timestamp
                    </button>
                </div>

                {/* Input Section */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-700">
                            {conversionType === 'timestamp-to-date' ? 'Enter Unix Timestamp' : 'Enter Date & Time'}
                        </label>
                        
                        {conversionType === 'timestamp-to-date' ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={timestampInput}
                                    onChange={(e) => setTimestampInput(e.target.value)}
                                    placeholder="e.g., 1609459200"
                                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleCurrentTimestamp}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                                    title="Use Current Timestamp"
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
                                    title="Use Current Date"
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
                                Result
                            </h2>
                        </div>

                        {/* Timestamp */}
                        {conversionType === 'date-to-timestamp' && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-neutral-700">
                                        Unix Timestamp
                                    </label>
                                    <button
                                        onClick={() => handleCopy(result.timestamp.toString(), 'timestamp')}
                                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        {copied === 'timestamp' ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
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
                                        Local Date
                                    </label>
                                    <button
                                        onClick={() => handleCopy(result.dateLocal, 'local')}
                                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        {copied === 'local' ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
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
                                        UTC Date
                                    </label>
                                    <button
                                        onClick={() => handleCopy(result.dateUTC, 'utc')}
                                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        {copied === 'utc' ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
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
                                        ISO Date
                                    </label>
                                    <button
                                        onClick={() => handleCopy(result.dateISO, 'iso')}
                                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        {copied === 'iso' ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
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
                                    Readable Format
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
                                        Unix Timestamp
                                    </label>
                                    <button
                                        onClick={() => handleCopy(result.timestamp.toString(), 'timestamp')}
                                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        {copied === 'timestamp' ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
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
                        Tips
                    </h3>
                    <p className="text-sm text-neutral-600">
                        Unix timestamp is the number of seconds since January 1, 1970 (UTC). You can enter timestamp in seconds (10 digits) or milliseconds (13 digits). The tool automatically detects and converts both formats.
                    </p>
                </div>
            </div>
        </div>
    )
}

