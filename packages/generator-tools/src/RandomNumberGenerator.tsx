'use client'

import { useState } from 'react'
import { Dice6, Copy, Check, RefreshCw, Trash2 } from 'lucide-react'

export function RandomNumberGenerator() {

  const [min, setMin] = useState('1')
  const [max, setMax] = useState('100')
  const [count, setCount] = useState('1')
  const [numberType, setNumberType] = useState<'integer' | 'decimal'>('integer')
  const [decimals, setDecimals] = useState('2')
  const [allowDuplicate, setAllowDuplicate] = useState(true)
  const [results, setResults] = useState<number[]>([])
  const [copied, setCopied] = useState(false)

  const generateNumbers = () => {
    const minNum = parseFloat(min)
    const maxNum = parseFloat(max)
    const countNum = parseInt(count)

    if (isNaN(minNum) || isNaN(maxNum) || isNaN(countNum)) {
      alert('Please enter valid numbers!')
      return
    }

    if (minNum > maxNum) {
      alert('Minimum value must be less than or equal to maximum value!')
      return
    }

    if (countNum < 1 || countNum > 1000) {
      alert('Count must be between 1 and 1000!')
      return
    }

    if (!allowDuplicate && countNum > (maxNum - minNum + 1)) {
      alert('Cannot generate unique numbers. Range is too small for the count!')
      return
    }

    const generated: number[] = []
    const used = new Set<number>()

    while (generated.length < countNum) {
      let num: number

      if (numberType === 'integer') {
        num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
      } else {
        const decimalsNum = parseInt(decimals) || 2
        const factor = Math.pow(10, Math.min(decimalsNum, 10))
        num = Math.floor(Math.random() * (maxNum - minNum) * factor + minNum * factor) / factor
        num = parseFloat(num.toFixed(Math.min(decimalsNum, 10)))
      }

      if (!allowDuplicate) {
        if (used.has(num)) {
          continue
        }
        used.add(num)
      }

      generated.push(num)
    }

    // Sort if needed
    setResults(generated.sort((a, b) => a - b))
    setCopied(false)
  }

  const handleCopy = async () => {
    if (results.length === 0) return

    const text = results.join(', ')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setResults([])
    setCopied(false)
  }

  const formatNumber = (num: number): string => {
    if (numberType === 'integer') {
      return num.toString()
    }
    const decimalsNum = parseInt(decimals) || 2
    return num.toFixed(Math.min(decimalsNum, 10))
  }

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Random Number Generator</h1>
        <p className="text-sm sm:text-base text-neutral-600">Generate random numbers with customizable range and count</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Dice6 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Min</label>
                  <input
                    type="number"
                    step="any"
                    value={min}
                    onChange={(e) => setMin(e.target.value)}
                    placeholder="1"
                    className="input-field text-sm sm:text-base min-h-[44px] w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Max</label>
                  <input
                    type="number"
                    step="any"
                    value={max}
                    onChange={(e) => setMax(e.target.value)}
                    placeholder="100"
                    className="input-field text-sm sm:text-base min-h-[44px] w-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Count: {count}
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full h-2 accent-primary-500"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>1</span>
                <span>100</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Number Type
              </label>
              <div className="flex gap-2">
                {(['integer', 'decimal'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNumberType(type)}
                    className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${
                      numberType === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {type === 'integer' ? 'Integer' : 'Decimal'}
                  </button>
                ))}
              </div>
            </div>

            {numberType === 'decimal' && (
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Decimal Places: {decimals}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={decimals}
                  onChange={(e) => setDecimals(e.target.value)}
                  className="w-full h-2 accent-primary-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDuplicate}
                  onChange={(e) => setAllowDuplicate(e.target.checked)}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm text-neutral-700">Allow Duplicates</span>
              </label>
              <p className="text-xs text-neutral-500 mt-1 ml-6">If disabled, all numbers will be unique (requires range ≥ count)</p>
            </div>

            <button
              onClick={generateNumbers}
              className="btn-primary w-full min-h-[44px] text-sm sm:text-base"
            >
              <Dice6 className="w-4 h-4 inline mr-2" />
              Generate Numbers
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800">
              💡 <strong>Tips:</strong> Use integer mode for whole numbers. Use decimal mode for floating point numbers. Disable duplicates to get unique numbers only (useful for lotteries and selections).
            </div>
          </div>
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Dice6 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Results
          </h3>

          {results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 btn-secondary min-h-[44px] text-sm sm:text-base"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 inline mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 inline mr-2" />
                      Copy All
                    </>
                  )}
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors min-h-[44px] text-sm sm:text-base"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Clear
                </button>
              </div>

              <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 max-h-[400px] overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {results.map((num, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-mono font-semibold text-neutral-900"
                    >
                      {formatNumber(num)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                <div className="text-xs text-primary-700 mb-2 font-medium">Statistics</div>
                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-primary-600">Count:</span>{' '}
                    <span className="font-semibold text-primary-900">{results.length}</span>
                  </div>
                  <div>
                    <span className="text-primary-600">Min:</span>{' '}
                    <span className="font-semibold text-primary-900">{formatNumber(Math.min(...results))}</span>
                  </div>
                  <div>
                    <span className="text-primary-600">Max:</span>{' '}
                    <span className="font-semibold text-primary-900">{formatNumber(Math.max(...results))}</span>
                  </div>
                  <div>
                    <span className="text-primary-600">Average:</span>{' '}
                    <span className="font-semibold text-primary-900">
                      {formatNumber(results.reduce((a, b) => a + b, 0) / results.length)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[300px] text-neutral-400">
              <div className="text-center">
                <Dice6 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-sm">Click Generate to create random numbers</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

