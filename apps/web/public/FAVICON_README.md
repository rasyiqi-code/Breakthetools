# Favicon Files Required

File-file berikut perlu dibuat dan ditempatkan di folder `public/`:

## Required Files

### 1. Basic Favicon
- **favicon.ico** - 16x16, 32x32, 48x48 (multi-size ICO file)
  - Format: ICO
  - Ukuran: 16x16, 32x32, 48x48 pixels

### 2. PNG Icons (for modern browsers)
- **icon-16x16.png** - 16x16 pixels
- **icon-32x32.png** - 32x32 pixels
- **icon-192x192.png** - 192x192 pixels (Android)
- **icon-512x512.png** - 512x512 pixels (Android)

### 3. Apple Touch Icon
- **apple-touch-icon.png** - 180x180 pixels
  - Untuk iOS devices (iPhone, iPad)

### 4. Safari Pinned Tab
- **safari-pinned-tab.svg** - SVG format
  - Color: #f2711c (primary orange)
  - Monochrome SVG untuk Safari pinned tabs

### 5. Microsoft Tiles (optional)
- **mstile-150x150.png** - 150x150 pixels
  - Untuk Windows tiles

## Design Guidelines

### Color Scheme
- Primary color: #f2711c (orange)
- Background: White atau transparent
- Design: Simple, recognizable icon (bisa menggunakan wrench/tool icon)

### Design Suggestions
1. Gunakan icon wrench/tool yang konsisten dengan brand
2. Pastikan icon terlihat jelas di berbagai ukuran
3. Untuk favicon.ico, gunakan design yang simple karena ukuran kecil
4. Untuk icon besar (192x192, 512x512), bisa lebih detail

## Tools untuk Generate Favicon

1. **Favicon Generator Online:**
   - https://realfavicongenerator.net/
   - https://favicon.io/
   - https://www.favicon-generator.org/

2. **Cara Generate:**
   - Upload logo/icon utama (minimal 512x512px)
   - Generate semua ukuran yang diperlukan
   - Download dan letakkan di folder `public/`

## Quick Start

1. Buat atau siapkan logo/icon utama (512x512px PNG)
2. Gunakan favicon generator online
3. Download semua file yang dihasilkan
4. Letakkan semua file di folder `apps/web/public/`
5. Pastikan nama file sesuai dengan yang ada di metadata

## File Structure

```
apps/web/public/
├── favicon.ico
├── icon-16x16.png
├── icon-32x32.png
├── icon-192x192.png
├── icon-512x512.png
├── apple-touch-icon.png
├── safari-pinned-tab.svg
├── mstile-150x150.png (optional)
├── site.webmanifest (already created)
└── browserconfig.xml (already created)
```

## Testing

Setelah file dibuat, test dengan:
1. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Check di browser tab
3. Test di mobile device (iOS & Android)
4. Check di browser DevTools > Application > Manifest

