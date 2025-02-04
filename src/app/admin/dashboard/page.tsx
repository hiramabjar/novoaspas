'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { Card } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Clock } from 'lucide-react'

interface RecentActivity {
  id: string
  studentName: string
  exerciseTitle: string
  type: 'reading' | 'listening'
  score: number
  completedAt: string
}

interface TopStudent {
  id: string
  name: string
  completedExercises: number
  averageScore: number
  totalTime: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated' || (session?.user?.role !== 'admin')) {
      router.replace('/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'admin') {
    return null
  }

  const { data: recentActivities } = useQuery<RecentActivity[]>({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const response = await fetch('/api/admin/activities/recent')
      if (!response.ok) throw new Error('Failed to fetch recent activities')
      return response.json()
    }
  })

  const { data: topStudents } = useQuery<TopStudent[]>({
    queryKey: ['top-students'],
    queryFn: async () => {
      const response = await fetch('/api/admin/students/top')
      if (!response.ok) throw new Error('Failed to fetch top students')
      return response.json()
    }
  })

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard Administrativo</h1>
      
      <StatsOverview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            Atividades Recentes
          </h2>
          <div className="space-y-4">
            {recentActivities?.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium">{activity.studentName}</p>
                  <p className="text-sm text-gray-600">{activity.exerciseTitle}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.completedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 text-sm rounded bg-blue-100 text-blue-800">
                    {activity.score}%
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.type === 'reading' ? 'Leitura' : 'Listening'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-500" />
            Top Alunos
          </h2>
          <div className="space-y-4">
            {topStudents?.slice(0, 5).map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-600">
                    {student.completedExercises} exercícios completados
                  </p>
                  <p className="text-xs text-gray-500">
                    Tempo total: {student.totalTime}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 text-sm rounded bg-purple-100 text-purple-800">
                    {student.averageScore}% média
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
} 