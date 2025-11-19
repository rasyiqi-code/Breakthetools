'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>{error?.message || 'An unexpected error occurred'}</p>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  )
}
