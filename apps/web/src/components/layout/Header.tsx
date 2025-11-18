'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname as useNextPathname, useRouter } from 'next/navigation'
import { Wrench, Github, Menu, X, Globe, Check } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
]

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)
  
  // Use next-intl hooks - these require NextIntlClientProvider
  // Must be called in this order and before any conditional logic
  const locale = useLocale()
  const tNav = useTranslations('nav')
  
  // Use Next.js standard hooks to avoid routing context issues
  const fullPathname = useNextPathname() // This includes locale: /en/tools/...
  const router = useRouter()
  
  // Extract pathname without locale prefix (same as createNavigation usePathname)
  // fullPathname format: /en/tools/word-counter or /en/ or /en
  // Remove locale prefix (first segment after /)
  const pathname = fullPathname 
    ? fullPathname.replace(/^\/[^/]+/, '') || '/' 
    : '/'

  // Sync sidebar state with global state
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setIsSidebarOpen(event.detail)
    }
    
    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener)
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener)
  }, [])

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false)
      }
    }

    if (isLangMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isLangMenuOpen])

  const toggleSidebar = () => {
    const newState = !isSidebarOpen
    setIsSidebarOpen(newState)
    // Dispatch event immediately for better responsiveness
      window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: newState }))
  }

  const handleLanguageChange = (newLocale: string) => {
    // Build new path with locale
    // pathname already excludes locale prefix, so we just prepend the new locale
    const newPath = `/${newLocale}${pathname === '/' ? '' : pathname}`
    router.push(newPath)
    setIsLangMenuOpen(false)
  }

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]
  
  // Helper function to build href with locale prefix
  const getLocalizedHref = (href: string) => {
    // If href starts with #, return as is (anchor link)
    if (href.startsWith('#')) return href
    // If href is absolute URL, return as is
    if (href.startsWith('http')) return href
    // Otherwise, prepend locale
    return `/${locale}${href === '/' ? '' : href}`
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-[5px] sm:px-[5px] py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger menu for mobile */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <Link href={getLocalizedHref('/')} className="flex items-center space-x-2 group">
              <div className="bg-primary-500 p-1.5 rounded-lg group-hover:bg-primary-600 transition-colors">
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="font-bold text-neutral-900 text-base sm:text-lg">Breaktools</span>
            </Link>
          </div>

          <nav className="flex items-center gap-1">
            <Link
              href={getLocalizedHref('/')}
              className="hidden sm:block px-3 py-1.5 text-sm text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            >
              {tNav('home')}
            </Link>
            <Link
              href={getLocalizedHref('#tools')}
              className="hidden sm:block px-3 py-1.5 text-sm text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            >
              {tNav('tools')}
            </Link>
            
            {/* Language Switcher */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="p-1.5 sm:ml-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all flex items-center gap-1.5"
                aria-label="Change language"
                aria-expanded={isLangMenuOpen}
              >
                <Globe className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">{currentLanguage.flag}</span>
              </button>

              {/* Dropdown Menu */}
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-primary-50 transition-colors ${
                        locale === lang.code ? 'text-primary-600 font-medium' : 'text-neutral-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                      {locale === lang.code && (
                        <Check className="w-4 h-4 text-primary-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:ml-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
