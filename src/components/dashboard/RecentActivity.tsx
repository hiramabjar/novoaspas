'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Activity = {
  id: string
  type: 'COMPLETED' | 'STARTED' | 'GRADED'
  user: {
    name: string
  }
  exercise: {
    title: string
  }
  createdAt: string
}

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/activities')
      return response.data
    }
  })

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Atividades Recentes
      </h2>

      <div className="space-y-4">
        {activities?.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user.name}</span>
                {' '}
                {activity.type === 'COMPLETED' && 'completou'}
                {activity.type === 'STARTED' && 'iniciou'}
                {activity.type === 'GRADED' && 'foi avaliado em'}
                {' '}
                <span className="font-medium">{activity.exercise.title}</span>
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 