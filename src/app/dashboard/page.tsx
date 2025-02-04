'use client'

import { useSession } from 'next-auth/react'
import { ListeningStats } from '@/components/dashboard/ListeningStats'
import { ReadingStats } from '@/components/dashboard/ReadingStats'

export default function StudentDashboard() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  if (!userId) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>Por favor, faça login para ver seu dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Meu Dashboard</h1>
      <div className="space-y-6">
        <ListeningStats userId={userId} />
        <ReadingStats userId={userId} />
      </div>
    </div>
  )
} 