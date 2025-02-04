'use client'

import { useRouter } from 'next/navigation'
import { ListeningExerciseForm } from '@/components/exercises/ListeningExerciseForm'
import { useToast } from '@/components/ui/use-toast'
import { useQuery } from '@tanstack/react-query'

export default function CreateListeningExercisePage() {
  const router = useRouter()
  const { toast } = useToast()

  const { data: modules, isLoading: isLoadingModules } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const response = await fetch('/api/admin/modules')
      if (!response.ok) throw new Error('Failed to fetch modules')
      return response.json()
    }
  })

  const { data: languages, isLoading: isLoadingLanguages } = useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const response = await fetch('/api/admin/languages')
      if (!response.ok) throw new Error('Failed to fetch languages')
      return response.json()
    }
  })

  const { data: levels, isLoading: isLoadingLevels } = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const response = await fetch('/api/admin/levels')
      if (!response.ok) throw new Error('Failed to fetch levels')
      return response.json()
    }
  })

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/exercises/listening', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to create exercise')
      }

      toast({
        title: 'Success',
        description: 'Listening exercise created successfully!'
      })

      router.push('/admin/exercises')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create listening exercise.',
        variant: 'destructive'
      })
    }
  }

  if (isLoadingModules || isLoadingLanguages || isLoadingLevels) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Create Listening Exercise</h1>
      <ListeningExerciseForm
        languages={languages}
        levels={levels}
        onSubmit={handleSubmit}
      />
    </div>
  )
} 