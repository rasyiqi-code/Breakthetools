# Panduan Development

Dokumentasi untuk developer yang ingin berkontribusi atau mengembangkan Breaktools.

## 🏗️ Struktur Monorepo

Proyek ini menggunakan Bun workspaces untuk mengelola multiple packages dalam satu repository:

- **apps/web** - Next.js frontend application
- **packages/** - Shared packages yang digunakan oleh aplikasi

### Keuntungan Monorepo:
1. ✅ **Single node_modules** - Dependency hanya diinstall sekali
2. ✅ **Type-safe imports** - TypeScript types shared antar packages
3. ✅ **Faster development** - Hot reload bekerja di semua packages
4. ✅ **Better organization** - Setiap kategori tool memiliki package sendiri

## 📦 Package Structure

### Text Tools (`packages/text-tools`)
Tools untuk pemrosesan teks:
- Word Counter
- Text Diff
- Text Cleaner
- Case Converter
- Lorem Ipsum Generator

### Generator Tools (`packages/generator-tools`)
Tools untuk generate data:
- QR Code Generator
- Password Generator
- UUID Generator
- Hash Generator
- Color Picker
- CSS Gradient Generator

### UI/Developer Tools (`packages/ui`)
Tools untuk developer:
- JSON Formatter
- Base64 Encoder/Decoder
- URL Encoder/Decoder
- JWT Decoder

## 🎯 Menambah Tool Baru

### 1. Pilih atau Buat Package

Tentukan kategori tool Anda:
- Text processing → `packages/text-tools`
- Generator → `packages/generator-tools`
- Developer utilities → `packages/ui`
- Image processing → `packages/image-tools` (coming soon)
- PDF utilities → `packages/pdf-tools` (coming soon)

### 2. Buat Komponen Tool

Buat file baru di `packages/{category}/src/YourTool.tsx`:

```tsx
'use client'

import { useState } from 'react'

export function YourTool() {
  const [input, setInput] = useState('')
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Your Tool Name
        </h1>
        <p className="text-neutral-600">
          Deskripsi tool Anda
        </p>
      </div>
      
      {/* Tool implementation */}
    </div>
  )
}
```

### 3. Export dari Package

Edit `packages/{category}/src/index.ts`:

```ts
export { YourTool } from './YourTool'
```

### 4. Tambah ke Konfigurasi

Edit `apps/web/src/config/tools.ts`:

```ts
{
  id: 'your-tool',
  name: 'Your Tool Name',
  description: 'Deskripsi singkat tool'
}
```

### 5. Map Komponen ke Route

Edit `apps/web/src/app/tools/[toolId]/page.tsx`:

```ts
import { YourTool } from '@breaktools/{category}'

const toolComponents: Record<string, React.ComponentType> = {
  // ... existing tools
  'your-tool': YourTool,
}
```

## 🎨 Design Guidelines

### Color Palette

```css
/* Primary Colors (Orange) */
primary-50:  #fef7ee
primary-500: #f2711c
primary-600: #e35814

/* Neutral Colors */
neutral-50:  #fafafa
neutral-600: #525252
neutral-900: #171717
```

### Component Classes

Gunakan utility classes yang sudah didefinisikan:

```tsx
// Card container
<div className="tool-card p-6">

// Primary button
<button className="btn-primary">

// Secondary button
<button className="btn-secondary">

// Input field
<input className="input-field" />

// Textarea
<textarea className="textarea-field" />
```

### Typography

```tsx
// Heading 1
<h1 className="text-3xl font-bold text-neutral-900 mb-2">

// Heading 2
<h2 className="text-xl font-semibold mb-2">

// Body text
<p className="text-neutral-600">

// Label
<label className="text-sm font-medium text-neutral-700">
```

## 🔧 Development Commands

```bash
# Install dependencies
bun install

# Run dev server (port 3000)
bun dev

# Build for production
bun run build

# Start production server
bun start

# Lint code
bun run lint
```

## 📝 Best Practices

### 1. Client-Side Only
Semua tool harus berjalan 100% di client-side (browser):
```tsx
'use client'  // Wajib ada di top component
```

### 2. No External API Calls
Jangan gunakan external API untuk processing. Semua logic harus di browser untuk:
- ✅ Privacy (data tidak ke server)
- ✅ Speed (no network latency)
- ✅ Offline capability

### 3. Error Handling
Selalu handle error dengan graceful:
```tsx
try {
  // Process data
} catch (e: any) {
  setError(e.message)
}
```

### 4. Loading States
Berikan feedback untuk operasi yang berat:
```tsx
const [isProcessing, setIsProcessing] = useState(false)

const handleProcess = async () => {
  setIsProcessing(true)
  // ... process
  setIsProcessing(false)
}
```

### 5. Copy to Clipboard
Gunakan pattern ini untuk copy functionality:
```tsx
const [copied, setCopied] = useState(false)

const handleCopy = async () => {
  await navigator.clipboard.writeText(text)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}
```

## 🧪 Testing Checklist

Sebelum submit PR, pastikan:

- [ ] Tool berfungsi dengan input normal
- [ ] Tool handle error dengan baik
- [ ] Tool responsive di mobile
- [ ] Tool tidak menggunakan external API
- [ ] Tool memiliki clear instructions
- [ ] Code sudah di-lint
- [ ] No console errors

## 🚀 Deployment

Project ini di-deploy ke Vercel:

1. Push ke main branch
2. Vercel akan auto-deploy
3. Production URL: TBD

## 🐛 Common Issues

### Issue: Module not found
**Solution:** Jalankan `bun install` di root directory

### Issue: Type errors
**Solution:** Pastikan package sudah di-export di `index.ts`

### Issue: Styles tidak muncul
**Solution:** Pastikan Tailwind config sudah include package path

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Bun Workspaces](https://bun.sh/docs/install/workspaces)
- [Lucide Icons](https://lucide.dev)

## 💡 Ideas untuk Tools Baru

Lihat file ROADMAP.md untuk daftar tools yang direncanakan.

