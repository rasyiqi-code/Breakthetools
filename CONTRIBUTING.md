# Contributing to Breaktools

Terima kasih atas minat Anda untuk berkontribusi! Kami menyambut kontribusi dari siapa saja.

## 🚀 Quick Start

1. Fork repository ini
2. Clone fork Anda: `git clone https://github.com/YOUR_USERNAME/Breaktools.git`
3. Install dependencies: `bun install`
4. Buat branch baru: `git checkout -b feature/nama-fitur`
5. Jalankan dev server: `bun dev`
6. Buat perubahan Anda
7. Commit: `git commit -m "feat: deskripsi singkat"`
8. Push: `git push origin feature/nama-fitur`
9. Buat Pull Request

## 📝 Commit Convention

Kami menggunakan Conventional Commits:

- `feat:` - Fitur baru
- `fix:` - Bug fix
- `docs:` - Perubahan dokumentasi
- `style:` - Perubahan formatting (tidak mengubah logic)
- `refactor:` - Refactoring code
- `test:` - Menambah atau update tests
- `chore:` - Update build tasks, configs, dll

Contoh:
```
feat: add image compression tool
fix: resolve QR code generation error
docs: update README with new tools
```

## 🎯 Apa yang Bisa Dikontribusikan?

### 1. Tools Baru
Lihat [ROADMAP.md](ROADMAP.md) untuk daftar tools yang direncanakan.

### 2. Bug Fixes
Cek [Issues](https://github.com/YOUR_REPO/issues) untuk bug yang perlu diperbaiki.

### 3. Improvements
- Performance optimization
- UI/UX improvements
- Accessibility improvements
- Documentation improvements

### 4. Translations
- Tambah support multi-language
- Translate UI ke bahasa lain

## 📐 Code Style Guidelines

### TypeScript/React
```tsx
// ✅ Good
export function MyTool() {
  const [state, setState] = useState<string>('')
  
  return <div className="tool-card">...</div>
}

// ❌ Bad
export const MyTool = () => {
  var state = ''
  return <div style={{padding: '20px'}}>...</div>
}
```

### Tailwind CSS
```tsx
// ✅ Good - Use utility classes
<button className="btn-primary">

// ❌ Bad - Inline styles
<button style={{ backgroundColor: '#f2711c' }}>
```

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Config: `kebab-case.ts`

## 🧪 Testing

Sebelum submit PR, pastikan:

1. Code berjalan tanpa error di console
2. Tool berfungsi dengan berbagai input
3. Tool responsive di mobile
4. Tidak ada TypeScript errors

```bash
# Run lint
bun run lint

# Build test
bun run build
```

## 🎨 Design Guidelines

### Consistency
- Gunakan component classes yang sudah ada (`btn-primary`, `tool-card`, etc)
- Follow existing color palette
- Maintain consistent spacing

### Accessibility
- Gunakan semantic HTML
- Tambahkan `aria-label` untuk icon buttons
- Ensure keyboard navigation works
- Test dengan screen reader jika memungkinkan

### Performance
- Semua tool harus client-side
- No external API calls untuk processing
- Optimize large file handling
- Use Web Workers untuk heavy computation

## 📄 Documentation

Setiap tool baru harus include:

1. **Tool description** di config
2. **Usage instructions** di tool component
3. **Code comments** untuk logic kompleks
4. **Update ROADMAP.md** jika menambah kategori baru

## 🐛 Bug Reports

Gunakan template berikut:

```markdown
**Describe the bug**
Deskripsi jelas dan ringkas tentang bug.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
Apa yang seharusnya terjadi.

**Screenshots**
Jika applicable, tambahkan screenshot.

**Environment:**
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]
```

## 💡 Feature Requests

Gunakan template berikut:

```markdown
**Problem**
Jelaskan masalah atau use case yang ingin diselesaikan.

**Proposed Solution**
Solusi yang Anda bayangkan.

**Alternatives**
Alternatif solusi yang sudah Anda pertimbangkan.

**Additional context**
Context atau screenshot tambahan.
```

## ✅ Pull Request Checklist

Sebelum submit PR, pastikan:

- [ ] Code follows style guidelines
- [ ] Self-review sudah dilakukan
- [ ] Comments ditambahkan untuk code yang kompleks
- [ ] Documentation sudah diupdate
- [ ] Changes tidak menimbulkan warnings baru
- [ ] Tool tested di Chrome, Firefox, dan Safari
- [ ] Tool responsive di mobile

## 🤝 Code Review Process

1. PR akan di-review dalam 1-3 hari
2. Reviewer mungkin request changes
3. Setelah approved, PR akan di-merge
4. Changes akan live di production setelah deployment

## 📞 Need Help?

- Buat issue dengan label `question`
- Join Discord (jika ada)
- Email: your-email@example.com

## 📜 License

Dengan berkontribusi, Anda setuju bahwa kontribusi Anda akan di-license under MIT License yang sama dengan project ini.

---

**Thank you for contributing to Breaktools! 🎉**

