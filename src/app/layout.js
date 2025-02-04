export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
} 