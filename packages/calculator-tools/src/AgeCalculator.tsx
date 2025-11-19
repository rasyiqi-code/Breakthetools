'use client'

import { useState, useEffect } from 'react'
import { Calendar, Cake, Clock, TrendingUp } from 'lucide-react'

interface AgeResult {
    years: number
    months: number
    days: number
    totalDays: number
    totalWeeks: number
    totalMonths: number
    nextBirthdayDays: number
    nextBirthdayDate: string
    zodiac?: string
    dayOfWeek: string
}

const zodiacSigns = [
    { name: 'Capricorn', start: [22, 12], end: [19, 1] },
    { name: 'Aquarius', start: [20, 1], end: [18, 2] },
    { name: 'Pisces', start: [19, 2], end: [20, 3] },
    { name: 'Aries', start: [21, 3], end: [19, 4] },
    { name: 'Taurus', start: [20, 4], end: [20, 5] },
    { name: 'Gemini', start: [21, 5], end: [20, 6] },
    { name: 'Cancer', start: [21, 6], end: [22, 7] },
    { name: 'Leo', start: [23, 7], end: [22, 8] },
    { name: 'Virgo', start: [23, 8], end: [22, 9] },
    { name: 'Libra', start: [23, 9], end: [22, 10] },
    { name: 'Scorpio', start: [23, 10], end: [21, 11] },
    { name: 'Sagittarius', start: [22, 11], end: [21, 12] }
]

const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

const getZodiacSign = (day: number, month: number): string => {
    for (const sign of zodiacSigns) {
        const [startDay, startMonth] = sign.start
        const [endDay, endMonth] = sign.end

        if (month === startMonth - 1) {
            if (day >= startDay) return sign.name
        } else if (month === endMonth - 1) {
            if (day <= endDay) return sign.name
        }
    }
    return 'Capricorn'
}

export function AgeCalculator() {

    const [birthDate, setBirthDate] = useState('')
    const [result, setResult] = useState<AgeResult | null>(null)

    const calculateAge = () => {
        if (!birthDate) {
            alert('Please enter your birth date!')
            return
        }

        const birth = new Date(birthDate)
        const now = new Date()

        if (birth > now) {
            alert('Birth date cannot be in the future!')
            return
        }

        // Calculate age
        let years = now.getFullYear() - birth.getFullYear()
        let months = now.getMonth() - birth.getMonth()
        let days = now.getDate() - birth.getDate()

        if (days < 0) {
            months--
            const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
            days += lastMonth.getDate()
        }

        if (months < 0) {
            years--
            months += 12
        }

        // Calculate total days
        const diffTime = now.getTime() - birth.getTime()
        const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        const totalWeeks = Math.floor(totalDays / 7)
        const totalMonths = years * 12 + months

        // Calculate next birthday
        const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
        if (nextBirthday < now) {
            nextBirthday.setFullYear(now.getFullYear() + 1)
        }
        const nextBirthdayDays = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Get zodiac sign
        const zodiac = getZodiacSign(birth.getDate(), birth.getMonth())

        // Get day of week
        const dayOfWeek = dayNames[birth.getDay()]

        setResult({
            years,
            months,
            days,
            totalDays,
            totalWeeks,
            totalMonths,
            nextBirthdayDays,
            nextBirthdayDate: nextBirthday.toLocaleDateString(),
            zodiac,
            dayOfWeek
        })
    }

    // Auto-calculate on date change
    useEffect(() => {
        if (birthDate) {
            calculateAge()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [birthDate])

    // Set default date (today - 25 years)
    useEffect(() => {
        const defaultDate = new Date()
        defaultDate.setFullYear(defaultDate.getFullYear() - 25)
        setBirthDate(defaultDate.toISOString().split('T')[0])
    }, [])

    return (
        <div className="max-w-full sm:max-w-6xl mx-auto px-4">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Age Calculator</h1>
                <p className="text-sm sm:text-base text-neutral-600">Calculate your exact age from birth date with detailed breakdown</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="tool-card p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        Input
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                Birth Date
                            </label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="input-field text-sm sm:text-base min-h-[44px] w-full"
                            />
                            <p className="text-xs text-neutral-500 mt-1">Select your date of birth</p>
                        </div>

                        <button
                            onClick={calculateAge}
                            className="btn-primary w-full min-h-[44px] text-sm sm:text-base"
                        >
                            <Cake className="w-4 h-4 inline mr-2" />
                            Calculate Age
                        </button>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800">
                            💡 <strong>Tips:</strong> This calculator shows your exact age including years, months, and days. It also displays your next birthday countdown and zodiac sign.
                        </div>
                    </div>
                </div>

                <div className="tool-card p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        Result
                    </h3>

                    {result ? (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Main Age Display */}
                            <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-lg p-4 sm:p-6 text-center">
                                <div className="text-xs sm:text-sm text-primary-700 mb-2 font-medium">
                                    Your Age
                                </div>
                                <div className="text-3xl sm:text-4xl font-bold text-primary-900 mb-1">
                                    {result.years} Years
                                </div>
                                <div className="text-base sm:text-lg text-primary-700">
                                    {result.months} Months, {result.days} Days
                                </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                                    <span className="text-sm font-medium text-neutral-700">Total Days</span>
                                    <span className="text-lg font-bold text-neutral-900">{result.totalDays.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                                    <span className="text-sm font-medium text-neutral-700">Total Weeks</span>
                                    <span className="text-lg font-bold text-neutral-900">{result.totalWeeks.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                                    <span className="text-sm font-medium text-neutral-700">Total Months</span>
                                    <span className="text-lg font-bold text-neutral-900">{result.totalMonths.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Next Birthday */}
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg p-4 sm:p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-5 h-5 text-yellow-600" />
                                    <h4 className="font-semibold text-yellow-900">Next Birthday</h4>
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-yellow-900 mb-1">
                                    {result.nextBirthdayDays} Days Left
                                </div>
                                <div className="text-sm text-yellow-700">
                                    On {result.nextBirthdayDate}
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                    <div className="text-xs text-neutral-500 mb-1">Day of Week</div>
                                    <div className="text-sm font-semibold text-neutral-900">{result.dayOfWeek}</div>
                                </div>
                                <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                                    <div className="text-xs text-neutral-500 mb-1">Zodiac Sign</div>
                                    <div className="text-sm font-semibold text-neutral-900">{result.zodiac}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[300px] text-neutral-400">
                            <div className="text-center">
                                <Cake className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-xs sm:text-sm">Enter your birth date to calculate age</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

