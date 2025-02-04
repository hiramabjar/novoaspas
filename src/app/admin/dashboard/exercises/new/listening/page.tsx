'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LANGUAGES, LEVELS } from '@/lib/constants'
import toast from 'react-hot-toast'
import { Headphones, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useQueryClient } from '@tanstack/react-query'

const questionSchema = z.object({
  question: z.string().min(1, 'Questão é obrigatória'),
  options: z.array(z.string()).min(2, 'Adicione pelo menos 2 opções'),
  correctAnswer: z.string().min(1, 'Selecione a resposta correta')
})

const exerciseSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  languageId: z.string().min(1, 'Idioma é obrigatório'),
  levelId: z.string().min(1, 'Nível é obrigatório'),
  questions: z.array(questionSchema).min(1, 'Adicione pelo menos uma questão')
})

type ExerciseForm = z.infer<typeof exerciseSchema>

export default function NewListeningExercisePage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ExerciseForm>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      questions: [
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: ''
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions'
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

      await queryClient.invalidateQueries({ queryKey: ['exercises'] })
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Headphones className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Novo Exercício de Listening</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label>Título</Label>
              <input
                {...register('title')}
                className="w-full p-2 border rounded-md mt-1"
                placeholder="Ex: Understanding Daily Routines"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label>Descrição</Label>
              <textarea
                {...register('description')}
                className="w-full p-2 border rounded-md mt-1"
                rows={3}
                placeholder="Ex: Escute atentamente o texto sobre rotinas diárias e responda as questões"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label>Texto para Listening</Label>
              <textarea
                {...register('content')}
                className="w-full p-2 border rounded-md mt-1"
                rows={6}
                placeholder="Digite o texto que será lido no exercício de listening..."
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Idioma</Label>
                <select
                  {...register('languageId')}
                  className="w-full p-2 border rounded-md mt-1"
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
                <Label>Nível</Label>
                <select
                  {...register('levelId')}
                  className="w-full p-2 border rounded-md mt-1"
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
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Questões</h2>
              <Button
                type="button"
                onClick={() => append({ 
                  question: '', 
                  options: ['', '', '', ''], 
                  correctAnswer: '' 
                })}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Questão
              </Button>
            </div>

            {errors.questions && (
              <p className="text-red-500 text-sm">{errors.questions.message}</p>
            )}

            <div className="space-y-8">
              {fields.map((field, index) => (
                <div key={field.id} className="relative bg-gray-50 p-6 rounded-lg">
                  <div className="absolute right-4 top-4">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Questão {index + 1}</Label>
                      <input
                        {...register(`questions.${index}.question`)}
                        className="w-full p-2 border rounded-md mt-1"
                        placeholder="Digite a pergunta sobre o áudio..."
                      />
                      {errors.questions?.[index]?.question && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.questions[index]?.question?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Opções</Label>
                      <div className="space-y-2 mt-1">
                        {field.options.map((_, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <input
                              {...register(`questions.${index}.options.${optionIndex}`)}
                              className="flex-1 p-2 border rounded-md"
                              placeholder={`Opção ${optionIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Resposta Correta</Label>
                      <select
                        {...register(`questions.${index}.correctAnswer`)}
                        className="w-full p-2 border rounded-md mt-1"
                      >
                        <option value="">Selecione a resposta correta</option>
                        {watch(`questions.${index}.options`).map((option, optIndex) => (
                          <option key={optIndex} value={option}>
                            {option || `Opção ${optIndex + 1}`}
                          </option>
                        ))}
                      </select>
                      {errors.questions?.[index]?.correctAnswer && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.questions[index]?.correctAnswer?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-300 hover:bg-gray-100"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Criando...' : 'Criar Exercício'}
          </Button>
        </div>
      </form>
    </div>
  )
} 