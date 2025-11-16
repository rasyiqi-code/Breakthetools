'use client'

import { useState } from 'react'
import { Code, AlertCircle, CheckCircle2 } from 'lucide-react'

export function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [flags, setFlags] = useState({
    global: true,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false,
  })
  const [matches, setMatches] = useState<any[]>([])
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const testRegex = () => {
    if (!pattern.trim()) {
      setError('Masukkan pattern regex terlebih dahulu!')
      setIsValid(null)
      setMatches([])
      return
    }

    try {
      // Build flags string
      const flagsString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => flag[0])
        .join('')

      const regex = new RegExp(pattern, flagsString)
      setIsValid(true)
      setError('')

      // Find all matches
      const allMatches: any[] = []
      let match
      const regexGlobal = new RegExp(pattern, flagsString + 'g')

      if (flags.global) {
        while ((match = regexGlobal.exec(testString)) !== null) {
          allMatches.push({
            match: match[0],
            index: match.index,
            groups: match.groups || {},
            capturedGroups: match.slice(1),
          })
        }
      } else {
        match = regex.exec(testString)
        if (match) {
          allMatches.push({
            match: match[0],
            index: match.index,
            groups: match.groups || {},
            capturedGroups: match.slice(1),
          })
        }
      }

      setMatches(allMatches)
    } catch (err: any) {
      setIsValid(false)
      setError('Pattern tidak valid: ' + (err.message || 'Syntax error'))
      setMatches([])
    }
  }

  const highlightMatches = (text: string, regex: RegExp): JSX.Element[] => {
    if (!pattern.trim() || !isValid) {
      return [<span key="0">{text}</span>]
    }

    try {
      const parts: JSX.Element[] = []
      let lastIndex = 0
      let match
      const regexGlobal = new RegExp(pattern, Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => flag[0])
        .join('') + 'g')

      while ((match = regexGlobal.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
          parts.push(
            <span key={`text-${lastIndex}`}>
              {text.substring(lastIndex, match.index)}
            </span>
          )
        }

        // Add highlighted match
        parts.push(
          <span
            key={`match-${match.index}`}
            className="bg-yellow-200 font-semibold"
          >
            {match[0]}
          </span>
        )

        lastIndex = regexGlobal.lastIndex
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex)}
          </span>
        )
      }

      return parts.length > 0 ? parts : [<span key="0">{text}</span>]
    } catch {
      return [<span key="0">{text}</span>]
    }
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Regex Tester</h1>
        <p className="text-sm sm:text-base text-neutral-600">Test dan debug regular expression dengan live preview</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Regular Expression Pattern
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={pattern}
              onChange={(e) => {
                setPattern(e.target.value)
                setIsValid(null)
                setMatches([])
              }}
              placeholder="/pattern/flags"
              className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base min-h-[44px] ${isValid === false
                ? 'border-red-300 focus:ring-red-500'
                : isValid === true
                  ? 'border-green-300 focus:ring-green-500'
                  : 'border-neutral-300 focus:ring-primary-500'
                }`}
            />
            {isValid !== null && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValid ? (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                )}
              </div>
            )}
          </div>
          <button
            onClick={testRegex}
            className="btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
          >
            <Code className="w-4 h-4" />
            Test
          </button>
        </div>

        <div className="mb-4">
          <label className="text-xs text-neutral-600 mb-2 block">Flags</label>
          <div className="grid grid-cols-2 sm:flex flex-wrap gap-2 sm:gap-3">
            {Object.entries(flags).map(([flag, enabled]) => (
              <label key={flag} className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => {
                    setFlags({ ...flags, [flag]: e.target.checked })
                    setIsValid(null)
                    setMatches([])
                  }}
                  className="w-4 h-4"
                />
                <span className="text-xs sm:text-sm">
                  {flag === 'global' ? 'g' : flag === 'ignoreCase' ? 'i' : flag === 'multiline' ? 'm' : flag === 'dotAll' ? 's' : flag === 'unicode' ? 'u' : 'y'}: {flag}
                </span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 mb-4">
            <div className="text-xs sm:text-sm text-red-800">⚠️ {error}</div>
          </div>
        )}
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Test String
        </label>
        <textarea
          value={testString}
          onChange={(e) => {
            setTestString(e.target.value)
            if (pattern && isValid) {
              testRegex()
            }
          }}
          placeholder="Masukkan teks untuk di-test..."
          rows={6}
          className="w-full px-3 sm:px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-xs sm:text-sm"
        />

        {testString && isValid && (
          <div className="mt-4 p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="text-xs text-neutral-600 mb-2">Preview dengan highlight:</div>
            <div className="font-mono text-xs sm:text-sm whitespace-pre-wrap break-words">
              {highlightMatches(testString, new RegExp(pattern, Object.entries(flags)
                .filter(([_, enabled]) => enabled)
                .map(([flag]) => flag[0])
                .join('')))}
            </div>
          </div>
        )}
      </div>

      {matches.length > 0 && (
        <div className="tool-card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4">
            Matches Found: {matches.length}
          </h2>
          <div className="space-y-3">
            {matches.map((match, index) => (
              <div key={index} className="p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-2">
                  <span className="text-xs font-medium text-neutral-600">Match #{index + 1}</span>
                  <span className="text-xs text-neutral-500">at index {match.index}</span>
                </div>
                <div className="font-mono text-xs sm:text-sm bg-white p-2 rounded border border-neutral-200 mb-2 break-all">
                  {match.match}
                </div>
                {match.capturedGroups.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-neutral-600 mb-1">Captured Groups:</div>
                    <div className="space-y-1">
                      {match.capturedGroups.map((group: string, i: number) => (
                        <div key={i} className="text-xs font-mono bg-white p-2 rounded border border-neutral-200 break-all">
                          Group {i + 1}: {group || '(empty)'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {Object.keys(match.groups).length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-neutral-600 mb-1">Named Groups:</div>
                    <div className="space-y-1">
                      {Object.entries(match.groups).map(([name, value]) => (
                        <div key={name} className="text-xs font-mono bg-white p-2 rounded border border-neutral-200 break-all">
                          {name}: {value as string}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isValid && matches.length === 0 && testString && (
        <div className="tool-card p-4 sm:p-6">
          <div className="text-center text-xs sm:text-sm text-neutral-500">
            Tidak ada match ditemukan
          </div>
        </div>
      )}
    </div>
  )
}

