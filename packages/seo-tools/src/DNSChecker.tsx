'use client'

import { useState } from 'react'
import { Globe, Search, Copy, Check } from 'lucide-react'

interface DNSRecord {
  type: string
  value: string
  ttl?: string
}

export function DNSChecker() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<Record<string, DNSRecord[]>>({})
  const [error, setError] = useState('')

  const checkDNS = async () => {
    if (!domain) {
      alert('Masukkan domain terlebih dahulu!')
      return
    }

    setLoading(true)
    setError('')
    setRecords({})

    try {
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]
      const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS']
      const allRecords: Record<string, DNSRecord[]> = {}

      // Fetch all record types in parallel
      const promises = recordTypes.map(async (type) => {
        try {
          const typeNum = type === 'A' ? 1 : type === 'AAAA' ? 28 : type === 'CNAME' ? 5 : type === 'MX' ? 15 : type === 'TXT' ? 16 : 2
          const response = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=${typeNum}`)
          const data = await response.json()

          if (data.Status === 0 && data.Answer) {
            const records: DNSRecord[] = data.Answer.map((r: any) => {
              let value = r.data
              if (type === 'MX') {
                // MX records: priority + domain
                const parts = r.data.split(' ')
                value = `${parts[0]} ${parts.slice(1).join(' ')}`
              }
              return {
                type,
                value,
                ttl: r.TTL?.toString()
              }
            })
            if (records.length > 0) {
              allRecords[type] = records
            }
          }
        } catch (err) {
          // Silently fail for individual record types
        }
      })

      await Promise.all(promises)

      if (Object.keys(allRecords).length > 0) {
        setRecords(allRecords)
      } else {
        setError('Tidak dapat mengambil DNS records. Domain mungkin tidak valid atau tidak memiliki records yang dapat diakses.')
      }
    } catch (err: any) {
      setError('Gagal mengambil DNS records. ' + (err.message || ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">DNS Record Checker</h1>
        <p className="text-sm sm:text-base text-neutral-600">Cek catatan DNS (A, CNAME, MX, TXT) dari domain</p>
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
            onClick={checkDNS}
            disabled={loading || !domain}
            className="btn-primary flex items-center justify-center gap-2 min-h-[44px] text-sm sm:text-base"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Checking...' : 'Check DNS'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="text-xs sm:text-sm text-red-800">{error}</div>
        </div>
      )}

      {Object.keys(records).length > 0 && (
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            <span className="text-sm sm:text-base">DNS Records untuk {domain}</span>
          </h3>
          
          <div className="space-y-3 sm:space-y-4">
            {Object.entries(records).map(([type, typeRecords]) => (
              <div key={type} className="border border-neutral-200 rounded-lg overflow-hidden">
                <div className="bg-neutral-50 px-3 sm:px-4 py-2 font-semibold text-xs sm:text-sm text-neutral-700 border-b border-neutral-200">
                  {type} Records
                </div>
                <div className="divide-y divide-neutral-200">
                  {typeRecords.map((record, index) => (
                    <div key={index} className="p-3 sm:p-4">
                      <div className="font-mono text-xs sm:text-sm text-neutral-900 break-all">
                        {record.value}
                      </div>
                      {record.ttl && (
                        <div className="text-xs text-neutral-500 mt-1">TTL: {record.ttl}s</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-800">
            ℹ️ <strong>Info:</strong> Tool ini menggunakan Google Public DNS API. Beberapa record mungkin tidak ditampilkan jika domain menggunakan DNS khusus atau private records.
          </div>
        </div>
      )}
    </div>
  )
}

