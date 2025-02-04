'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExercisePDFDownload } from '@/components/exercises/ExercisePDF'
import { AudioPlayer } from '@/components/exercises/AudioPlayer'
import { DictationExercise } from '@/components/exercises/DictationExercise'
import { ReadingExercise } from '@/components/exercises/ReadingExercise'
import { ListeningExercise } from '@/components/exercises/ListeningExercise'
import type { Exercise } from '@/types/exercise'
import { useToast } from '@/components/ui/use-toast'

interface Answer {
  questionId: string
  answer: string
}

interface ExerciseResults {
  score: number
  correctCount: number
  totalQuestions: number
  attempt: any
  progress: any
}

interface BaseExerciseProps {
  exercise: Exercise
  onSubmit: (answers: Record<string, string>) => Promise<void>
}

export default function ExercisePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [results, setResults] = useState<ExerciseResults | null>(null)

  const { data: exercise, isLoading } = useQuery<Exercise>({
    queryKey: ['exercise', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/exercises/${params.id}`)
      if (!response.ok) {
        throw new Error('Error loading exercise')
      }
      return response.json()
    }
  })

  const handleComplete = async (score: number, answers: Record<string, string>) => {
    try {
      const response = await fetch(`/api/exercises/${params.id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer
          }))
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error submitting answers')
      }

      const results = await response.json()
      setResults(results)
      toast({
        title: "Success",
        description: "Exercise completed successfully!",
      })
    } catch (error) {
      console.error('Error completing exercise:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error completing exercise",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">Loading exercise...</p>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <p className="text-center text-gray-500">Exercise not found</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{exercise.title}</h1>
        <p className="text-gray-600">{exercise.description}</p>
      </div>

      {exercise.type === 'reading' && (
        <ReadingExercise
          exercise={exercise}
          onComplete={handleComplete}
        />
      )}
      
      {exercise.type === 'listening' && (
        <ListeningExercise
          exercise={exercise}
          onComplete={handleComplete}
        />
      )}
      
      {exercise.type === 'dictation' && (
        <DictationExercise
          exercise={exercise}
          onComplete={handleComplete}
        />
      )}

      {results && (
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <div className="space-y-2">
            <p>Score: {results.score}%</p>
            <p>Correct answers: {results.correctCount} of {results.totalQuestions}</p>
          </div>
        </Card>
      )}
    </div>
  )
} 