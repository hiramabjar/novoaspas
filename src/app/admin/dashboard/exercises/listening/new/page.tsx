'use client'

import { useRouter } from 'next/navigation'
import { ListeningExerciseForm } from '@/components/exercises/ListeningExerciseForm'
import { useToast } from '@/components/ui/use-toast'
import { useQuery } from '@tanstack/react-query'

interface Language {
  id: string
  name: string
}

interface Level {
  id: string
  name: string
}

interface Question {
  question: string
  options: string[]
  correctAnswer: string
}

interface ListeningExerciseData {
  title: string
  description: string
  content: string
  moduleId: string
  languageId: string
  levelId: string
  questions: Question[]
}

export default function CreateListeningExercisePage() {
  const router = useRouter()
  const { toast } = useToast()

  const { data: languages = [], isLoading: isLoadingLanguages } = useQuery<Language[]>({
    queryKey: ['languages'],
    queryFn: async () => {
      const response = await fetch('/api/admin/languages')
      if (!response.ok) throw new Error('Failed to fetch languages')
      return response.json()
    }
  })

  const { data: levels = [], isLoading: isLoadingLevels } = useQuery<Level[]>({
    queryKey: ['levels'],
    queryFn: async () => {
      const response = await fetch('/api/admin/levels')
      if (!response.ok) throw new Error('Failed to fetch levels')
      return response.json()
    }
  })

  const handleSubmit = async (data: ListeningExerciseData) => {
    try {
      const response = await fetch('/api/exercises/listening', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...data, type: 'listening' })
      })

      if (!response.ok) {
        throw new Error('Failed to create exercise')
      }

      toast({
        title: 'Sucesso',
        description: 'Exercício de listening criado com sucesso!'
      })

      router.push('/admin/dashboard/exercises')
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar exercício de listening.',
        variant: 'destructive'
      })
    }
  }

  if (isLoadingLanguages || isLoadingLevels) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    </div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Criar Exercício de Listening</h1>
      <ListeningExerciseForm
        languages={languages}
        levels={levels}
        onSubmit={handleSubmit}
      />
    </div>
  )
} 