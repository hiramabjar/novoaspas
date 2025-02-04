'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

type ProgressData = {
  name: string
  completed: number
  total: number
}

export function ProgressChart() {
  const { data: progress, isLoading } = useQuery<ProgressData[]>({
    queryKey: ['progress-chart'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/progress')
      return response.data
    }
  })

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Progresso por Módulo
      </h2>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={progress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completed" fill="#3b82f6" name="Concluídos" />
            <Bar dataKey="total" fill="#e5e7eb" name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 