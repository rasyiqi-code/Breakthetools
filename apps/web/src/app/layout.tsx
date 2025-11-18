import { Inter } from 'next/font/google'
import '../globals.css'

// Optimasi font loading dengan display swap dan preload
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

// Root layout - middleware will handle locale routing
// All actual layouts are in [locale]/layout.tsx
// This layout provides the HTML structure required by Next.js App Router
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable}`}>
        {children}
      </body>
    </html>
  )
}

