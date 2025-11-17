'use client'

import { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function PasswordGenerator() {
  const t = useTranslations('tools.passwordGenerator')
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(16)
  const [copied, setCopied] = useState(false)

  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  })

  const generatePassword = () => {
    let chars = ''
    if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (options.numbers) chars += '0123456789'
    if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (chars === '') {
      alert(t('errors.selectAtLeastOne'))
      return
    }

    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(result)
    setCopied(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStrength = () => {
    if (!password) return { text: '', color: '', width: '0%' }

    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (password.length >= 16) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++

    if (strength <= 2) return { text: t('strength.weak'), color: 'bg-red-500', width: '33%' }
    if (strength <= 4) return { text: t('strength.medium'), color: 'bg-yellow-500', width: '66%' }
    return { text: t('strength.strong'), color: 'bg-green-500', width: '100%' }
  }

  const strength = getStrength()

  return (
    <div className="max-w-full sm:max-w-3xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">{t('title')}</h1>
        <p className="text-sm sm:text-base text-neutral-600">{t('description')}</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">{t('password')}</label>

        {password && (
          <>
            <div className="bg-neutral-50 p-3 sm:p-4 rounded border border-neutral-200 mb-3">
              <div className="font-mono text-sm sm:text-lg break-all text-neutral-900">
                {password}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs sm:text-sm mb-2">
                <span className="text-neutral-600">{t('passwordStrength')}:</span>
                <span className={`font-medium ${strength.text === t('strength.strong') ? 'text-green-600' :
                  strength.text === t('strength.medium') ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                  {strength.text}
                </span>
              </div>
              <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: strength.width }}
                />
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={generatePassword}
            className="btn-primary flex-1 flex items-center justify-center space-x-2 min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm sm:text-base">{password ? t('generateAgain') : t('generatePassword')}</span>
          </button>

          {password && (
            <button
              onClick={handleCopy}
              className="btn-secondary flex items-center justify-center space-x-2 min-h-[44px] px-4"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm sm:text-base">{t('copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm sm:text-base">{t('copy')}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="tool-card p-4 sm:p-6">
        <h3 className="text-sm font-medium text-neutral-700 mb-4">{t('passwordOptions')}</h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-neutral-600">{t('passwordLength')}</label>
              <span className="text-sm font-medium text-neutral-900">{length}</span>
            </div>
            <input
              type="range"
              min="4"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={options.uppercase}
                onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">{t('options.uppercase')}</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={options.lowercase}
                onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">{t('options.lowercase')}</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={options.numbers}
                onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">{t('options.numbers')}</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={options.symbols}
                onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">{t('options.symbols')}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

