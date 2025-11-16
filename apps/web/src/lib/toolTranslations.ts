/**
 * Helper functions untuk mendapatkan tool names dan category names dari translations
 */

import { useIntl } from 'react-intl'

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
 * @param intl - useIntl hook return value
 */
export function getToolName(toolId: string, intl: ReturnType<typeof useIntl>): string {
  // Mapping toolId ke camelCase: 'word-counter' -> 'wordCounter'
  const toolKey = toolIdToKey(toolId)
  
  // Coba ambil dari tools.{toolKey}.title (yang sudah ada di messages)
  const titleKey = `tools.${toolKey}.title`
  
  try {
    const title = intl.formatMessage({ id: titleKey }, {})
    // Jika title tidak sama dengan key (artinya ditemukan), return title
    if (title && title !== titleKey) {
      return title
    }
  } catch {
    // Ignore error
  }

  // Fallback ke toolId as-is
  return toolId
}

/**
 * Helper function untuk mendapatkan tool description dari translation
 * @param toolId - Tool ID (e.g., 'word-counter')
 * @param intl - useIntl hook return value
 */
export function getToolDescription(toolId: string, intl: ReturnType<typeof useIntl>): string {
  const toolKey = toolIdToKey(toolId)
  const descKey = `tools.${toolKey}.description`
  
  try {
    const desc = intl.formatMessage({ id: descKey }, {})
    if (desc && desc !== descKey) {
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
 * @param intl - useIntl hook return value
 */
export function getCategoryName(categoryId: string, intl: ReturnType<typeof useIntl>): string {
  const categoryNames: Record<string, string> = {
    'text-tools': 'categories.textTools',
    'image-tools': 'categories.imageTools',
    'generator-tools': 'categories.generatorTools',
    'developer-tools': 'categories.developerTools',
    'calculator-tools': 'categories.calculatorTools',
    'seo-tools': 'categories.seoTools',
    'fun-tools': 'categories.funTools',
    'time-tools': 'categories.timeTools',
    'pdf-tools': 'categories.pdfTools',
    'downloader-tools': 'categories.downloaderTools',
  }

  const key = categoryNames[categoryId] || `categories.${categoryId}`
  
  try {
    const name = intl.formatMessage({ id: key }, {})
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

