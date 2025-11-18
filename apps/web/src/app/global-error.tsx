'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error:', error)
    }
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2 text-center">
              Something went wrong
            </h2>
            <p className="text-neutral-600 mb-4 text-center">
              {error?.message || 'An unexpected error occurred'}
            </p>
            {error?.digest && (
              <p className="text-xs text-neutral-400 mb-4 text-center">
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
