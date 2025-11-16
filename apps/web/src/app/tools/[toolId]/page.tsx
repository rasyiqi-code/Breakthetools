import { redirect } from 'next/navigation'

// Non-locale tools route: redirect ke route dengan locale prefix
// Hindari prerender agar tidak memicu SSR tool components tanpa IntlProvider
export const dynamic = 'force-dynamic'

export default async function ToolPage({
  params
}: {
  params: Promise<{ toolId: string }>
}) {
  const { toolId } = await params
  // Default ke 'en' jika tidak ada locale yang dipilih
  redirect(`/en/tools/${toolId}`)
}

