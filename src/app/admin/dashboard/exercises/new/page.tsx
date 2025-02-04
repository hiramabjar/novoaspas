'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LANGUAGES, LEVELS } from '@/lib/constants'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { BookOpen, Headphones, Mic } from 'lucide-react'

const exerciseSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  content: z.string().min(1, 'Texto para áudio é obrigatório'),
  languageId: z.string().min(1, 'Idioma é obrigatório'),
  levelId: z.string().min(1, 'Nível é obrigatório')
})

type ExerciseForm = z.infer<typeof exerciseSchema>

export default function NewExercisePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ExerciseForm>({
    resolver: zodResolver(exerciseSchema)
  })

  const onSubmit = async (data: ExerciseForm) => {
    try {
      setLoading(true)
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          type: 'listening'
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar exercício')
      }

      toast.success('Exercício criado com sucesso!')
      router.push('/admin/dashboard/exercises')
    } catch (error) {
      toast.error('Erro ao criar exercício')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Criar Novo Exercício</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/dashboard/exercises/new/reading">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <BookOpen className="w-12 h-12 text-emerald-600" />
              <div>
                <h2 className="text-xl font-semibold">Exercício de Leitura</h2>
                <p className="text-gray-600 mt-2">
                  Crie exercícios de compreensão de texto com questões de múltipla escolha.
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/dashboard/exercises/new/listening">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <Headphones className="w-12 h-12 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">Exercício de Listening</h2>
                <p className="text-gray-600 mt-2">
                  Crie exercícios de compreensão auditiva com áudio e questões.
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/dashboard/exercises/new/dictation">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-4">
              <Mic className="w-12 h-12 text-purple-600" />
              <div>
                <h2 className="text-xl font-semibold">Exercício de Ditado</h2>
                <p className="text-gray-600 mt-2">
                  Crie exercícios de ditado onde os alunos escrevem o que ouvem.
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto p-6 mt-6">
        <h1 className="text-2xl font-bold mb-6">Novo Exercício de Listening</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              {...register('title')}
              className="w-full p-2 border rounded-md"
              placeholder="Ex: My Wonderful Family"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              {...register('description')}
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Ex: Listen to the text and answer the questions"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Texto para Áudio</label>
            <textarea
              {...register('content')}
              className="w-full p-2 border rounded-md"
              rows={6}
              placeholder="Digite o texto que será convertido em áudio..."
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Idioma</label>
            <select
              {...register('languageId')}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Selecione um idioma</option>
              {LANGUAGES.map(language => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </select>
            {errors.languageId && (
              <p className="text-red-500 text-sm mt-1">{errors.languageId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nível</label>
            <select
              {...register('levelId')}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Selecione um nível</option>
              {LEVELS.map(level => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
            {errors.levelId && (
              <p className="text-red-500 text-sm mt-1">{errors.levelId.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar Exercício'}
          </button>
        </form>
      </div>
    </div>
  )
} 