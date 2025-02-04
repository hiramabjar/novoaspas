import { AuthProvider } from '@/features/auth/AuthProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  )
} 