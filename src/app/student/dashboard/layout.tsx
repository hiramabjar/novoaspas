import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/features/auth/authOptions'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'student') {
    redirect('/dashboard')
  }

  return <DashboardLayout>{children}</DashboardLayout>
} 