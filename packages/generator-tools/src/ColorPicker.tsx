'use client'

import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'

export function ColorPicker() {
  const [color, setColor] = useState('#f2711c')
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const rgb = hexToRgb(color)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  const formats = {
    HEX: color.toUpperCase(),
    RGB: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    RGBA: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
    HSL: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    HSLA: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`,
  }

  const handleCopy = async (format: string, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedFormat(format)
    setTimeout(() => setCopiedFormat(null), 2000)
  }

  const [shades, setShades] = useState<string[]>([])

  useEffect(() => {
    // Generate color shades
    const newShades: string[] = []
    const baseRgb = hexToRgb(color)
    
    for (let i = 9; i >= 0; i--) {
      const factor = i / 10
      const r = Math.round(255 - (255 - baseRgb.r) * factor)
      const g = Math.round(255 - (255 - baseRgb.g) * factor)
      const b = Math.round(255 - (255 - baseRgb.b) * factor)
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
      newShades.push(hex)
    }
    
    setShades(newShades)
  }, [color])

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Color Picker</h1>
        <p className="text-sm sm:text-base text-neutral-600">Pilih warna dan dapatkan kode dalam berbagai format</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="tool-card p-4 sm:p-6">
          <label className="text-sm font-medium text-neutral-700 mb-4 block">
            Pilih Warna
          </label>
          
          <div
            className="w-full h-48 sm:h-64 rounded-lg border-4 border-neutral-200 mb-4 cursor-pointer"
            style={{ backgroundColor: color }}
          />
          
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 sm:h-12 cursor-pointer rounded border border-neutral-300"
          />
          
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="input-field mt-3 text-sm sm:text-base min-h-[44px]"
            placeholder="#000000"
          />
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-sm font-medium text-neutral-700 mb-4">Format Warna</h3>
          
          <div className="space-y-3">
            {Object.entries(formats).map(([format, value]) => (
              <div key={format} className="flex items-center justify-between bg-neutral-50 p-2 sm:p-3 rounded border border-neutral-200 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-neutral-500 mb-1">{format}</div>
                  <code className="text-xs sm:text-sm text-neutral-900 break-all">{value}</code>
                </div>
                <button
                  onClick={() => handleCopy(format, value)}
                  className="ml-2 text-neutral-600 hover:text-primary-600 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  {copiedFormat === format ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tool-card p-4 sm:p-6">
        <h3 className="text-sm font-medium text-neutral-700 mb-4">Shades & Tints</h3>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {shades.map((shade, index) => (
            <button
              key={index}
              onClick={() => setColor(shade)}
              className="aspect-square rounded border-2 border-neutral-200 hover:border-primary-500 transition-colors min-h-[44px]"
              style={{ backgroundColor: shade }}
              title={shade}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

