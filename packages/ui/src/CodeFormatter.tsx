'use client'

import { useState } from 'react'
import { Code, FileCode, Copy, Check, Download } from 'lucide-react'

type FormatType = 'html' | 'css' | 'javascript' | 'json'

export function CodeFormatter() {
  const [formatType, setFormatType] = useState<FormatType>('html')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const formatHTML = (code: string): string => {
    let formatted = code
    let indent = 0
    const tab = '  '

    formatted = formatted
      .replace(/>\s*</g, '>\n<')
      .split('\n')
      .map((line) => {
        if (line.match(/<\/\w/)) {
          indent--
        }
        const indented = tab.repeat(Math.max(0, indent)) + line.trim()
        if (line.match(/<\w[^>]*[^/]>.*$/)) {
          indent++
        }
        return indented
      })
      .join('\n')

    return formatted
  }

  const formatCSS = (code: string): string => {
    let formatted = code
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/\s*;\s*/g, ';\n  ')
      .replace(/\n\s*\n/g, '\n')
      .trim()

    // Clean up empty lines and fix indentation
    const lines = formatted.split('\n')
    let indent = 0
    return lines
      .map((line) => {
        const trimmed = line.trim()
        if (trimmed.endsWith('{')) {
          const result = '  '.repeat(indent) + trimmed
          indent++
          return result
        } else if (trimmed.startsWith('}')) {
          indent--
          return '  '.repeat(indent) + trimmed
        } else if (trimmed) {
          return '  '.repeat(indent) + trimmed
        }
        return ''
      })
      .filter((line) => line)
      .join('\n')
  }

  const formatJavaScript = (code: string): string => {
    // Simple JavaScript formatter
    let formatted = code
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/\s*;\s*/g, ';\n')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s*\(\s*/g, '(')
      .replace(/\s*\)\s*/g, ')')
      .trim()

    // Basic indentation
    const lines = formatted.split('\n')
    let indent = 0
    return lines
      .map((line) => {
        const trimmed = line.trim()
        if (!trimmed) return ''

        if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
          const result = '  '.repeat(indent) + trimmed
          indent++
          return result
        } else if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
          indent--
          return '  '.repeat(indent) + trimmed
        } else {
          return '  '.repeat(indent) + trimmed
        }
      })
      .filter((line) => line)
      .join('\n')
  }

  const formatJSON = (code: string): string => {
    try {
      const parsed = JSON.parse(code)
      return JSON.stringify(parsed, null, 2)
    } catch {
      throw new Error('JSON tidak valid')
    }
  }

  const formatCode = () => {
    if (!input.trim()) {
      setError('Masukkan kode terlebih dahulu!')
      setOutput('')
      return
    }

    try {
      setError('')
      let formatted = ''

      switch (formatType) {
        case 'html':
          formatted = formatHTML(input)
          break
        case 'css':
          formatted = formatCSS(input)
          break
        case 'javascript':
          formatted = formatJavaScript(input)
          break
        case 'json':
          formatted = formatJSON(input)
          break
      }

      setOutput(formatted)
    } catch (err: any) {
      setError(err.message || 'Gagal memformat kode')
      setOutput('')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadFile = () => {
    const extension = formatType === 'javascript' ? 'js' : formatType
    const mimeType = formatType === 'javascript' ? 'application/javascript' : 
                     formatType === 'json' ? 'application/json' :
                     formatType === 'css' ? 'text/css' : 'text/html'
    
    const blob = new Blob([output], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `formatted.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Code Formatter</h1>
        <p className="text-sm sm:text-base text-neutral-600">Format dan beautify kode HTML, CSS, JavaScript, dan JSON</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Pilih Format
        </label>
        <div className="grid grid-cols-2 sm:flex gap-2 mb-4">
          {(['html', 'css', 'javascript', 'json'] as FormatType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setFormatType(type)
                setInput('')
                setOutput('')
                setError('')
              }}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${
                formatType === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {type === 'javascript' ? 'JavaScript' : type.toUpperCase()}
            </button>
          ))}
        </div>

        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Input Code ({formatType.toUpperCase()})
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            formatType === 'html'
              ? '<div><p>Hello World</p></div>'
              : formatType === 'css'
              ? 'body{margin:0;padding:0;}'
              : formatType === 'javascript'
              ? 'function test(){return true;}'
              : '{"name":"John","age":30}'
          }
          rows={12}
          className="w-full px-3 sm:px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-xs sm:text-sm"
        />

        <div className="mt-4">
          <button
            onClick={formatCode}
            className="btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base w-full sm:w-auto"
          >
            <FileCode className="w-4 h-4" />
            Format Code
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-xs sm:text-sm text-red-800">⚠️ {error}</div>
          </div>
        )}
      </div>

      {output && (
        <div className="tool-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
            <label className="text-sm font-medium text-neutral-700">
              Formatted Code
            </label>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={copyToClipboard}
                className="btn-secondary flex items-center justify-center gap-2 text-sm min-h-[44px] flex-1 sm:flex-none px-4"
              >
                {copied ? (
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
              <button
                onClick={downloadFile}
                className="btn-secondary flex items-center justify-center gap-2 text-sm min-h-[44px] flex-1 sm:flex-none px-4"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
              {output}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

