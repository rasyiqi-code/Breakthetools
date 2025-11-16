'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Copy, Check } from 'lucide-react'

const fancyStyles = {
  'upside-down': (text: string) => {
    const map: Record<string, string> = {
      'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ',
      'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u',
      'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n',
      'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
      'A': '∀', 'B': 'ᗺ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'ᖴ', 'G': 'פ',
      'H': 'H', 'I': 'I', 'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N',
      'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'ᴿ', 'S': 'S', 'T': '┴', 'U': '∩',
      'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z'
    }
    return text.split('').reverse().map(char => map[char] || char).join('')
  },
  'bold': (text: string) => {
    const map: Record<string, string> = {
      'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠',
      'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧',
      'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮',
      'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳'
    }
    return text.split('').map(char => map[char.toLowerCase()] || char).join('')
  },
  'italic': (text: string) => {
    const map: Record<string, string> = {
      'a': '𝑎', 'b': '𝑏', 'c': '𝑐', 'd': '𝑑', 'e': '𝑒', 'f': '𝑓', 'g': '𝑔',
      'h': 'ℎ', 'i': '𝑖', 'j': '𝑗', 'k': '𝑘', 'l': '𝑙', 'm': '𝑚', 'n': '𝑛',
      'o': '𝑜', 'p': '𝑝', 'q': '𝑞', 'r': '𝑟', 's': '𝑠', 't': '𝑡', 'u': '𝑢',
      'v': '𝑣', 'w': '𝑤', 'x': '𝑥', 'y': '𝑦', 'z': '𝑧'
    }
    return text.split('').map(char => map[char.toLowerCase()] || char).join('')
  },
  'spaced': (text: string) => {
    return text.split('').join(' ')
  },
  'small-caps': (text: string) => {
    const map: Record<string, string> = {
      'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ',
      'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ',
      'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ',
      'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
    }
    return text.split('').map(char => map[char.toLowerCase()] || char).join('')
  }
}

export function FancyTextGenerator() {
  const [input, setInput] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<keyof typeof fancyStyles>('bold')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = () => {
    if (!input) return
    const converter = fancyStyles[selectedStyle]
    setOutput(converter(input))
  }

  useEffect(() => {
    if (input) {
      generate()
    } else {
      setOutput('')
    }
  }, [input, selectedStyle])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Fancy Text Generator</h1>
        <p className="text-sm sm:text-base text-neutral-600">Generate teks dengan style unik untuk social media atau desain</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">Masukkan Teks</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik teks Anda di sini..."
          className="input-field text-base sm:text-lg min-h-[44px]"
        />
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">Pilih Style</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          {Object.keys(fancyStyles).map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style as keyof typeof fancyStyles)}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-all min-h-[44px] text-xs sm:text-sm ${
                selectedStyle === style
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {style.charAt(0).toUpperCase() + style.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {output && (
        <div className="tool-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
            <label className="text-sm font-medium text-neutral-700">Hasil</label>
            <button
              onClick={handleCopy}
              className="btn-secondary text-sm flex items-center space-x-2 min-h-[44px] px-4"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-neutral-50 p-3 sm:p-4 rounded-lg border border-neutral-200 min-h-[100px] flex items-center justify-center">
            <div className="text-xl sm:text-2xl font-bold text-neutral-900 text-center break-all">
              {output}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

