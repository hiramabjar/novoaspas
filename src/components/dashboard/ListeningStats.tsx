'use client'

import { Card } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { Headphones, CheckCircle, BarChart, Activity, Clock, Users } from 'lucide-react'

interface ListeningStats {
  totalExercises: number
  completedExercises: number
  averageScore: number
  totalAttempts: number
  averageTime: string
  activeUsers: number
}

interface ListeningStatsProps {
  userId?: string
  isAdmin?: boolean
}

export function ListeningStats({ userId, isAdmin = false }: ListeningStatsProps) {
  const { data: stats, isLoading } = useQuery<ListeningStats>({
    queryKey: ['listening-stats', userId],
    queryFn: async () => {
      const endpoint = userId 
        ? `/api/users/${userId}/stats/listening`
        : '/api/admin/stats/listening'
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error('Failed to fetch listening stats')
      return response.json()
    }
  })

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  const statsItems = [
    {
      icon: Headphones,
      value: stats?.totalExercises || 0,
      label: isAdmin ? 'Total de Exercícios' : 'Exercícios Disponíveis',
      color: 'text-blue-500'
    },
    {
      icon: CheckCircle,
      value: stats?.completedExercises || 0,
      label: 'Exercícios Completados',
      color: 'text-green-500'
    },
    {
      icon: BarChart,
      value: `${stats?.averageScore?.toFixed(1) || '0.0'}%`,
      label: 'Média de Acertos',
      color: 'text-purple-500'
    },
    {
      icon: Activity,
      value: stats?.totalAttempts || 0,
      label: 'Total de Tentativas',
      color: 'text-red-500'
    },
    {
      icon: Clock,
      value: stats?.averageTime || '0min',
      label: 'Tempo Médio',
      color: 'text-orange-500'
    },
    {
      icon: Users,
      value: stats?.activeUsers || 0,
      label: 'Usuários Ativos',
      color: 'text-indigo-500',
      adminOnly: true
    }
  ]

  return (
    <Card className="p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Headphones className="w-6 h-6 text-blue-500" />
        {isAdmin ? 'Estatísticas Gerais de Listening' : 'Seu Progresso em Listening'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsItems.map((item, index) => (
          (!item.adminOnly || isAdmin) && (
            <div key={index} className="text-center">
              <div className={`${item.color} bg-gray-50 p-3 rounded-lg mx-auto w-12 h-12 flex items-center justify-center mb-2`}>
                <item.icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
          )
        ))}
      </div>
    </Card>
  )
} 