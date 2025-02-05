'use client'

import { Card } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { Users, BookOpen, TrendingUp, Clock } from 'lucide-react'

interface StatsData {
  activeStudents: {
    total: number
    change: number
  }
  totalExercises: {
    total: number
    change: number
  }
  completionRate: {
    total: number
    change: number
  }
  averageTime: {
    total: number
    change: number
  }
}

function formatChange(value: number): string {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value}%`
}

export function StatsOverview() {
  const { data: stats, isLoading, error } = useQuery<StatsData>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      return response.json()
    }
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        Error loading stats. Please try again later.
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const cards = [
    {
      title: 'Alunos Ativos',
      value: stats.activeStudents.total,
      change: stats.activeStudents.change,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Total de Exercícios',
      value: stats.totalExercises.total,
      change: stats.totalExercises.change,
      icon: BookOpen,
      color: 'text-green-600'
    },
    {
      title: 'Taxa de Conclusão',
      value: `${stats.completionRate.total}%`,
      change: stats.completionRate.change,
      icon: TrendingUp,
      color: 'text-yellow-600'
    },
    {
      title: 'Tempo Médio',
      value: `${stats.averageTime.total}min`,
      change: stats.averageTime.change,
      icon: Clock,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {card.value}
              </p>
              <p className={`text-sm mt-2 ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatChange(card.change)}
                <span className="text-gray-600 ml-1">vs. mês anterior</span>
              </p>
            </div>
            <div className={`p-3 rounded-full bg-gray-50`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 