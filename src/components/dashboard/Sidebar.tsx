'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Users, 
  BookOpen, 
  BarChart2, 
  Settings,
  Home,
  GraduationCap
} from 'lucide-react'

const adminMenuItems = [
  { 
    title: 'Dashboard', 
    href: '/admin/dashboard',
    icon: Home 
  },
  { 
    title: 'Alunos', 
    href: '/admin/dashboard/students', 
    icon: Users 
  },
  { 
    title: 'Exercícios', 
    href: '/admin/dashboard/exercises', 
    icon: BookOpen 
  },
  { 
    title: 'Relatórios', 
    href: '/admin/dashboard/reports', 
    icon: BarChart2 
  },
  { 
    title: 'Configurações', 
    href: '/admin/dashboard/settings', 
    icon: Settings 
  }
]

const studentMenuItems = [
  { 
    title: 'Dashboard', 
    href: '/student/dashboard',
    icon: Home 
  },
  { 
    title: 'Exercícios', 
    href: '/student/dashboard/exercises', 
    icon: BookOpen 
  },
  { 
    title: 'Meu Progresso', 
    href: '/student/dashboard/progress', 
    icon: BarChart2 
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'
  const menuItems = isAdmin ? adminMenuItems : studentMenuItems

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg
                ${isActive 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
} 