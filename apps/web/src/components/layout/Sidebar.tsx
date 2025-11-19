'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toolCategories } from '@/config/tools'
import { Search, ChevronDown, ChevronRight, Home, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    toolCategories.map(cat => cat.id)
  )
  const [isOpen, setIsOpen] = useState(false)

  // Listen for sidebar toggle events from Header
  useEffect(() => {
    const handleToggle = (event: CustomEvent) => {
      setIsOpen(event.detail)
    }

    window.addEventListener('sidebar-toggle', handleToggle as EventListener)
    return () => window.removeEventListener('sidebar-toggle', handleToggle as EventListener)
  }, [])


  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false)
    }
  }, [pathname, isOpen])

  // Hide sidebar on homepage
  // usePathname from next-intl already excludes locale prefix
  // So homepage will be '/' and tool pages will be '/tools/...'
  const isHomePage = pathname === '/'

  if (isHomePage) {
    return null
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const closeSidebar = () => {
    setIsOpen(false)
    // Dispatch event immediately for better responsiveness
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: false }))
  }

  const filteredCategories = toolCategories.map(category => ({
    ...category,
    tools: category.tools.filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.tools.length > 0)

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] bg-white border-r border-neutral-200 overflow-y-auto transition-transform duration-300 ease-in-out',
          'w-80 z-[60]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-4">
          {/* Close button for mobile */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="font-semibold text-neutral-900">Menu</h2>
            <button
              onClick={closeSidebar}
              className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Back to Home */}
          <Link
            href="/"
            onClick={closeSidebar}
            className="flex items-center gap-2 px-3 py-2 mb-4 text-sm text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <nav className="space-y-1">
            {filteredCategories.map((category) => {
              const isExpanded = expandedCategories.includes(category.id)

              return (
                <div key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded transition-colors min-h-[44px]"
                  >
                    <div className="flex items-center space-x-2">
                      <category.icon className="w-4 h-4" />
                      <span>{category.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {category.tools.map((tool) => {
                        const isActive = pathname === `/tools/${tool.id}`

                        return (
                          <Link
                            key={tool.id}
                            href={`/tools/${tool.id}`}
                            onClick={closeSidebar}
                            className={cn(
                              'flex items-center px-3 py-2 text-sm rounded transition-colors min-h-[44px]',
                              isActive
                                ? 'bg-primary-50 text-primary-700 font-medium'
                                : 'text-neutral-600 hover:bg-neutral-100'
                            )}
                          >
                            {tool.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
