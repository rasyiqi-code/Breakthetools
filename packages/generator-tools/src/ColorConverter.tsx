'use client'

import { useState, useEffect } from 'react'
import { Palette, Copy, Check } from 'lucide-react'
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToCmyk,
  cmykToRgb,
  type RGB,
  type HSL,
  type CMYK
} from './utils/colorUtils'

interface ColorValues {
  hex: string
  rgb: RGB
  hsl: HSL
  cmyk: CMYK
}

export function ColorConverter() {
  const [inputType, setInputType] = useState<'hex' | 'rgb' | 'hsl' | 'cmyk'>('hex')
  const [inputValue, setInputValue] = useState('')
  const [colorValues, setColorValues] = useState<ColorValues | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const parseInput = () => {
    if (!inputValue.trim()) {
      setError('Please enter a color value first!')
      setColorValues(null)
      return
    }

    try {
      let rgb: { r: number; g: number; b: number }

      switch (inputType) {
        case 'hex': {
          const rgbResult = hexToRgb(inputValue.trim())
          if (!rgbResult) {
            throw new Error('Invalid HEX format. Use format #RRGGBB or RRGGBB')
          }
          rgb = rgbResult
          break
        }

        case 'rgb': {
          const rgbMatch = inputValue.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
          if (!rgbMatch) {
            throw new Error('Invalid RGB format. Use format: R, G, B (example: 255, 0, 0)')
          }
          rgb = {
            r: Math.max(0, Math.min(255, parseInt(rgbMatch[1]))),
            g: Math.max(0, Math.min(255, parseInt(rgbMatch[2]))),
            b: Math.max(0, Math.min(255, parseInt(rgbMatch[3]))),
          }
          break
        }

        case 'hsl': {
          const hslMatch = inputValue.match(/(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%/)
          if (!hslMatch) {
            throw new Error('Invalid HSL format. Use format: H, S%, L% (example: 0, 100%, 50%)')
          }
          rgb = hslToRgb(
            Math.max(0, Math.min(360, parseInt(hslMatch[1]))),
            Math.max(0, Math.min(100, parseInt(hslMatch[2]))),
            Math.max(0, Math.min(100, parseInt(hslMatch[3])))
          )
          break
        }

        case 'cmyk': {
          const cmykMatch = inputValue.match(/(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%/)
          if (!cmykMatch) {
            throw new Error('Invalid CMYK format. Use format: C%, M%, Y%, K% (example: 0%, 100%, 100%, 0%)')
          }
          rgb = cmykToRgb(
            Math.max(0, Math.min(100, parseInt(cmykMatch[1]))),
            Math.max(0, Math.min(100, parseInt(cmykMatch[2]))),
            Math.max(0, Math.min(100, parseInt(cmykMatch[3]))),
            Math.max(0, Math.min(100, parseInt(cmykMatch[4])))
          )
          break
        }
      }

      const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)

      setColorValues({
        hex,
        rgb,
        hsl,
        cmyk,
      })
      setError('')
    } catch (err: any) {
      setError(err.message || 'Invalid color format')
      setColorValues(null)
    }
  }

  useEffect(() => {
    if (inputValue.trim()) {
      parseInput()
    }
  }, [inputType])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Color Converter</h1>
        <p className="text-sm sm:text-base text-neutral-600">Convert colors between HEX, RGB, HSL, and CMYK</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Input Format
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {(['hex', 'rgb', 'hsl', 'cmyk'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setInputType(type)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${inputType === type
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Enter Color ({inputType.toUpperCase()})
        </label>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              if (e.target.value.trim()) {
                setTimeout(() => parseInput(), 300)
              }
            }}
            placeholder={inputType === 'hex' ? '#FF0000 or FF0000' : inputType === 'rgb' ? '255, 0, 0' : inputType === 'hsl' ? '0, 100%, 50%' : '0%, 100%, 100%, 0%'}
            className="flex-1 px-3 sm:px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm sm:text-base min-h-[44px]"
          />
          <button
            onClick={parseInput}
            className="btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
          >
            <Palette className="w-4 h-4" />
            Convert
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 mb-4">
            <div className="text-xs sm:text-sm text-red-800">⚠️ {error}</div>
          </div>
        )}
      </div>

      {colorValues && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Color Preview */}
          <div className="tool-card p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4">Color Preview</h2>
            <div
              className="w-full h-24 sm:h-32 rounded-lg border-2 border-neutral-200 mb-4"
              style={{ backgroundColor: colorValues.hex }}
            />
            <div className="text-xs sm:text-sm text-neutral-600">
              <div className="font-mono">{colorValues.hex}</div>
            </div>
          </div>

          {/* HEX */}
          <div className="tool-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-neutral-900 text-sm sm:text-base">HEX</h3>
              <button
                onClick={() => copyToClipboard(colorValues.hex, 'hex')}
                className="p-2 hover:bg-neutral-100 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {copied === 'hex' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="font-mono text-sm sm:text-lg break-all">{colorValues.hex}</div>
          </div>

          {/* RGB */}
          <div className="tool-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-neutral-900 text-sm sm:text-base">RGB</h3>
              <button
                onClick={() => copyToClipboard(`rgb(${colorValues.rgb.r}, ${colorValues.rgb.g}, ${colorValues.rgb.b})`, 'rgb')}
                className="p-2 hover:bg-neutral-100 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {copied === 'rgb' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="font-mono text-sm sm:text-lg break-all">
              rgb({colorValues.rgb.r}, {colorValues.rgb.g}, {colorValues.rgb.b})
            </div>
          </div>

          {/* HSL */}
          <div className="tool-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-neutral-900 text-sm sm:text-base">HSL</h3>
              <button
                onClick={() => copyToClipboard(`hsl(${colorValues.hsl.h}, ${colorValues.hsl.s}%, ${colorValues.hsl.l}%)`, 'hsl')}
                className="p-2 hover:bg-neutral-100 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {copied === 'hsl' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="font-mono text-sm sm:text-lg break-all">
              hsl({colorValues.hsl.h}, {colorValues.hsl.s}%, {colorValues.hsl.l}%)
            </div>
          </div>

          {/* CMYK */}
          <div className="tool-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-neutral-900 text-sm sm:text-base">CMYK</h3>
              <button
                onClick={() => copyToClipboard(`cmyk(${colorValues.cmyk.c}%, ${colorValues.cmyk.m}%, ${colorValues.cmyk.y}%, ${colorValues.cmyk.k}%)`, 'cmyk')}
                className="p-2 hover:bg-neutral-100 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {copied === 'cmyk' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="font-mono text-sm sm:text-lg break-all">
              cmyk({colorValues.cmyk.c}%, {colorValues.cmyk.m}%, {colorValues.cmyk.y}%, {colorValues.cmyk.k}%)
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

