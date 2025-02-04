'use client'

import { useSession, signOut } from 'next-auth/react'
import { Bell, User } from 'lucide-react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-8 py-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Escola de Idiomas
        </h2>
        
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500">
                Administrador
              </p>
            </div>
            
            <button 
              onClick={() => signOut()}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 