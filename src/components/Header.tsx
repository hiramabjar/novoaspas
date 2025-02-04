'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-primary">
          Escola de Idiomas
        </Link>
        
        <div className="flex items-center gap-6">
          {session ? (
            <>
              <Link href="/dashboard" className="hover:text-primary">
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
} 