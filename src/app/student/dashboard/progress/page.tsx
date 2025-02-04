'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface LanguageProgress {
  languageId: string
  languageName: string
  totalExercises: number
  completedExercises: number
  progress: number
}

export default function ProgressPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session || session.user.role !== 'student') {
      router.push('/auth/login')
    }
  }, [session, router])

  const { data: languagesProgress, isLoading } = useQuery<LanguageProgress[]>({
    queryKey: ['languages-progress'],
    queryFn: async () => {
      const response = await fetch('/api/student/progress/languages')
      if (!response.ok) throw new Error('Failed to fetch progress')
      return response.json()
    }
  })

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Meu Progresso</h1>
        <div className="space-y-4">
          <Card className="p-6">
            <p>Carregando...</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Meu Progresso</h1>
      <div className="space-y-4">
        {languagesProgress?.map((language) => (
          <Card key={language.languageId} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold">{language.languageName}</h2>
              <span className="ml-auto text-gray-600">
                {language.completedExercises} de {language.totalExercises} exercícios
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progresso Geral</span>
                <span>{language.progress}%</span>
              </div>
              <Progress value={language.progress} className="h-2" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 