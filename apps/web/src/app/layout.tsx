// Root layout - middleware will handle locale routing
// All actual layouts are in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

