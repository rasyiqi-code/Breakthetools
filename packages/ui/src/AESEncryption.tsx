'use client'

import { useState } from 'react'
import { Lock, Unlock, Copy, Check, Key } from 'lucide-react'

export function AESEncryption() {
  const [text, setText] = useState('')
  const [password, setPassword] = useState('')
  const [encrypted, setEncrypted] = useState('')
  const [decrypted, setDecrypted] = useState('')
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [copied, setCopied] = useState(false)

  const getKey = async (password: string): Promise<CryptoKey> => {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('breaktools-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  const encrypt = async () => {
    if (!text || !password) {
      alert('Masukkan teks dan password!')
      return
    }

    try {
      const key = await getKey(password)
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const iv = crypto.getRandomValues(new Uint8Array(12))

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      )

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength)
      combined.set(iv)
      combined.set(new Uint8Array(encrypted), iv.length)

      // Convert to base64
      const base64 = btoa(String.fromCharCode(...combined))
      setEncrypted(base64)
      setDecrypted('')
    } catch (err: any) {
      alert('Gagal mengenkripsi: ' + err.message)
    }
  }

  const decrypt = async () => {
    if (!text || !password) {
      alert('Masukkan teks terenkripsi dan password!')
      return
    }

    try {
      const key = await getKey(password)
      
      // Decode from base64
      const combined = Uint8Array.from(atob(text), c => c.charCodeAt(0))
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, 12)
      const encrypted = combined.slice(12)

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      )

      const decoder = new TextDecoder()
      setDecrypted(decoder.decode(decrypted))
      setEncrypted('')
    } catch (err: any) {
      alert('Gagal mendekripsi. Pastikan password benar dan teks adalah hasil enkripsi yang valid.')
    }
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">AES Encryption / Decryption</h1>
        <p className="text-sm sm:text-base text-neutral-600">Enkripsi dan dekripsi teks menggunakan AES-256 - 100% client-side, aman dan private</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => setMode('encrypt')}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-all min-h-[44px] text-xs sm:text-sm ${
              mode === 'encrypt'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Enkripsi
          </button>
          <button
            onClick={() => setMode('decrypt')}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-all min-h-[44px] text-xs sm:text-sm ${
              mode === 'decrypt'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <Unlock className="w-4 h-4 inline mr-2" />
            Dekripsi
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              {mode === 'encrypt' ? 'Teks yang akan dienkripsi' : 'Teks terenkripsi (Base64)'}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={mode === 'encrypt' ? 'Masukkan teks rahasia...' : 'Paste teks terenkripsi di sini...'}
              className="input-field min-h-[150px] text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block flex items-center gap-2">
              <Key className="w-4 h-4" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password untuk enkripsi/dekripsi"
              className="input-field text-sm sm:text-base min-h-[44px]"
            />
          </div>

          <button
            onClick={mode === 'encrypt' ? encrypt : decrypt}
            disabled={!text || !password}
            className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
          >
            {mode === 'encrypt' ? (
              <>
                <Lock className="w-4 h-4" />
                Enkripsi Teks
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                Dekripsi Teks
              </>
            )}
          </button>
        </div>
      </div>

      {(encrypted || decrypted) && (
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4">
            {mode === 'encrypt' ? 'Hasil Enkripsi' : 'Hasil Dekripsi'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-2">
                <label className="text-sm font-medium text-neutral-700">
                  {mode === 'encrypt' ? 'Teks Terenkripsi (Base64):' : 'Teks Terdekripsi:'}
                </label>
                <button
                  onClick={() => handleCopy(encrypted || decrypted)}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 min-h-[44px] px-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-neutral-50 p-3 sm:p-4 rounded border border-neutral-200">
                <div className="font-mono text-xs sm:text-sm break-all text-neutral-900">
                  {encrypted || decrypted}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800">
              🔒 <strong>Keamanan:</strong> Semua proses enkripsi/dekripsi dilakukan di browser Anda. Data tidak pernah dikirim ke server.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

