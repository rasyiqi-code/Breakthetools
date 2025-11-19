'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wrench, Github, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Sync sidebar state with global state
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setIsSidebarOpen(event.detail)
    }
    
    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener)
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener)
  }, [])

  const toggleSidebar = () => {
    const newState = !isSidebarOpen
    setIsSidebarOpen(newState)
    // Dispatch event immediately for better responsiveness
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: newState }))
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

            <Link href="/" className="flex items-center space-x-2 group">
              <div className="bg-primary-500 p-1.5 rounded-lg group-hover:bg-primary-600 transition-colors">
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="font-bold text-neutral-900 text-base sm:text-lg">Breaktools</span>
            </Link>
          </div>

          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="hidden sm:block px-3 py-1.5 text-sm text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            >
              Home
            </Link>
            <Link
              href="#tools"
              className="hidden sm:block px-3 py-1.5 text-sm text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            >
              Tools
            </Link>

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
