'use client'

import { useState } from 'react'
import { Lock, Shield, AlertTriangle } from 'lucide-react'

export function PasswordStrengthChecker() {
  const [password, setPassword] = useState('')

  const checkStrength = () => {
    if (!password) return { score: 0, text: '', color: '', width: '0%', feedback: [] }

    let score = 0
    const feedback: string[] = []

    // Length checks
    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('Minimal 8 karakter')
    }
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1

    // Character variety
    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Tambahkan huruf kecil')

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Tambahkan huruf besar')

    if (/\d/.test(password)) score += 1
    else feedback.push('Tambahkan angka')

    if (/[^a-zA-Z0-9]/.test(password)) score += 1
    else feedback.push('Tambahkan simbol')

    // Common patterns (penalty)
    const commonPatterns = ['123', 'abc', 'password', 'qwerty', 'admin']
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      score = Math.max(0, score - 2)
      feedback.push('Hindari pola umum')
    }

    // Repetition check
    if (/(.)\1{2,}/.test(password)) {
      score = Math.max(0, score - 1)
      feedback.push('Hindari karakter berulang')
    }

    score = Math.min(10, Math.max(0, score))

    let text = ''
    let color = ''
    let width = ''

    if (score <= 3) {
      text = 'Sangat Lemah'
      color = 'bg-red-500'
      width = '25%'
    } else if (score <= 5) {
      text = 'Lemah'
      color = 'bg-orange-500'
      width = '50%'
    } else if (score <= 7) {
      text = 'Sedang'
      color = 'bg-yellow-500'
      width = '75%'
    } else if (score <= 9) {
      text = 'Kuat'
      color = 'bg-green-500'
      width = '90%'
    } else {
      text = 'Sangat Kuat'
      color = 'bg-green-600'
      width = '100%'
    }

    return { score, text, color, width, feedback }
  }

  const strength = checkStrength()

  return (
    <div className="max-w-full sm:max-w-3xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Password Strength Checker</h1>
        <p className="text-sm sm:text-base text-neutral-600">Cek kekuatan password secara real-time - 100% client-side, aman dan private</p>
      </div>

      <div className="tool-card p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          Masukkan Password
        </h3>

        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ketik password Anda di sini..."
            className="input-field text-base sm:text-lg min-h-[44px]"
          />

          {password && (
            <div className="space-y-4">
              <div>
                <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0 text-xs sm:text-sm mb-2">
                  <span className="text-neutral-600">Kekuatan Password:</span>
                  <span className={`font-semibold ${
                    strength.text.includes('Kuat') ? 'text-green-600' :
                    strength.text.includes('Sedang') ? 'text-yellow-600' :
                    strength.text.includes('Lemah') ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {strength.text} ({strength.score}/10)
                  </span>
                </div>
                <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: strength.width }}
                  />
                </div>
              </div>

              {strength.feedback.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs sm:text-sm font-semibold text-yellow-800">Saran Perbaikan:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-yellow-700">
                    {strength.feedback.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {strength.score >= 8 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-xs sm:text-sm font-semibold text-green-800">
                      Password Anda cukup kuat! ✓
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800">
                🔒 <strong>Privasi:</strong> Password Anda tidak pernah dikirim ke server. Semua pengecekan dilakukan di browser Anda.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

