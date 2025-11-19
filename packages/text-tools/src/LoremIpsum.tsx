'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

const loremWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
]

export function LoremIpsum() {
  const [count, setCount] = useState(3)
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const generateLorem = () => {
    let result = ''

    const generateSentence = () => {
      const wordCount = Math.floor(Math.random() * 10) + 5
      const words: string[] = []
      for (let i = 0; i < wordCount; i++) {
        words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
      }
      return words[0].charAt(0).toUpperCase() + words[0].slice(1) + ' ' + words.slice(1).join(' ') + '.'
    }

    const generateParagraph = () => {
      const sentenceCount = Math.floor(Math.random() * 5) + 3
      const sentences: string[] = []
      for (let i = 0; i < sentenceCount; i++) {
        sentences.push(generateSentence())
      }
      return sentences.join(' ')
    }

    if (type === 'words') {
      const words: string[] = []
      for (let i = 0; i < count; i++) {
        words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
      }
      result = words.join(' ')
    } else if (type === 'sentences') {
      const sentences: string[] = []
      for (let i = 0; i < count; i++) {
        sentences.push(generateSentence())
      }
      result = sentences.join(' ')
    } else {
      const paragraphs: string[] = []
      for (let i = 0; i < count; i++) {
        paragraphs.push(generateParagraph())
      }
      result = paragraphs.join('\n\n')
    }

    setOutput(result)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Lorem Ipsum Generator</h1>
        <p className="text-sm sm:text-base text-neutral-600">Generate placeholder text for your design and mockups</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">Count</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="100"
              className="input-field text-sm sm:text-base min-h-[44px]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-neutral-700 mb-2 block">Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setType('paragraphs')}
                className={`flex-1 py-2 px-3 sm:px-4 rounded font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${type === 'paragraphs'
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
              >
                Paragraphs
              </button>
              <button
                onClick={() => setType('sentences')}
                className={`flex-1 py-2 px-3 sm:px-4 rounded font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${type === 'sentences'
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
              >
                Sentences
              </button>
              <button
                onClick={() => setType('words')}
                className={`flex-1 py-2 px-3 sm:px-4 rounded font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${type === 'words'
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
              >
                Words
              </button>
            </div>
          </div>
        </div>

        <button onClick={generateLorem} className="btn-primary w-full sm:w-auto min-h-[44px] text-sm sm:text-base">
          Generate Lorem Ipsum
        </button>
      </div>

      {output && (
        <div className="tool-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
            <label className="text-sm font-medium text-neutral-700">Result</label>
            <button
              onClick={handleCopy}
              className="btn-secondary text-sm flex items-center space-x-2 min-h-[44px] px-4"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-neutral-50 p-3 sm:p-4 rounded border border-neutral-200 whitespace-pre-wrap text-xs sm:text-sm">
            {output}
          </div>
        </div>
      )}
    </div>
  )
}

