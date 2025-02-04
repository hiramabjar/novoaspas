'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function UnauthorizedPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Acesso Não Autorizado</h2>
          <p className="mt-2 text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {session ? (
            <Link
              href={session.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
              className="w-full flex justify-center btn-primary"
            >
              Voltar ao Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="w-full flex justify-center btn-primary"
            >
              Fazer Login
            </Link>
          )}
        </div>
      </div>
    </div>
  )
} 