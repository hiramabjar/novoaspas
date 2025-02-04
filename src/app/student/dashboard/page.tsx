'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ProgressOverview } from '@/components/dashboard/ProgressOverview'
import { RecentActivities } from '@/components/dashboard/RecentActivities'

export default function StudentDashboard() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session || session.user.role !== 'student') {
      router.push('/auth/login')
    }
  }, [session, router])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Meu Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <ProgressOverview />
        <RecentActivities />
      </div>
    </div>
  )
} 