'use client'

import { useState } from 'react'
import { FileText, Eye, Code } from 'lucide-react'

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(`# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text*

- List item 1
- List item 2
- List item 3

1. Numbered item 1
2. Numbered item 2

[Link text](https://example.com)

\`inline code\`

\`\`\`javascript
// Code block
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> Blockquote text`)

  const markdownToHTML = (md: string): string => {
    let html = md

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-neutral-100 px-1 py-0.5 rounded text-sm">$1</code>')

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-neutral-900 text-green-400 p-4 rounded overflow-x-auto"><code>${code.trim()}</code></pre>`
    })

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-neutral-300 pl-4 italic text-neutral-600">$1</blockquote>')

    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>')
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>')
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')

    // Wrap consecutive list items
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
      if (match.includes('<li>')) {
        return `<ul class="list-disc list-inside space-y-1 my-2">${match}</ul>`
      }
      return match
    })

    // Paragraphs
    html = html.split('\n\n').map(para => {
      if (!para.trim() || para.startsWith('<')) return para
      return `<p class="my-2">${para}</p>`
    }).join('\n')

    // Line breaks
    html = html.replace(/\n/g, '<br>')

    return html
  }

  const html = markdownToHTML(markdown)

  return (
    <div className="max-w-full sm:max-w-4xl lg:max-w-7xl mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Markdown Editor</h1>
        <p className="text-sm sm:text-base text-neutral-600">Editor Markdown dengan preview real-time - Semua proses di browser</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Code className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Markdown Editor
          </h3>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="input-field font-mono text-xs sm:text-sm min-h-[400px] sm:min-h-[600px]"
            placeholder="Ketik Markdown di sini..."
          />
        </div>

        <div className="tool-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Preview
          </h3>
          <div
            className="min-h-[400px] sm:min-h-[600px] p-3 sm:p-4 border border-neutral-200 rounded bg-white prose prose-sm max-w-none overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  )
}

