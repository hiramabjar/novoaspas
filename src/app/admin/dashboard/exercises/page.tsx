'use client'

import Link from 'next/link'
import { BookOpen, Headphones, Eye, Trash2, Edit, Mic } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { Exercise } from '@/types/exercise'

export default function ExercisesPage() {
  const queryClient = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['exercises'] })
  }, [queryClient])

  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await fetch('/api/exercises')
      if (!response.ok) {
        throw new Error('Erro ao carregar exercícios')
      }
      return response.json()
    },
    staleTime: 0,
    refetchOnMount: true
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este exercício?')) {
      return
    }

    try {
      const response = await fetch(`/api/exercises/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar exercício')
      }

      await queryClient.invalidateQueries({ queryKey: ['exercises'] })
      toast.success('Exercício deletado com sucesso!')
    } catch (error) {
      toast.error('Erro ao deletar exercício')
      console.error('Erro:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">Carregando exercícios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Exercícios</h1>
        <div className="flex gap-4">
          <Link href="/admin/dashboard/exercises/new/reading">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all duration-200 hover:shadow-md">
              <BookOpen className="w-5 h-5 mr-2" />
              Novo Exercício de Leitura
            </Button>
          </Link>
          <Link href="/admin/dashboard/exercises/new/listening">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 hover:shadow-md">
              <Headphones className="w-5 h-5 mr-2" />
              Novo Exercício de Listening
            </Button>
          </Link>
          <Link href="/admin/dashboard/exercises/new/dictation">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all duration-200 hover:shadow-md">
              <Mic className="w-5 h-5 mr-2" />
              Novo Exercício de Ditado
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exercises?.map((exercise) => (
          <Card 
            key={exercise.id} 
            className="group flex flex-col bg-white overflow-hidden hover:shadow-lg transition-all duration-200"
          >
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold text-gray-800 line-clamp-1">
                      {exercise.title}
                    </h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      exercise.type === 'listening' 
                        ? 'bg-blue-100 text-blue-800' 
                        : exercise.type === 'reading'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {exercise.type === 'listening' 
                        ? 'Listening' 
                        : exercise.type === 'reading'
                        ? 'Leitura'
                        : 'Ditado'}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-2">
                    {exercise.description}
                  </p>
                </div>
                <div className="ml-4 p-2 rounded-full bg-gray-50 flex-shrink-0">
                  {exercise.type === 'reading' ? (
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                  ) : exercise.type === 'listening' ? (
                    <Headphones className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Mic className="w-5 h-5 text-purple-600" />
                  )}
                </div>
              </div>

              <div className="space-y-2.5 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Idioma:</span>
                  <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    {exercise.language.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Nível:</span>
                  <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    {exercise.level.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-end space-x-2">
                <Button 
                  variant="ghost"
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-white transition-colors min-w-[105px] justify-center"
                  onClick={() => router.push(`/admin/dashboard/exercises/${exercise.id}`)}
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-white transition-colors min-w-[105px] justify-center"
                  onClick={() => router.push(`/admin/dashboard/exercises/${exercise.id}/edit`)}
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(exercise.id)}
                  className="flex items-center gap-2 hover:bg-red-600/90 transition-colors min-w-[105px] justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                  Deletar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {exercises?.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <BookOpen className="w-12 h-12 text-gray-400" />
            <p className="text-gray-500 text-lg">Nenhum exercício encontrado</p>
          </div>
        </Card>
      )}
    </div>
  )
} 