import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
    // A list of all locales that are supported
    // Add more locales here: 'ar' (Arabic), 'zh' (Mandarin), etc.
    locales: ['en', 'id', 'ar', 'zh'],

    // Used when no locale matches - English is default
    defaultLocale: 'en'
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing)

