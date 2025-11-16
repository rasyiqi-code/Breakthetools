# Breaktools Web App

Next.js 14 frontend application untuk Breaktools.

## 🚀 Quick Start

```bash
# From project root
bun dev

# Or from this directory
cd apps/web
bun dev
```

## 📦 Dependencies

### Framework & UI
- **Next.js 14** - React framework dengan App Router
- **React 18** - UI library
- **Tailwind CSS** - Utility-first CSS framework

### Workspace Packages
- `@breaktools/text-tools` - Text processing tools
- `@breaktools/generator-tools` - Generator utilities
- `@breaktools/image-tools` - Image tools (coming soon)
- `@breaktools/pdf-tools` - PDF tools (coming soon)
- `@breaktools/ui` - Developer tools & shared components

### Utilities
- `lucide-react` - Icon library
- `class-variance-authority` - CSS variant management
- `clsx` - Conditional classnames
- `tailwind-merge` - Tailwind class merging

## 🏗️ Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   ├── not-found.tsx       # 404 page
│   │   └── tools/
│   │       └── [toolId]/
│   │           └── page.tsx    # Dynamic tool pages
│   │
│   ├── components/
│   │   └── layout/
│   │       ├── Header.tsx      # Top navigation
│   │       └── Sidebar.tsx     # Tool navigation
│   │
│   ├── config/
│   │   └── tools.ts            # Tool definitions
│   │
│   └── lib/
│       └── utils.ts            # Utility functions
│
├── public/                     # Static assets
├── next.config.js              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── postcss.config.js           # PostCSS config
└── tsconfig.json               # TypeScript config
```

## 🎨 Styling

Project menggunakan Tailwind CSS dengan custom configuration:

### Color Palette
```ts
primary: {
  50: '#fef7ee',
  500: '#f2711c',  // Main orange
  600: '#e35814',
}

neutral: {
  50: '#fafafa',
  600: '#525252',
  900: '#171717',
}
```

### Custom Classes
```css
.tool-card      /* Card container */
.btn-primary    /* Primary button */
.btn-secondary  /* Secondary button */
.input-field    /* Input field */
.textarea-field /* Textarea field */
```

## 🛠️ Development

### Add New Tool

1. Create tool component in appropriate package
2. Add to tool config (`src/config/tools.ts`)
3. Map component in dynamic route (`src/app/tools/[toolId]/page.tsx`)

### Run Commands

```bash
# Development
bun dev           # Start dev server
bun build         # Build for production
bun start         # Start production server
bun lint          # Run ESLint
```

## 🚢 Deployment

### Vercel (Recommended)
1. Connect repository to Vercel
2. Set root directory to `apps/web`
3. Deploy!

### Environment Variables
None required for basic functionality.

## 📝 Notes

- All tools run client-side (no backend needed)
- Static generation for tool pages
- Optimized for performance with Next.js 14
- Mobile-first responsive design

