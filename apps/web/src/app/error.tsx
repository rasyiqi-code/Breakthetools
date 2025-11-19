'use client'

import React, { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

type ErrorProps = {
  error: Error
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error)
    }
  }, [error])

  const errorMessage = error?.message || 'An unexpected error occurred'
  const errorDigest = (error as any)?.digest

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2 text-center">
          Something went wrong
        </h2>
        <p className="text-neutral-600 mb-4 text-center">{errorMessage}</p>
        {errorDigest && (
          <p className="text-xs text-neutral-400 mb-4 text-center">
            Error ID: {errorDigest}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
