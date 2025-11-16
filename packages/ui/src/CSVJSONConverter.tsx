'use client'

import { useState } from 'react'
import { FileText, ArrowLeftRight, Copy, Check, Download } from 'lucide-react'

export function CSVJSONConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'csv-to-json' | 'json-to-csv'>('csv-to-json')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const csvToJson = (csv: string): string => {
    if (!csv.trim()) {
      throw new Error('CSV tidak boleh kosong')
    }

    const lines = csv.trim().split('\n')
    if (lines.length === 0) {
      throw new Error('CSV tidak valid')
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))

    // Parse data rows
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const obj: Record<string, string> = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ''
      })
      return obj
    })

    return JSON.stringify(data, null, 2)
  }

  const jsonToCsv = (json: string): string => {
    if (!json.trim()) {
      throw new Error('JSON tidak boleh kosong')
    }

    let data: any[]
    try {
      data = JSON.parse(json)
    } catch {
      throw new Error('JSON tidak valid')
    }

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('JSON harus berupa array dengan minimal 1 object')
    }

    // Get headers from first object
    const headers = Object.keys(data[0])

    // Build CSV
    const csvLines = [
      headers.map(h => `"${h}"`).join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header] ?? ''
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ]

    return csvLines.join('\n')
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    setError('')
    setOutput('')

    if (!value.trim()) {
      return
    }

    try {
      if (mode === 'csv-to-json') {
        setOutput(csvToJson(value))
      } else {
        setOutput(jsonToCsv(value))
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat konversi')
    }
  }

  const handleModeChange = (newMode: 'csv-to-json' | 'json-to-csv') => {
    setMode(newMode)
    // Swap input and output
    const temp = input
    setInput(output)
    setOutput(temp)
    setError('')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadFile = () => {
    const blob = new Blob([output], { type: mode === 'csv-to-json' ? 'application/json' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = mode === 'csv-to-json' ? 'converted.json' : 'converted.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">CSV ↔ JSON Converter</h1>
        <p className="text-sm sm:text-base text-neutral-600">Konversi antara format CSV dan JSON</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => handleModeChange('csv-to-json')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${mode === 'csv-to-json'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
          >
            CSV to JSON
          </button>
          <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
          <button
            onClick={() => handleModeChange('json-to-csv')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-xs sm:text-sm ${mode === 'json-to-csv'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
          >
            JSON to CSV
          </button>
        </div>

        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          {mode === 'csv-to-json' ? 'CSV Input' : 'JSON Input'}
        </label>
        <textarea
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={
            mode === 'csv-to-json'
              ? 'name,age,city\n"John",30,"New York"\n"Jane",25,"London"'
              : '[\n  {"name": "John", "age": 30, "city": "New York"},\n  {"name": "Jane", "age": 25, "city": "London"}\n]'
          }
          rows={10}
          className="w-full px-3 sm:px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-xs sm:text-sm"
        />

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
            <div className="text-xs sm:text-sm text-red-800">⚠️ {error}</div>
          </div>
        )}
      </div>

      {output && (
        <div className="tool-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
            <label className="text-sm font-medium text-neutral-700">
              {mode === 'csv-to-json' ? 'JSON Output' : 'CSV Output'}
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

