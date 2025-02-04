'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LANGUAGES, LEVELS } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function ExerciseDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const { data: exercise, isLoading } = useQuery({
    queryKey: ['exercise', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/exercises/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch exercise')
      return response.json()
    }
  })

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja deletar este exercício?')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/exercises/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar exercício')
      }

      toast.success('Exercício deletado com sucesso!')
      router.push('/admin/dashboard/exercises')
    } catch (error) {
      toast.error('Erro ao deletar exercício')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        content: formData.get('content'),
        languageId: formData.get('languageId'),
        levelId: formData.get('levelId')
      }

      const response = await fetch(`/api/exercises/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar exercício')
      }

      toast.success('Exercício atualizado com sucesso!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Erro ao atualizar exercício')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">Carregando exercício...</p>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <p className="text-red-500">Exercício não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-bold">Detalhes do Exercício</h1>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            {isEditing ? 'Cancelar Edição' : 'Editar'}
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'Deletando...' : 'Deletar'}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Título</label>
              <input
                name="title"
                defaultValue={exercise.title}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <textarea
                name="description"
                defaultValue={exercise.description}
                rows={3}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Conteúdo</label>
              <textarea
                name="content"
                defaultValue={exercise.content}
                rows={6}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Idioma</label>
                <select
                  name="languageId"
                  defaultValue={exercise.languageId}
                  className="w-full p-2 border rounded-md"
                >
                  {LANGUAGES.map(language => (
                    <option key={language.id} value={language.id}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nível</label>
                <select
                  name="levelId"
                  defaultValue={exercise.levelId}
                  className="w-full p-2 border rounded-md"
                >
                  {LEVELS.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{exercise.title}</h3>
              <p className="text-gray-600">{exercise.description}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Conteúdo</h4>
              <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                {exercise.content}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Idioma</h4>
                <p>{exercise.language.name}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Nível</h4>
                <p>{exercise.level.name}</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
} 