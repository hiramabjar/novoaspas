'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExerciseForm } from '@/components/exercises/ExerciseForm'
import { Spinner } from '@/components/ui/spinner'
import { Alert } from '@/components/ui/alert'
import type { ExerciseWithRelations, ExerciseFormData } from '@/types/exercise'

export default function EditExercisePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [exercise, setExercise] = useState<ExerciseWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await fetch(`/api/admin/exercises/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch exercise')
        }
        const data = await response.json()
        setExercise(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchExercise()
  }, [params.id])

  const handleSubmit = async (data: ExerciseFormData) => {
    try {
      const response = await fetch(`/api/admin/exercises/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update exercise')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update exercise')
      throw err
    }
  }

  const handleSuccess = () => {
    router.push('/admin/dashboard/exercises')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">{error}</Alert>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="p-4">
        <Alert variant="destructive">Exercise not found</Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Exercise</h1>
      <ExerciseForm
        exercise={exercise}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
      />
    </div>
  )
} 