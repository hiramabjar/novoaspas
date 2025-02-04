import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/features/auth/authOptions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
    },
    {
      label: 'Alunos',
      href: '/admin/dashboard/students',
    },
    {
      label: 'Exercícios',
      href: '/admin/dashboard/exercises',
    },
  ]

  return <DashboardLayout>{children}</DashboardLayout>
} 