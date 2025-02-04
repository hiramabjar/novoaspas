'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LANGUAGES, LEVELS } from '@/lib/constants'
import toast from 'react-hot-toast'

const exerciseSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  content: z.string().min(1, 'Texto para ditado é obrigatório'),
  languageId: z.string().min(1, 'Idioma é obrigatório'),
  levelId: z.string().min(1, 'Nível é obrigatório'),
  questions: z.array(z.object({
    question: z.string(),
    correctAnswer: z.string()
  }))
})

type ExerciseForm = z.infer<typeof exerciseSchema>

export default function NewDictationExercisePage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<{ question: string; correctAnswer: string }[]>([
    { question: 'Digite o que você ouviu:', correctAnswer: '' }
  ])

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ExerciseForm>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      questions: questions
    }
  })

  const onSubmit = async (data: ExerciseForm) => {
    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          type: 'dictation',
          questions: questions.map(q => ({
            ...q,
            options: JSON.stringify([q.correctAnswer])
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar exercício')
      }

      toast.success('Exercício criado com sucesso!')
      router.push('/admin/dashboard/exercises')
    } catch (error) {
      toast.error('Erro ao criar exercício')
    }
  }

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: 'Digite o que você ouviu:', correctAnswer: '' }])
  }

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleQuestionChange = (index: number, field: 'question' | 'correctAnswer', value: string) => {
    const newQuestions = [...questions]
    newQuestions[index][field] = value
    setQuestions(newQuestions)
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Novo Exercício de Ditado</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <Input
                {...register('title')}
                placeholder="Digite o título do exercício"
                className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <Textarea
                {...register('description')}
                placeholder="Digite a descrição do exercício"
                className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Texto para Ditado</label>
              <Textarea
                {...register('content')}
                placeholder="Digite o texto que será lido pelo navegador"
                className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                rows={4}
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Idioma</label>
                <Select 
                  onValueChange={(value) => setValue('languageId', value)}
                >
                  <SelectTrigger className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((language) => (
                      <SelectItem 
                        key={language.id} 
                        value={language.id}
                        className="cursor-pointer hover:bg-purple-50"
                      >
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.languageId && (
                  <p className="text-red-500 text-sm mt-1">{errors.languageId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nível</label>
                <Select 
                  onValueChange={(value) => setValue('levelId', value)}
                >
                  <SelectTrigger className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((level) => (
                      <SelectItem 
                        key={level.id} 
                        value={level.id}
                        className="cursor-pointer hover:bg-purple-50"
                      >
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.levelId && (
                  <p className="text-red-500 text-sm mt-1">{errors.levelId.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Frases para Ditado</h2>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddQuestion}
                  className="border-purple-500 text-purple-600 hover:bg-purple-50"
                >
                  Adicionar Frase
                </Button>
              </div>

              {questions.map((question, index) => (
                <Card key={index} className="p-4 border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Frase {index + 1}
                      </label>
                      <Input
                        value={question.correctAnswer}
                        onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                        placeholder="Digite a frase correta"
                        className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>

                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemoveQuestion(index)}
                        className="text-red-600 hover:bg-red-50 border-red-200"
                      >
                        Remover Frase
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-200 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Criar Exercício
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
} 