'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Clock, Star, Zap } from 'lucide-react'
import { toolCategories } from '@/config/tools'
import { useTranslations } from 'next-intl'
import { getToolName, getCategoryName } from '@/lib/toolTranslations'

type ToolItem = {
  id: string
  name: string
  description: string
  category: string
  categoryIcon: any
}

type CommandPaletteProps = {
  onOpenChange?: (isOpen: boolean) => void
}

export function CommandPalette({ onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const tTools = useTranslations('tools')
  const tCategories = useTranslations('categories')

  // Flatten all tools dengan translations
  const allTools: ToolItem[] = toolCategories.flatMap(category =>
    category.tools.map(tool => ({
      ...tool,
      name: getToolName(tool.id, tTools),
      description: tool.description, // TODO: bisa di-translate juga jika perlu
      category: getCategoryName(category.id, tCategories),
      categoryIcon: category.icon
    }))
  )

  // Filter tools based on query
  const filteredTools = query
    ? allTools.filter(tool =>
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase()) ||
        tool.category.toLowerCase().includes(query.toLowerCase())
      )
    : allTools.slice(0, 8) // Show first 8 by default

  // Get recent tools from localStorage - defer untuk menghindari blocking
  const [recentTools, setRecentTools] = useState<string[]>([])
  
  useEffect(() => {
    // Defer localStorage access untuk menghindari blocking render
    const timeoutId = setTimeout(() => {
      try {
        const recent = localStorage.getItem('recentTools')
        if (recent) {
          setRecentTools(JSON.parse(recent))
        }
      } catch (error) {
        // Silently fail jika localStorage tidak tersedia
        console.warn('Failed to read recentTools from localStorage', error)
      }
    }, 0)
    
    return () => clearTimeout(timeoutId)
  }, [])

  // Focus input on mount and Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
        onOpenChange?.(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
        onOpenChange?.(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % filteredTools.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + filteredTools.length) % filteredTools.length)
    } else if (e.key === 'Enter' && filteredTools[selectedIndex]) {
      handleSelectTool(filteredTools[selectedIndex])
    }
  }

  const handleSelectTool = (tool: ToolItem) => {
    // Save to recent tools - defer untuk menghindari blocking navigation
    try {
      const updated = [tool.id, ...recentTools.filter(id => id !== tool.id)].slice(0, 5)
      // Defer localStorage write untuk tidak block navigation
      setTimeout(() => {
        try {
          localStorage.setItem('recentTools', JSON.stringify(updated))
          setRecentTools(updated)
        } catch (error) {
          console.warn('Failed to save recentTools to localStorage', error)
        }
      }, 0)
    } catch (error) {
      console.warn('Failed to update recentTools', error)
    }
    
    // Navigate immediately
    router.push(`/tools/${tool.id}`)
  }

  const recentToolsData = recentTools
    .map(id => allTools.find(t => t.id === id))
    .filter(Boolean) as ToolItem[]

  return (
    <div className="w-full max-w-4xl mx-auto relative z-[101]">
      {/* Main Search Input - Browser Style */}
      <div className="relative z-[102]">
        <div className={`
          relative bg-white rounded-full border-2 transition-all duration-200
          ${isOpen || query ? 'border-primary-500 shadow-2xl' : 'border-neutral-300 shadow-lg hover:border-neutral-400'}
        `}>
          <div className="flex items-center px-6 py-5">
            <Search className={`w-6 h-6 mr-4 flex-shrink-0 transition-colors ${
              isOpen || query ? 'text-primary-600' : 'text-neutral-400'
            }`} />
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setIsOpen(true)
                setSelectedIndex(0)
                onOpenChange?.(true)
              }}
              onFocus={() => {
                setIsOpen(true)
                onOpenChange?.(true)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Cari tools atau ketik apa yang ingin kamu lakukan..."
              className="flex-1 text-lg outline-none placeholder:text-neutral-400"
            />
            
            <kbd className="hidden md:block px-3 py-1.5 text-xs font-semibold text-neutral-500 bg-neutral-100 border border-neutral-300 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Dropdown Results */}
        {isOpen && (
          <div className="fixed md:absolute top-[calc(100%+12px)] left-4 md:left-0 right-4 md:right-0 w-auto md:w-full max-w-4xl mx-auto md:mx-0 mt-3 bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden z-[100] max-h-[calc(100vh-200px)] md:max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent hover:scrollbar-thumb-neutral-400">
            {/* Recent Tools */}
            {!query && recentToolsData.length > 0 && (
              <div className="p-4 border-b border-neutral-100">
                <div className="flex items-center text-xs font-semibold text-neutral-500 mb-3 px-2">
                  <Clock className="w-3.5 h-3.5 mr-2" />
                  RECENT
                </div>
                <div className="space-y-1">
                  {recentToolsData.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelectTool(tool)}
                      className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors text-left group"
                    >
                      <div className="p-2 bg-primary-50 rounded-lg mr-3 group-hover:bg-primary-100 transition-colors">
                        <tool.categoryIcon className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-neutral-900">{tool.name}</div>
                        <div className="text-xs text-neutral-500">{tool.category}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results or All Tools */}
            <div className="p-4">
              <div className="flex items-center text-xs font-semibold text-neutral-500 mb-3 px-2">
                {query ? (
                  <>
                    <Search className="w-3.5 h-3.5 mr-2" />
                    RESULTS ({filteredTools.length})
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 mr-2" />
                    QUICK ACCESS
                  </>
                )}
              </div>
              
              {filteredTools.length > 0 ? (
                <div className="space-y-1">
                  {filteredTools.map((tool, index) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelectTool(tool)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors text-left group ${
                        selectedIndex === index
                          ? 'bg-primary-50 border border-primary-200'
                          : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mr-3 transition-colors ${
                        selectedIndex === index
                          ? 'bg-primary-100'
                          : 'bg-neutral-100 group-hover:bg-neutral-200'
                      }`}>
                        <tool.categoryIcon className={`w-4 h-4 ${
                          selectedIndex === index ? 'text-primary-600' : 'text-neutral-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-neutral-900 truncate">
                          {tool.name}
                        </div>
                        <div className="text-xs text-neutral-500 truncate">
                          {tool.description}
                        </div>
                      </div>
                      
                      <div className="flex items-center ml-3 gap-2">
                        <span className="text-xs text-neutral-400 hidden md:block">
                          {tool.category}
                        </span>
                        <ArrowRight className={`w-4 h-4 transition-all ${
                          selectedIndex === index
                            ? 'text-primary-600 opacity-100'
                            : 'text-neutral-400 opacity-0 group-hover:opacity-100'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="text-neutral-400 mb-2">😕</div>
                  <div className="text-sm text-neutral-600">
                    Tidak ada tools yang cocok dengan "{query}"
                  </div>
                </div>
              )}
            </div>

            {/* Footer Tips */}
            <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <div className="flex items-center gap-4">
                  <span><kbd className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded">↑↓</kbd> Navigate</span>
                  <span><kbd className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded">Enter</kbd> Open</span>
                  <span><kbd className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded">Esc</kbd> Close</span>
                </div>
                <span className="hidden md:block">Press <kbd className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded">⌘K</kbd> anytime</span>
              </div>
            </div>
          </div>
        )}

        {/* Backdrop - Invisible, hanya untuk close on click */}
        {isOpen && (
          <div
            className="fixed inset-0 z-[99]"
            onClick={() => {
              setIsOpen(false)
              setQuery('')
              onOpenChange?.(false)
            }}
          />
        )}
      </div>

      {/* Quick Action Shortcuts */}
      {!isOpen && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {toolCategories.slice(0, 4).map((category) => (
            <button
              key={category.id}
              onClick={() => {
                const firstTool = category.tools[0]
                if (firstTool) {
                  handleSelectTool({
                    ...firstTool,
                    category: category.name,
                    categoryIcon: category.icon
                  })
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-sm group"
            >
              <category.icon className="w-4 h-4 text-neutral-600 group-hover:text-primary-600 transition-colors" />
              <span className="text-neutral-700 group-hover:text-primary-700">{category.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

