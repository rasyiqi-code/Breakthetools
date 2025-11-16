'use client'

import { useState } from 'react'
import { Globe, Search, Shield, Calendar } from 'lucide-react'

export function SSLChecker() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [certInfo, setCertInfo] = useState<{
    issuer: string
    validFrom: string
    validTo: string
    isValid: boolean
    daysRemaining: number
  } | null>(null)
  const [error, setError] = useState('')

  const checkSSL = async () => {
    if (!domain) {
      alert('Masukkan domain terlebih dahulu!')
      return
    }

    setLoading(true)
    setError('')
    setCertInfo(null)

    try {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]
      
      // Use crt.sh API to get SSL certificate info
      const apiUrl = `https://crt.sh/?q=${encodeURIComponent(cleanDomain)}&output=json`
      
      try {
        const response = await fetch(apiUrl)
        const certificates = await response.json()
        
        if (certificates && certificates.length > 0) {
          // Get the most recent certificate
          const cert = certificates[0]
          const notBefore = new Date(cert.not_before)
          const notAfter = new Date(cert.not_after)
          const now = new Date()
          const isValid = now >= notBefore && now <= notAfter
          const daysRemaining = Math.floor((notAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          
          setCertInfo({
            issuer: cert.issuer_name || 'Unknown',
            validFrom: notBefore.toLocaleDateString('id-ID', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            validTo: notAfter.toLocaleDateString('id-ID', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            isValid,
            daysRemaining: isValid ? daysRemaining : 0
          })
        } else {
          setError('Tidak ditemukan sertifikat SSL untuk domain ini. Domain mungkin tidak menggunakan HTTPS atau sertifikat tidak terdaftar di crt.sh.')
        }
      } catch (apiErr) {
        // Fallback: Try to check if HTTPS is accessible
        try {
          const testUrl = `https://${cleanDomain}`
          const testResponse = await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' })
          
          // If we can reach it, SSL exists but we can't get details
          setError('Situs menggunakan HTTPS, tetapi detail sertifikat tidak dapat diambil dari browser. Gunakan tools seperti SSL Labs untuk informasi lengkap.')
        } catch {
          setError('Tidak dapat mengakses domain atau domain tidak menggunakan HTTPS.')
        }
      }
    } catch (err: any) {
      setError('Gagal memeriksa sertifikat SSL. ' + (err.message || 'Pastikan domain valid.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">SSL Certificate Checker</h1>
        <p className="text-sm sm:text-base text-neutral-600">Cek informasi sertifikat SSL dari domain</p>
      </div>

      <div className="tool-card p-4 sm:p-6 mb-4 sm:mb-6">
        <label className="text-sm font-medium text-neutral-700 mb-3 block">
          Masukkan Domain
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="input-field flex-1 text-sm sm:text-base min-h-[44px]"
          />
          <button
            onClick={checkSSL}
            disabled={loading || !domain}
            className="btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Checking...' : 'Check SSL'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="text-xs sm:text-sm text-red-800">
            ⚠️ {error}
            <div className="text-xs mt-2 text-red-700">
              Catatan: Untuk analisis SSL lengkap (cipher suites, vulnerabilities), gunakan <a href="https://www.ssllabs.com/ssltest/" target="_blank" rel="noopener noreferrer" className="underline">SSL Labs</a>.
            </div>
          </div>
        </div>
      )}

      {certInfo && (
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            <span className="break-words">SSL Certificate Info untuk {domain}</span>
          </h3>
          
          <div className={`p-4 sm:p-6 rounded-lg border-2 ${
            certInfo.isValid
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-neutral-600">Status:</span>
                <span className={`font-semibold text-xs sm:text-sm ${
                  certInfo.isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {certInfo.isValid ? 'Valid' : 'Invalid/Expired'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-neutral-600">Issuer:</span>
                <span className="font-medium text-neutral-900 text-xs sm:text-sm break-words text-right">{certInfo.issuer}</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-neutral-600">Valid From:</span>
                <span className="font-medium text-neutral-900 text-xs sm:text-sm">{certInfo.validFrom}</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-neutral-600">Valid To:</span>
                <span className="font-medium text-neutral-900 text-xs sm:text-sm">{certInfo.validTo}</span>
              </div>
              {certInfo.daysRemaining > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-neutral-600">Days Remaining:</span>
                  <span className="font-medium text-neutral-900 text-xs sm:text-sm">{certInfo.daysRemaining} hari</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

