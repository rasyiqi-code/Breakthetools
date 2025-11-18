/**
 * Helper functions untuk mendapatkan tool names dan category names dari translations
 */

import { useTranslations } from 'next-intl'

/**
 * Mapping toolId ke translation key format
 * Contoh: 'word-counter' -> 'wordCounter'
 */
function toolIdToKey(toolId: string): string {
  return toolId.split('-').map((part, index) => {
    if (index === 0) return part
    return part.charAt(0).toUpperCase() + part.slice(1)
  }).join('')
}

/**
 * Helper function untuk mendapatkan tool name dari translation
 * @param toolId - Tool ID (e.g., 'word-counter')
 * @param toolsTranslations - Object dengan translations untuk tools (bisa dari messages.tools)
 */
export function getToolName(toolId: string, toolsTranslations: Record<string, any>): string {
  // Mapping toolId ke camelCase: 'word-counter' -> 'wordCounter'
  const toolKey = toolIdToKey(toolId)
  
  // Coba ambil dari tools.{toolKey}.title
  try {
    const toolTranslation = toolsTranslations[toolKey]
    if (toolTranslation && typeof toolTranslation === 'object' && toolTranslation.title) {
      return toolTranslation.title
    }
    // Fallback: coba langsung dari key
    if (toolsTranslations[toolKey] && typeof toolsTranslations[toolKey] === 'string') {
      return toolsTranslations[toolKey]
    }
  } catch {
    // Ignore error, fallback
  }

  // Fallback: cari di toolCategories
  const { toolCategories } = require('@/config/tools')
  const allTools = toolCategories.flatMap((cat: any) => cat.tools)
  const tool = allTools.find((t: any) => t.id === toolId)
  if (tool) {
    return tool.name
  }

  // Final fallback ke toolId as-is
  return toolId
}

/**
 * Helper function untuk mendapatkan tool description dari translation
 * @param toolId - Tool ID (e.g., 'word-counter')
 * @param t - useTranslations hook return value dari 'tools' namespace
 */
export function getToolDescription(toolId: string, t: ReturnType<typeof useTranslations>): string {
  const toolKey = toolIdToKey(toolId)
  
  try {
    const desc = t(`${toolKey}.description`)
    if (desc && desc !== `tools.${toolKey}.description`) {
      return desc
    }
  } catch {
    // Ignore error
  }

  return ''
}

/**
 * Helper function untuk mendapatkan category name dari translation
 * @param categoryId - Category ID (e.g., 'text-tools')
 * @param t - useTranslations hook return value dari 'categories' namespace
 */
export function getCategoryName(categoryId: string, t: ReturnType<typeof useTranslations>): string {
  const categoryNames: Record<string, string> = {
    'text-tools': 'textTools',
    'image-tools': 'imageTools',
    'generator-tools': 'generatorTools',
    'developer-tools': 'developerTools',
    'calculator-tools': 'calculatorTools',
    'seo-tools': 'seoTools',
    'fun-tools': 'funTools',
    'time-tools': 'timeTools',
    'pdf-tools': 'pdfTools',
    'downloader-tools': 'downloaderTools',
  }

  const key = categoryNames[categoryId] || categoryId
  
  try {
    const name = t(key)
    // Jika name tidak sama dengan key (artinya ditemukan), return name
    if (name && name !== key) {
      return name
    }
  } catch {
    // Ignore error
  }

  // Fallback ke categoryId as-is
  return categoryId
}

