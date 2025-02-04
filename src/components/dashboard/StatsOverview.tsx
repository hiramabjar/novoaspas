'use client'

import { Card } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { Users, BookOpen, TrendingUp, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface OverviewStats {
  activeStudents: {
    current: number
    previous: number
    change: number
  }
  totalExercises: {
    current: number
    previous: number
    change: number
  }
  completionRate: {
    current: number
    previous: number
    change: number
  }
  averageTime: {
    current: number
    previous: number
    change: number
  }
}

export function StatsOverview() {
  const { data: stats, isLoading } = useQuery<OverviewStats>({
    queryKey: ['overview-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard/stats/overview')
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
    refetchInterval: 60000, // Atualiza a cada minuto
    staleTime: 55000, // Considera os dados "frescos" por 55 segundos
    retry: 1 // Tenta reconectar apenas uma vez em caso de erro
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-6 w-[60px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const formatChange = (value: number) => {
    if (value > 0) return `+${value}`
    return value.toString()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Alunos Ativos</h3>
            <p className="text-2xl font-bold">{stats?.activeStudents.current || 0}</p>
            <p className={`text-sm ${stats?.activeStudents.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatChange(stats?.activeStudents.change || 0)} vs. mês anterior
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <BookOpen className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total de Exercícios</h3>
            <p className="text-2xl font-bold">{stats?.totalExercises.current || 0}</p>
            <p className={`text-sm ${stats?.totalExercises.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatChange(stats?.totalExercises.change || 0)} vs. mês anterior
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Taxa de Conclusão</h3>
            <p className="text-2xl font-bold">{(stats?.completionRate.current || 0).toFixed(1)}%</p>
            <p className={`text-sm ${stats?.completionRate.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatChange((stats?.completionRate.change || 0).toFixed(1))}% vs. mês anterior
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Tempo Médio</h3>
            <p className="text-2xl font-bold">{stats?.averageTime.current || 0}min</p>
            <p className={`text-sm ${stats?.averageTime.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatChange(stats?.averageTime.change || 0)}min vs. mês anterior
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
} 