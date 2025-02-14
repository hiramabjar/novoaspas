'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LANGUAGES, LEVELS } from '@/lib/constants'
import type { ExerciseWithRelations, ExerciseFormData, QuestionFormData } from '@/types/exercise'

const questionSchema = z.object({
  question: z.string().min(1, 'Questão é obrigatória'),
  options: z.array(z.string()).min(2, 'Adicione pelo menos 2 opções'),
  correctAnswer: z.string().min(1, 'Resposta correta é obrigatória')
})

const exerciseSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  languageId: z.string().min(1, 'Idioma é obrigatório'),
  levelId: z.string().min(1, 'Nível é obrigatório'),
  type: z.enum(['reading', 'listening', 'dictation']),
  questions: z.array(questionSchema).min(1, 'Adicione pelo menos uma questão')
})

export interface ExerciseFormProps {
  exercise?: ExerciseWithRelations
  onSubmit?: (data: ExerciseFormData) => Promise<void>
  onSuccess?: () => void
}

export function ExerciseForm({ exercise, onSubmit, onSuccess }: ExerciseFormProps) {
  const [questions, setQuestions] = useState<QuestionFormData[]>(
    exercise?.questions?.map(q => ({
      question: q.question,
      options: JSON.parse(q.options),
      correctAnswer: q.correctAnswer
    })) || []
  )

  const form = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: exercise ? {
      title: exercise.title,
      description: exercise.description,
      content: exercise.content,
      type: exercise.type as 'reading' | 'listening' | 'dictation',
      languageId: exercise.languageId,
      levelId: exercise.levelId,
      questions: exercise.questions.map(q => ({
        question: q.question,
        options: JSON.parse(q.options),
        correctAnswer: q.correctAnswer
      }))
    } : {
      title: '',
      description: '',
      content: '',
      type: 'reading',
      languageId: '',
      levelId: '',
      questions: []
    }
  })

  const exerciseType = form.watch('type')

  useEffect(() => {
    if (exercise) {
      const formattedQuestions = exercise.questions.map(q => ({
        question: q.question,
        options: JSON.parse(q.options),
        correctAnswer: q.correctAnswer
      }))
      form.setValue('questions', formattedQuestions)
    }
  }, [exercise, form])

  const handleAddQuestion = () => {
    const newQuestion: QuestionFormData = { 
      question: '', 
      options: [], 
      correctAnswer: '' 
    }
    setQuestions([...questions, newQuestion])
    form.setValue('questions', [...questions, newQuestion])
  }

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index)
    setQuestions(newQuestions)
    form.setValue('questions', newQuestions)
  }

  const handleQuestionChange = (index: number, field: keyof QuestionFormData, value: any) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setQuestions(newQuestions)
    form.setValue('questions', newQuestions)
  }

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions]
    const options = [...newQuestions[questionIndex].options]
    options[optionIndex] = value
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options
    }
    setQuestions(newQuestions)
    form.setValue('questions', newQuestions)
  }

  const handleFormSubmit = async (data: ExerciseFormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data)
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <Input
            {...form.register('title')}
            placeholder="Digite o título do exercício"
            className="bg-white border-gray-200"
          />
          {form.formState.errors.title && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <Textarea
            {...form.register('description')}
            placeholder="Digite a descrição do exercício"
            className="bg-white border-gray-200"
          />
          {form.formState.errors.description && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {exerciseType === 'reading' ? 'Texto' : exerciseType === 'listening' ? 'Texto para Áudio' : 'Texto para Ditado'}
          </label>
          <Textarea
            {...form.register('content')}
            placeholder={
              exerciseType === 'reading' 
                ? 'Digite o texto do exercício'
                : exerciseType === 'listening'
                ? 'Digite o texto que será convertido em áudio'
                : 'Digite o texto que será lido pelo navegador'
            }
            rows={6}
            className="bg-white border-gray-200"
          />
          {form.formState.errors.content && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.content.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Idioma</label>
            <Select 
              onValueChange={(value) => form.setValue('languageId', value)}
              defaultValue={exercise?.languageId}
            >
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((language) => (
                  <SelectItem 
                    key={language.id} 
                    value={language.id}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.languageId && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.languageId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nível</label>
            <Select 
              onValueChange={(value) => form.setValue('levelId', value)}
              defaultValue={exercise?.levelId}
            >
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((level) => (
                  <SelectItem 
                    key={level.id} 
                    value={level.id}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.levelId && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.levelId.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {exerciseType === 'dictation' ? 'Frases para Ditado' : 'Questões'}
            </h2>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddQuestion}
              className="border-gray-200 hover:bg-gray-50"
            >
              {exerciseType === 'dictation' ? 'Adicionar Frase' : 'Adicionar Questão'}
            </Button>
          </div>

          {questions.map((question, index) => (
            <Card key={index} className="p-4 border-gray-200">
              <div className="space-y-4">
                {exerciseType !== 'dictation' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Questão {index + 1}
                    </label>
                    <Input
                      value={question.question}
                      onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                      placeholder="Digite a pergunta"
                      className="bg-white border-gray-200"
                    />
                  </div>
                )}

                {exerciseType === 'dictation' ? (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Frase {index + 1}
                    </label>
                    <Input
                      value={question.correctAnswer}
                      onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                      placeholder="Digite a frase correta"
                      className="bg-white border-gray-200"
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Opções</label>
                      {question.options.map((option: string, optionIndex: number) => (
                        <Input
                          key={optionIndex}
                          value={option}
                          onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                          placeholder={`Opção ${optionIndex + 1}`}
                          className="bg-white border-gray-200"
                        />
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Resposta Correta
                      </label>
                      <select
                        value={question.correctAnswer}
                        onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                        className="w-full p-2 bg-white border border-gray-200 rounded-md"
                      >
                        <option value="">Selecione a resposta correta</option>
                        {question.options.map((option: string, optionIndex: number) => (
                          option && (
                            <option key={optionIndex} value={option}>
                              Opção {optionIndex + 1}: {option}
                            </option>
                          )
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveQuestion(index)}
                    className="text-red-600 hover:bg-red-50 border-red-200"
                  >
                    {exerciseType === 'dictation' ? 'Remover Frase' : 'Remover Questão'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          className={`text-white ${
            exerciseType === 'reading'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : exerciseType === 'listening'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {exercise ? 'Salvar Alterações' : 'Criar Exercício'}
        </Button>
      </div>
    </form>
  )
} 