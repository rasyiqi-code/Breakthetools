// Server wrapper for client home page to avoid calling client hooks during prerender
import HomePageClient from './pageClient'

export const dynamic = 'force-dynamic'

export default function HomePage() {
    return <HomePageClient />
}

