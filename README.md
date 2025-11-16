# Breaktools

> **Situs utility tools gratis dan cepat untuk profesional digital**

Breaktools adalah kumpulan tools digital yang dirancang untuk menyelesaikan tugas-tugas spesifik dengan instan, tanpa perlu instalasi, dan 100% gratis.

## 🚀 Fitur Utama

- ⚡ **Cepat & Ringan** - Semua proses berjalan di browser (client-side)
- 🔒 **Privasi Terjaga** - File tidak pernah diupload ke server
- 💯 **Gratis Selamanya** - Tidak ada biaya tersembunyi
- 📱 **Mobile-First** - Responsive design untuk semua perangkat
- 🎨 **UI Modern** - Desain terinspirasi dari Etsy dengan Tailwind CSS

## 🛠️ Tools yang Tersedia

### Text Tools
- **Penghitung Kata** - Hitung kata, karakter, dan statistik teks
- **Text Diff Checker** - Bandingkan dua teks baris per baris
- **Text Cleaner** - Bersihkan spasi berlebih dan duplikasi
- **Case Converter** - Ubah format huruf (UPPERCASE, lowercase, camelCase, dll)
- **Lorem Ipsum Generator** - Generate teks placeholder

### Generator Tools
- **QR Code Generator** - Buat QR Code dari URL atau teks
- **Password Generator** - Generate password kuat dan acak
- **UUID Generator** - Generate UUID v4 untuk development
- **Hash Generator** - Generate hash MD5, SHA-256, dll
- **Color Picker** - Pilih warna dan dapatkan kode HEX, RGB, HSL
- **CSS Gradient Generator** - Buat gradient CSS dengan visual

### Developer Tools
- **JSON Formatter** - Format dan validasi JSON
- **Base64 Encoder/Decoder** - Encode dan decode Base64
- **URL Encoder/Decoder** - Encode dan decode URL
- **JWT Decoder** - Decode dan inspect JWT token

### Coming Soon
- Image Tools (Converter, Compressor, Resizer, Cropper)
- PDF Tools (Merge, Split, Compress)
- Audio/Video Tools

## 🏗️ Arsitektur

Proyek ini menggunakan **modular monorepo** dengan Bun workspace:

```
Breaktool/
├── apps/
│   └── web/                  # Next.js App
│       ├── src/
│       │   ├── app/          # App Router
│       │   ├── components/   # Layout components
│       │   ├── config/       # Tools configuration
│       │   └── lib/          # Utilities
│       └── package.json
├── packages/
│   ├── text-tools/           # Text processing tools
│   ├── generator-tools/      # Generator utilities
│   ├── image-tools/          # Image manipulation (coming soon)
│   ├── pdf-tools/            # PDF utilities (coming soon)
│   └── ui/                   # Developer tools & shared UI
└── package.json              # Root workspace config
```

## 💻 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Package Manager:** Bun
- **Deployment:** Vercel (recommended)

## 🚦 Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0

### Installation

```bash
# Clone repository
git clone <repository-url>
cd Breaktool

# Install dependencies
bun install

# Run development server
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build untuk Production

```bash
# Build aplikasi
bun run build

# Start production server
bun start
```

## 📦 Menambah Tool Baru

1. Buat komponen tool di package yang sesuai (misal: `packages/text-tools/src/NewTool.tsx`)
2. Export dari `packages/text-tools/src/index.ts`
3. Tambahkan konfigurasi di `apps/web/src/config/tools.ts`
4. Import dan mapping di `apps/web/src/app/tools/[toolId]/page.tsx`

## 🎨 Design System

Proyek ini menggunakan color palette terinspirasi dari Etsy:

- **Primary:** Orange (#f2711c)
- **Neutral:** Gray scale untuk text dan background
- **Font:** Inter (body), Playfair Display (headings)

## 📄 License

MIT License - bebas digunakan untuk projek personal maupun komersial.

## 🤝 Contributing

Kontribusi sangat diterima! Silakan buat Pull Request atau Issue untuk saran dan perbaikan.

## 📞 Contact

Untuk pertanyaan atau feedback, silakan buat issue di repository ini.

---

**Dibuat dengan ❤️ menggunakan Next.js dan Bun**

