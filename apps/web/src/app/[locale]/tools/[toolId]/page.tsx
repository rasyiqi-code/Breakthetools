// Server Component wrapper untuk ToolPageClient
// Ini memungkinkan kita menggunakan generateStaticParams untuk skip static generation
import { ToolPageClient } from './ToolPageClient'

// Force dynamic rendering untuk tools karena menggunakan client-side features dan IntlProvider
// Ini akan memaksa Next.js untuk render page ini sebagai dynamic route dan skip static generation
export const dynamic = 'force-dynamic'
export const dynamicParams = true

export default function ToolPage() {
  return <ToolPageClient />
}

