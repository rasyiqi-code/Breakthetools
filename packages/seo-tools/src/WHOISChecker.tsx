'use client'

import { useState } from 'react'
import { Globe, Search, Calendar, User, Server, Shield, Mail } from 'lucide-react'

export function WHOISChecker() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [whoisData, setWhoisData] = useState<{
    registrar?: string
    created?: string
    expires?: string
    updated?: string
    nameservers?: string[]
    status?: string[]
    registrant?: string
    adminContact?: string
    techContact?: string
    rawData?: string
  } | null>(null)
  const [error, setError] = useState('')

  const checkWHOIS = async () => {
    if (!domain) {
      alert('Masukkan domain terlebih dahulu!')
      return
    }

    setLoading(true)
    setError('')
    setWhoisData(null)

    try {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]

      // Use APILayer WHOIS API
      // Documentation: https://marketplace.apilayer.com/whois-api
      const apiKey = process.env.NEXT_PUBLIC_APILAYER_WHOIS_API_KEY

      if (!apiKey) {
        setError('API Key tidak dikonfigurasi. Silakan set NEXT_PUBLIC_APILAYER_WHOIS_API_KEY di environment variables.')
        setLoading(false)
        return
      }

      const apiUrl = `https://api.apilayer.com/whois/query?domain=${encodeURIComponent(cleanDomain)}`

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'apikey': apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Extract data from APILayer response
      if (data.result) {
        const result = data.result

        // Extract name servers
        let nameservers: string[] = []
        if (result.name_servers) {
          nameservers = Array.isArray(result.name_servers)
            ? result.name_servers
            : [result.name_servers]
        } else if (result.nameServers) {
          nameservers = Array.isArray(result.nameServers)
            ? result.nameServers
            : [result.nameServers]
        }

        // Extract status
        let status: string[] = []
        if (result.status) {
          status = Array.isArray(result.status) ? result.status : [result.status]
        } else if (result.domain_status) {
          status = Array.isArray(result.domain_status) ? result.domain_status : [result.domain_status]
        }

        // Extract registrant info
        const registrant = result.registrant_name || result.registrant?.name || result.owner || 'N/A'
        const adminContact = result.admin_name || result.administrative_contact?.name || result.admin?.name || 'N/A'
        const techContact = result.tech_name || result.technical_contact?.name || result.tech?.name || 'N/A'

        setWhoisData({
          registrar: result.registrar || result.registrar_name || 'N/A',
          created: result.creation_date || result.created_date || result.created || 'N/A',
          expires: result.expiration_date || result.expires_date || result.expires || 'N/A',
          updated: result.updated_date || result.last_updated || result.updated || undefined,
          nameservers: nameservers.filter(ns => ns && ns.trim() !== ''),
          status: status.filter(s => s && s.trim() !== ''),
          registrant: registrant !== 'N/A' ? registrant : undefined,
          adminContact: adminContact !== 'N/A' ? adminContact : undefined,
          techContact: techContact !== 'N/A' ? techContact : undefined,
          rawData: result.raw || ''
        })
      } else if (data.error) {
        setError(`API Error: ${data.error.info || data.error.message || 'Tidak dapat mengambil data WHOIS'}`)
      } else {
        setError('Tidak dapat mengambil data WHOIS. Domain mungkin tidak valid atau tidak tersedia.')
      }
    } catch (err: any) {
      setError('Gagal mengambil data WHOIS. ' + (err.message || 'Domain mungkin tidak valid atau API rate limit tercapai.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">WHOIS Checker</h1>
        <p className="text-sm sm:text-base text-neutral-600">Cek informasi registrasi domain (WHOIS data)</p>
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
            onClick={checkWHOIS}
            disabled={loading || !domain}
            className="btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Checking...' : 'Check WHOIS'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="text-xs sm:text-sm text-red-800">
            ⚠️ {error}
          </div>
        </div>
      )}

      {whoisData && (
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            <span className="text-sm sm:text-base">WHOIS Data untuk {domain}</span>
          </h3>

          <div className="space-y-3 sm:space-y-4">
            {whoisData.registrar && (
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-neutral-600">Registrar</div>
                  <div className="font-medium text-sm sm:text-base text-neutral-900 break-words">{whoisData.registrar}</div>
                </div>
              </div>
            )}

            {whoisData.created && (
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-neutral-600">Tanggal Registrasi</div>
                  <div className="font-medium text-sm sm:text-base text-neutral-900 break-words">{whoisData.created}</div>
                </div>
              </div>
            )}

            {whoisData.expires && (
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-neutral-600">Tanggal Kedaluwarsa</div>
                  <div className="font-medium text-sm sm:text-base text-neutral-900 break-words">{whoisData.expires}</div>
                </div>
              </div>
            )}

            {whoisData.updated && (
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-neutral-600">Terakhir Diupdate</div>
                  <div className="font-medium text-sm sm:text-base text-neutral-900 break-words">{whoisData.updated}</div>
                </div>
              </div>
            )}

            {whoisData.status && whoisData.status.length > 0 && (
              <div className="flex items-start gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-neutral-600 mb-1">Status</div>
                  <div className="flex flex-wrap gap-2">
                    {whoisData.status.map((s, index) => (
                      <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {whoisData.nameservers && whoisData.nameservers.length > 0 && (
              <div className="p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-4 h-4 text-neutral-600" />
                  <div className="text-xs text-neutral-600">Name Servers</div>
                </div>
                <div className="space-y-1">
                  {whoisData.nameservers.map((ns, index) => (
                    <div key={index} className="font-mono text-xs sm:text-sm text-neutral-900 break-all">{ns}</div>
                  ))}
                </div>
              </div>
            )}

            {whoisData.registrant && whoisData.registrant !== 'N/A' && (
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-neutral-600">Registrant</div>
                  <div className="font-medium text-sm sm:text-base text-neutral-900 break-words">{whoisData.registrant}</div>
                </div>
              </div>
            )}

            {whoisData.adminContact && whoisData.adminContact !== 'N/A' && (
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-neutral-600">Admin Contact</div>
                  <div className="font-medium text-sm sm:text-base text-neutral-900 break-words">{whoisData.adminContact}</div>
                </div>
              </div>
            )}

            {whoisData.techContact && whoisData.techContact !== 'N/A' && (
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-neutral-600">Tech Contact</div>
                  <div className="font-medium text-sm sm:text-base text-neutral-900 break-words">{whoisData.techContact}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

