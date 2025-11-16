# Penjelasan Struktur Monorepo Breaktools

Proyek ini menggunakan **Bun Workspaces** untuk modular monorepo architecture.

## 🏗️ Struktur Directory

```
Breaktool/
├── 📦 node_modules/              # Root dependencies (symlinks)
│   ├── @types/                   
│   ├── typescript/               
│   └── .bun/                     # ⭐ Bun's content-addressable storage
│       ├── react@18.3.1/         # Real packages stored here
│       ├── next@14.2.33/         
│       └── ...326 packages       
│
├── 🚀 apps/
│   └── web/                      # Next.js frontend app
│       ├── node_modules/         # Symlinks to workspace packages
│       ├── src/
│       └── package.json          # Dependencies: workspace:*
│
├── 📚 packages/
│   ├── text-tools/               # Text processing tools
│   │   ├── node_modules/         # Symlinks to other packages
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── generator-tools/          # Generators (QR, UUID, etc)
│   ├── ui/                       # Developer tools
│   ├── image-tools/              # (Future) Image tools
│   └── pdf-tools/                # (Future) PDF tools
│
├── package.json                  # Root workspace config
└── bun.lock                      # Lockfile
```

## 🎯 Cara Kerja Bun Workspace

### 1. Content-Addressable Storage

Bun menyimpan semua packages dalam **single storage** (`.bun/`):

```
node_modules/.bun/
├── react@18.3.1/
├── next@14.2.33/
├── lucide-react@0.294.0/
└── ... (semua packages)
```

### 2. Symlink System

Workspace lain menggunakan **symlinks** ke storage ini:

```
apps/web/node_modules/
├── @breaktools/text-tools → ../../packages/text-tools
├── @breaktools/ui → ../../packages/ui
└── react → ../../node_modules/.bun/react@18.3.1
```

### 3. Workspace Dependencies

Di `apps/web/package.json`:

```json
{
  "dependencies": {
    "@breaktools/text-tools": "workspace:*",
    "@breaktools/generator-tools": "workspace:*",
    "react": "^18.2.0"
  }
}
```

`workspace:*` = Ambil dari local packages, bukan npm registry.

## ✅ Keuntungan Sistem Ini

### 1. **Space Efficient**
- Packages hanya disimpan **1 kali**
- Project lain (di luar Breaktool) bisa **reuse** package yang sama
- Hemat disk space sampai **70%**

### 2. **Fast Install**
```bash
# Install pertama
bun install  # ~5 detik

# Install kedua (packages sudah di-cache)
bun install  # ~1 detik ⚡
```

### 3. **Hot Module Replacement**
Perubahan di `packages/*` langsung terdeteksi oleh `apps/web` tanpa rebuild.

### 4. **Type-Safe Imports**
TypeScript types shared antar packages:

```tsx
// apps/web/src/app/tools/[toolId]/page.tsx
import { WordCounter } from '@breaktools/text-tools'  // ✅ Auto-complete works!
```

## 🔄 Workflow Development

### Install Dependencies
```bash
# Di root
bun install

# Auto-install untuk semua workspaces
```

### Run Dev Server
```bash
bun dev
# → Runs: bun --filter @breaktools/web dev
```

### Add Package ke Workspace
```bash
# Tambah dependency ke apps/web
cd apps/web
bun add lucide-react

# Tambah dependency ke packages/text-tools
cd packages/text-tools
bun add some-library
```

### Buat Package Baru
```bash
# 1. Buat folder
mkdir packages/audio-tools
cd packages/audio-tools

# 2. Init package
cat > package.json << EOF
{
  "name": "@breaktools/audio-tools",
  "version": "0.1.0",
  "main": "./src/index.ts"
}
EOF

# 3. Install dependencies di root
cd ../..
bun install
```

## 📊 Perbandingan dengan npm/yarn

| Aspect | npm/yarn | Bun Workspace |
|--------|----------|---------------|
| **Storage** | Copy di setiap package | Single copy di .bun/ |
| **Install time** | ~20-30 detik | ~5 detik |
| **Disk usage** | ~500 MB | ~150 MB |
| **Hot reload** | Sometimes broken | Always works |
| **Type resolution** | Needs manual config | Auto-works |

## 🐛 Troubleshooting

### "Module not found"
```bash
# Solution: Re-install
bun install
```

### "Type errors in IDE"
```bash
# Solution: Restart TypeScript server
# VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### "Changes not reflected"
```bash
# Solution: Restart dev server
# Kill: Ctrl+C
# Start: bun dev
```

## 📚 Resources

- [Bun Workspaces Docs](https://bun.sh/docs/install/workspaces)
- [Monorepo Best Practices](https://monorepo.tools/)
- [Content-Addressable Storage](https://en.wikipedia.org/wiki/Content-addressable_storage)

## ✨ Summary

**Breaktools menggunakan TRUE MODULAR MONOREPO!**

✅ Single source of truth untuk dependencies  
✅ Fast installs dengan content-addressable storage  
✅ Type-safe imports antar packages  
✅ Hot reload yang reliable  
✅ Hemat disk space  

Jangan bingung dengan banyaknya folder `.bun/` - itu adalah **fitur canggih** dari Bun untuk efisiensi maksimal! 🚀

