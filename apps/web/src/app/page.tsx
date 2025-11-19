// Server wrapper for client home page to avoid calling client hooks during prerender
import { Metadata } from 'next'
import HomePageClient from './pageClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Breaktools - Free Online Tools & Utilities',
    description: 'Free online tools and utilities for developers, designers, and everyone. Text tools, image tools, PDF tools, converters, generators, and more. 100% free, no registration required.',
    openGraph: {
        title: 'Breaktools - Free Online Tools & Utilities',
        description: 'Free online tools and utilities for developers, designers, and everyone. 100% free, no registration required.',
        url: process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app',
        locale: 'en',
    },
    twitter: {
        title: 'Breaktools - Free Online Tools & Utilities',
        description: 'Free online tools and utilities for developers, designers, and everyone.',
    },
    alternates: {
        canonical: process.env.NEXT_PUBLIC_BASE_URL || 'https://breaktools.vercel.app',
    },
}

export default function HomePage() {
    return <HomePageClient />
}

