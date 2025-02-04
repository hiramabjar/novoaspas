'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ExerciseForm } from '@/components/exercises/ExerciseForm'
import type { ExerciseWithRelations } from '@/types/exercise'

export default function EditExercisePage() {
  const router = useRouter()
  const [exercise, setExercise] = useState<ExerciseWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true)
        // Extrair o ID do exercício da URL de forma mais robusta
        const pathParts = window.location.pathname.split('/')
        const exerciseId = pathParts[pathParts.indexOf('exercises') + 1]
        
        if (!exerciseId) {
          throw new Error('ID do exercício não encontrado')
        }

        console.log('[DEBUG] Buscando exercício:', exerciseId)
        
        const response = await fetch(`/api/admin/exercises/${exerciseId}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao carregar exercício')
        }

        const data = await response.json()
        if (!data.exercise) {
          throw new Error('Exercício não encontrado')
        }

        setExercise(data.exercise)
      } catch (err) {
        console.error('Erro:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar exercício')
      } finally {
        setLoading(false)
      }
    }

    fetchExercise()
  }, [])

  const handleSuccess = () => {
    router.push('/admin/dashboard/exercises')
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} onBack={() => router.back()} />
  if (!exercise) return <NotFoundState onBack={() => router.back()} />

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Editar Exercício
      </h1>
      <ExerciseForm 
        exercise={exercise}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando exercício...</p>
      </div>
    </div>
  )
}

function ErrorState({ error, onBack }: { error: string; onBack: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}

function NotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">Exercício não encontrado</h1>
        <p className="mt-2 text-gray-600">O exercício que você está procurando não existe.</p>
        <button
          onClick={onBack}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Voltar
        </button>
      </div>
    </div>
  )
} 