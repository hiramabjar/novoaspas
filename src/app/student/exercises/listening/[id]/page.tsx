'use client'

import { useParams, useRouter } from 'next/navigation'
import { ListeningExercise } from '@/components/exercises/ListeningExercise'
import { useToast } from '@/components/ui/use-toast'
import { useQuery } from '@tanstack/react-query'

export default function ListeningExercisePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const { data: exercise, isLoading } = useQuery({
    queryKey: ['exercise', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/exercises/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch exercise')
      return response.json()
    }
  })

  const handleComplete = async (score: number, answers: Record<string, string>) => {
    try {
      const response = await fetch(`/api/exercises/${params.id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          score,
          answers
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save progress')
      }

      toast({
        title: 'Success',
        description: 'Progress saved successfully!'
      })

      // Redirect to exercises list after a short delay
      setTimeout(() => {
        router.push('/student/exercises')
      }, 2000)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save progress.',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!exercise) {
    return <div>Exercise not found</div>
  }

  return (
    <div className="container mx-auto py-8">
      <ListeningExercise
        id={exercise.id}
        title={exercise.title}
        description={exercise.description}
        content={exercise.content}
        audioUrl={exercise.audioUrl}
        questions={exercise.questions.map((q: any) => ({
          ...q,
          options: JSON.parse(q.options)
        }))}
        onComplete={handleComplete}
      />
    </div>
  )
} 