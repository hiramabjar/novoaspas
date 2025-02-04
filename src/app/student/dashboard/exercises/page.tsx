'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Search, Headphones, Mic } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const getExerciseIcon = (type: string) => {
  switch (type) {
    case 'reading':
      return <BookOpen className="w-5 h-5 text-emerald-600" />
    case 'listening':
      return <Headphones className="w-5 h-5 text-blue-600" />
    case 'dictation':
      return <Mic className="w-5 h-5 text-purple-600" />
    default:
      return <BookOpen className="w-5 h-5 text-gray-600" />
  }
}

const getExerciseTypeColor = (type: string) => {
  switch (type) {
    case 'reading':
      return 'bg-emerald-100 text-emerald-800'
    case 'listening':
      return 'bg-blue-100 text-blue-800'
    case 'dictation':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getExerciseTypeName = (type: string) => {
  switch (type) {
    case 'reading':
      return 'Leitura'
    case 'listening':
      return 'Listening'
    case 'dictation':
      return 'Ditado'
    default:
      return 'Exercício'
  }
}

export default function StudentExercisesPage() {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await fetch('/api/exercises')
      if (!response.ok) throw new Error('Failed to fetch exercises')
      return response.json()
    }
  })

  const filteredExercises = exercises?.filter((exercise: any) =>
    exercise.title.toLowerCase().includes(search.toLowerCase()) ||
    exercise.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Exercícios</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar exercícios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">Carregando exercícios...</p>
        </div>
      ) : filteredExercises?.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise: any) => (
            <Card key={exercise.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{exercise.title}</h2>
                  <p className="text-gray-600 mb-4">{exercise.description}</p>
                </div>
                {getExerciseIcon(exercise.type)}
              </div>

              <div className="flex flex-col space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Tipo:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${getExerciseTypeColor(exercise.type)}`}>
                    {getExerciseTypeName(exercise.type)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Idioma:</span>
                  <span className="text-sm text-gray-600">{exercise.language.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Nível:</span>
                  <span className="text-sm text-gray-600">{exercise.level.name}</span>
                </div>
              </div>

              <div className="mt-4">
                <Link href={`/student/dashboard/exercises/${exercise.id}`}>
                  <Button className="w-full">
                    Iniciar Exercício
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum exercício encontrado.</p>
        </div>
      )}
    </div>
  )
} 