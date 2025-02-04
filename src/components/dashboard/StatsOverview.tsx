'use client'

import { Card } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { Users, BookOpen, TrendingUp, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

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

interface StatsOverviewProps {
  stats: StatsData
}

function formatChange(value: number): string {
  return value > 0 ? `+${value}` : `${value}`
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Alunos Ativos</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">
            {stats.activeStudents.total}
          </p>
          <p className={`ml-2 text-sm ${stats.activeStudents.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatChange(stats.activeStudents.change)}% vs. mês anterior
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Total de Exercícios</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">
            {stats.totalExercises.total}
          </p>
          <p className={`ml-2 text-sm ${stats.totalExercises.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatChange(stats.totalExercises.change)}% vs. mês anterior
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Taxa de Conclusão</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">
            {stats.completionRate.total}%
          </p>
          <p className={`ml-2 text-sm ${stats.completionRate.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatChange(stats.completionRate.change)}% vs. mês anterior
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Tempo Médio</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">
            {stats.averageTime.total}min
          </p>
          <p className={`ml-2 text-sm ${stats.averageTime.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatChange(stats.averageTime.change)}% vs. mês anterior
          </p>
        </div>
      </div>
    </div>
  )
} 