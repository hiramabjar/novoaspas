'use client'

import { Users, BookOpen, GraduationCap, LineChart } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

type Stats = {
  totalStudents: number
  totalExercises: number
  completionRate: number
  averageGrade: number
  studentsGrowth: number
  exercisesGrowth: number
  completionRateGrowth: number
  averageGradeGrowth: number
}

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/stats')
      return response.data
    }
  })

  const cards = [
    {
      title: 'Total de Alunos',
      value: stats?.totalStudents || 0,
      change: stats?.studentsGrowth || 0,
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Exercícios Ativos',
      value: stats?.totalExercises || 0,
      change: stats?.exercisesGrowth || 0,
      icon: BookOpen,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Taxa de Conclusão',
      value: `${stats?.completionRate || 0}%`,
      change: stats?.completionRateGrowth || 0,
      icon: GraduationCap,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Média de Notas',
      value: stats?.averageGrade?.toFixed(1) || '0.0',
      change: stats?.averageGradeGrowth || 0,
      icon: LineChart,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  ]

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-2xl font-semibold mt-1">{card.value}</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {card.change >= 0 ? '+' : ''}{card.change}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs. mês anterior</span>
              </div>
            </div>
            <div className={`p-3 rounded-full ${card.iconBg}`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 