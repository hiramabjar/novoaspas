'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

interface Progress {
  totalExercises: number
  completedExercises: number
  averageScore: number
  streak: number
}

export function ProgressOverview() {
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProgress() {
      try {
        const response = await fetch('/api/student/progress')
        if (!response.ok) throw new Error('Failed to fetch progress')
        const data = await response.json()
        setProgress(data)
      } catch (error) {
        console.error('Error fetching progress:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Meu Progresso
        </h2>
        <p>Carregando...</p>
      </Card>
    )
  }

  if (!progress) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Meu Progresso
        </h2>
        <p className="text-gray-500">Erro ao carregar progresso</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Meu Progresso
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Exercícios Completados</p>
          <p className="text-2xl font-bold">
            {progress.completedExercises}/{progress.totalExercises}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Média de Pontuação</p>
          <p className="text-2xl font-bold">{progress.averageScore}%</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg col-span-2">
          <p className="text-sm text-gray-600">Sequência de Dias</p>
          <p className="text-2xl font-bold">{progress.streak} dias</p>
        </div>
      </div>
    </Card>
  )
} 