'use client'

import { useState } from 'react'
import { Percent, Calculator, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react'

type CalculationType = 'percentage-of' | 'percentage-change' | 'reverse-percentage'

export function PercentageCalculator() {

    const [calculationType, setCalculationType] = useState<CalculationType>('percentage-of')
    const [value1, setValue1] = useState('')
    const [value2, setValue2] = useState('')
    const [result, setResult] = useState<{
        percentage?: number
        value?: number
        change?: number
        changePercent?: number
    } | null>(null)

    const calculate = () => {
        const num1 = parseFloat(value1)
        const num2 = parseFloat(value2)

        if (isNaN(num1) || isNaN(num2)) {
            alert('Please enter valid numbers!')
            return
        }

        switch (calculationType) {
            case 'percentage-of':
                // What is X% of Y?
                if (num1 < 0 || num1 > 100) {
                    alert('Percentage must be between 0 and 100!')
                    return
                }
                const result1 = (num1 * num2) / 100
                setResult({ value: result1 })
                break

            case 'percentage-change':
                // What is the percentage change from X to Y?
                if (num1 === 0) {
                    alert('Original value cannot be zero!')
                    return
                }
                const change = num2 - num1
                const changePercent = (change / num1) * 100
                setResult({ change, changePercent })
                break

            case 'reverse-percentage':
                // If Y is X% of something, what is the original value?
                if (num2 <= 0 || num2 > 100) {
                    alert('Percentage must be between 1 and 100!')
                    return
                }
                const originalValue = (num1 * 100) / num2
                setResult({ value: originalValue })
                break
        }
    }

    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(num)
    }

    const getCalculationLabels = () => {
        switch (calculationType) {
            case 'percentage-of':
                return {
                    label1: 'Percentage (%)',
                    label2: 'Of Number',
                    placeholder1: '25',
                    placeholder2: '200',
                    description: 'Calculate what percentage of a number equals another value'
                }
            case 'percentage-change':
                return {
                    label1: 'Original Value',
                    label2: 'New Value',
                    placeholder1: '100',
                    placeholder2: '150',
                    description: 'Calculate the percentage change from one value to another'
                }
            case 'reverse-percentage':
                return {
                    label1: 'Result Value',
                    label2: 'Is (%)',
                    placeholder1: '75',
                    placeholder2: '25',
                    description: 'If a value is X% of something, find the original value'
                }
        }
    }

    const labels = getCalculationLabels()

    return (
        <div className="max-w-full sm:max-w-6xl mx-auto px-4">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Percentage Calculator</h1>
                <p className="text-sm sm:text-base text-neutral-600">Calculate percentages, percentage changes, and reverse percentage calculations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="tool-card p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        Input
                    </h3>

                    <div className="space-y-4">
                        {/* Calculation Type Selection */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                Calculation Type
                            </label>
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        setCalculationType('percentage-of')
                                        setResult(null)
                                        setValue1('')
                                        setValue2('')
                                    }}
                                    className={`w-full p-3 rounded-lg border-2 text-left transition-all text-sm ${calculationType === 'percentage-of'
                                        ? 'border-primary-600 bg-primary-50 text-primary-900'
                                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Percent className="w-4 h-4" />
                                        <span className="font-semibold">Percentage Of</span>
                                    </div>
                                    <span className="text-xs text-neutral-500">What is X% of Y?</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setCalculationType('percentage-change')
                                        setResult(null)
                                        setValue1('')
                                        setValue2('')
                                    }}
                                    className={`w-full p-3 rounded-lg border-2 text-left transition-all text-sm ${calculationType === 'percentage-change'
                                        ? 'border-primary-600 bg-primary-50 text-primary-900'
                                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="font-semibold">Percentage Change</span>
                                    </div>
                                    <span className="text-xs text-neutral-500">Calculate percentage increase or decrease</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setCalculationType('reverse-percentage')
                                        setResult(null)
                                        setValue1('')
                                        setValue2('')
                                    }}
                                    className={`w-full p-3 rounded-lg border-2 text-left transition-all text-sm ${calculationType === 'reverse-percentage'
                                        ? 'border-primary-600 bg-primary-50 text-primary-900'
                                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <ArrowRightLeft className="w-4 h-4" />
                                        <span className="font-semibold">Reverse Percentage</span>
                                    </div>
                                    <span className="text-xs text-neutral-500">Find original value from percentage</span>
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs sm:text-sm text-blue-800">
                            {labels.description}
                        </div>

                        {/* Input Fields */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                {labels.label1}
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={value1}
                                onChange={(e) => setValue1(e.target.value)}
                                placeholder={labels.placeholder1}
                                className="input-field text-sm sm:text-base min-h-[44px] w-full"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-2 block">
                                {labels.label2}
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={value2}
                                onChange={(e) => setValue2(e.target.value)}
                                placeholder={labels.placeholder2}
                                className="input-field text-sm sm:text-base min-h-[44px] w-full"
                            />
                        </div>

                        <button
                            onClick={calculate}
                            className="btn-primary w-full min-h-[44px] text-sm sm:text-base"
                        >
                            <Calculator className="w-4 h-4 inline mr-2" />
                            Calculate
                        </button>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800">
                            💡 <strong>Tips:</strong> Use Percentage Of to find a portion of a number. Use Percentage Change to calculate increases or decreases. Use Reverse Percentage to find the original value when you know the result and percentage.
                        </div>
                    </div>
                </div>

                <div className="tool-card p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <Percent className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        Result
                    </h3>

                    {result ? (
                        <div className="space-y-4 sm:space-y-6">
                            {calculationType === 'percentage-of' && result.value !== undefined && (
                                <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-lg p-4 sm:p-6 text-center">
                                    <div className="text-xs sm:text-sm text-primary-700 mb-2 font-medium">
                                        Result
                                    </div>
                                    <div className="text-3xl sm:text-4xl font-bold text-primary-900 mb-2">
                                        {formatNumber(result.value)}
                                    </div>
                                    <div className="text-base sm:text-lg text-primary-700">
                                        {value1}% of {value2} is {formatNumber(result.value)}
                                    </div>
                                </div>
                            )}

                            {calculationType === 'percentage-change' && result.changePercent !== undefined && (
                                <div className="space-y-4">
                                    <div
                                        className={`bg-gradient-to-br border-2 rounded-lg p-4 sm:p-6 text-center ${result.changePercent >= 0
                                            ? 'from-green-50 to-green-100 border-green-200'
                                            : 'from-red-50 to-red-100 border-red-200'
                                            }`}
                                    >
                                        <div
                                            className={`text-xs sm:text-sm mb-2 font-medium ${result.changePercent >= 0 ? 'text-green-700' : 'text-red-700'
                                                }`}
                                        >
                                            Percentage Change
                                        </div>
                                        <div
                                            className={`text-3xl sm:text-4xl font-bold mb-2 flex items-center justify-center gap-2 ${result.changePercent >= 0 ? 'text-green-900' : 'text-red-900'
                                                }`}
                                        >
                                            {result.changePercent >= 0 ? (
                                                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
                                            ) : (
                                                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />
                                            )}
                                            {formatNumber(Math.abs(result.changePercent))}%
                                        </div>
                                        <div
                                            className={`text-base sm:text-lg ${result.changePercent >= 0 ? 'text-green-700' : 'text-red-700'
                                                }`}
                                        >
                                            {result.changePercent >= 0 ? 'Increase' : 'Decrease'}
                                        </div>
                                    </div>

                                    <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-neutral-700">
                                                    Original Value
                                                </span>
                                                <span className="text-lg font-bold text-neutral-900">
                                                    {formatNumber(parseFloat(value1))}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-neutral-700">
                                                    New Value
                                                </span>
                                                <span className="text-lg font-bold text-neutral-900">
                                                    {formatNumber(parseFloat(value2))}
                                                </span>
                                            </div>
                                            <div className="border-t border-neutral-300 pt-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-neutral-700">
                                                        Difference
                                                    </span>
                                                    <span
                                                        className={`text-lg font-bold ${result.change! >= 0 ? 'text-green-600' : 'text-red-600'
                                                            }`}
                                                    >
                                                        {result.change! >= 0 ? '+' : ''}
                                                        {formatNumber(result.change!)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {calculationType === 'reverse-percentage' && result.value !== undefined && (
                                <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-lg p-4 sm:p-6 text-center">
                                    <div className="text-xs sm:text-sm text-primary-700 mb-2 font-medium">
                                        Original Value
                                    </div>
                                    <div className="text-3xl sm:text-4xl font-bold text-primary-900 mb-2">
                                        {formatNumber(result.value)}
                                    </div>
                                    <div className="text-base sm:text-lg text-primary-700">
                                        {value1} is {value2}% of the original value
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[300px] text-neutral-400">
                            <div className="text-center">
                                <Percent className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-xs sm:text-sm">Enter values and click Calculate</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

