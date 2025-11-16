/**
 * Load messages untuk react-intl
 * Convert format JSON next-intl ke format react-intl
 */

import enMessages from '../../messages/en.json'
import idMessages from '../../messages/id.json'
import arMessages from '../../messages/ar.json'
import zhMessages from '../../messages/zh.json'

// Convert nested object ke flat object untuk react-intl
function flattenMessages(nestedMessages: any, prefix = ''): Record<string, string> {
  const flattened: Record<string, string> = {}

  Object.keys(nestedMessages).forEach(key => {
    const value = nestedMessages[key]
    const newKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      flattened[newKey] = value
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(flattened, flattenMessages(value, newKey))
    }
  })

  return flattened
}

export const messages = {
  en: flattenMessages(enMessages),
  id: flattenMessages(idMessages),
  ar: flattenMessages(arMessages),
  zh: flattenMessages(zhMessages),
}

