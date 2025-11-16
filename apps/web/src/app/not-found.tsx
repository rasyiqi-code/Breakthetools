import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-neutral-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-700 mb-2">
          Tool Tidak Ditemukan
        </h2>
        <p className="text-neutral-600">
          Maaf, tool yang Anda cari tidak tersedia atau sedang dalam pengembangan.
        </p>
      </div>
      
      <Link href="/" className="btn-primary inline-flex items-center space-x-2">
        <Home className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </Link>
    </div>
  )
}

