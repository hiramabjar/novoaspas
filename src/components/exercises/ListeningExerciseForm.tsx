'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { QuestionForm, type Question } from './QuestionForm'

const questionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).min(2),
  correctAnswer: z.string().min(1)
})

const listeningExerciseSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  content: z.string().min(1, 'Texto para áudio é obrigatório'),
  languageId: z.string().min(1, 'Idioma é obrigatório'),
  levelId: z.string().min(1, 'Nível é obrigatório'),
  questions: z.array(questionSchema).min(1, 'Pelo menos uma questão é obrigatória')
})

type ListeningExerciseFormData = z.infer<typeof listeningExerciseSchema>

interface ListeningExerciseFormProps {
  languages: { id: string; name: string }[]
  levels: { id: string; name: string }[]
  onSubmit: (data: ListeningExerciseFormData & { moduleId: string }) => Promise<void>
}

export function ListeningExerciseForm({ languages = [], levels = [], onSubmit }: ListeningExerciseFormProps) {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<Question[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ListeningExerciseFormData>({
    resolver: zodResolver(listeningExerciseSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      languageId: '',
      levelId: '',
      questions: []
    }
  })

  const handleFormSubmit = async (data: ListeningExerciseFormData) => {
    if (questions.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos uma questão.',
        variant: 'destructive'
      })
      return
    }

    try {
      const formData = {
        ...data,
        questions,
        moduleId: 'listening'
      }
      await onSubmit(formData)
      toast({
        title: 'Sucesso',
        description: 'Exercício de listening criado com sucesso!'
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar exercício de listening.',
        variant: 'destructive'
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register('title')} />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register('description')} />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="content">Texto para Áudio</Label>
            <Textarea 
              id="content" 
              {...register('content')} 
              placeholder="Digite o texto que será convertido em áudio para o aluno ouvir"
              className="min-h-[200px]"
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="languageId">Idioma</Label>
            <select
              id="languageId"
              {...register('languageId')}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione um idioma</option>
              {languages.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </select>
            {errors.languageId && (
              <p className="text-sm text-red-500">{errors.languageId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="levelId">Nível</Label>
            <select
              id="levelId"
              {...register('levelId')}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione um nível</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
            {errors.levelId && (
              <p className="text-sm text-red-500">{errors.levelId.message}</p>
            )}
          </div>

          <div>
            <Label>Questões</Label>
            <QuestionForm
              questions={questions}
              onChange={setQuestions}
            />
            {errors.questions && (
              <p className="text-sm text-red-500">{errors.questions.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="mt-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Criando...' : 'Criar Exercício de Listening'}
        </Button>
      </Card>
    </form>
  )
} 