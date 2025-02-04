'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Clock } from 'lucide-react'

interface Activity {
  id: string
  type: 'reading' | 'listening'
  title: string
  score: number
  completedAt: string
}

export function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch('/api/student/activities')
        if (!response.ok) throw new Error('Failed to fetch activities')
        const data = await response.json()
        setActivities(data)
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Atividades Recentes
        </h2>
        <div className="space-y-4">
          <p>Carregando...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Atividades Recentes
      </h2>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500">Nenhuma atividade recente</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-medium">{activity.title}</h3>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(activity.completedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-2 py-1 text-sm rounded ${
                    activity.type === 'listening'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {activity.type === 'listening' ? 'Listening' : 'Reading'}
                </span>
                <p className="mt-1 font-semibold">{activity.score}%</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
} 