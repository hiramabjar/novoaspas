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
import type { Exercise } from '@/types/exercise'

const exerciseSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  languageId: z.string().min(1, 'Idioma é obrigatório'),
  levelId: z.string().min(1, 'Nível é obrigatório'),
  type: z.enum(['reading', 'listening', 'dictation']),
  questions: z.array(z.object({
    question: z.string(),
    options: z.any(),
    correctAnswer: z.string()
  }))
})

type ExerciseFormData = z.infer<typeof exerciseSchema>

interface ExerciseFormProps {
  exercise?: Exercise
  onSubmit: (data: ExerciseFormData) => Promise<void>
}

export function ExerciseForm({ exercise, onSubmit }: ExerciseFormProps) {
  const [questions, setQuestions] = useState<any[]>(
    exercise?.questions.map(q => ({
      ...q,
      options: exercise.type === 'dictation' ? [] : JSON.parse(q.options)
    })) || []
  )

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: exercise || {
      questions: []
    }
  })

  useEffect(() => {
    if (exercise) {
      Object.entries(exercise).forEach(([key, value]) => {
        if (key !== 'questions') {
          setValue(key as keyof ExerciseFormData, value)
        }
      })
    }
  }, [exercise, setValue])

  const handleAddQuestion = () => {
    const newQuestion = {
      question: exercise?.type === 'dictation' ? 'Digite o que você ouviu:' : '',
      options: exercise?.type === 'dictation' ? [] : ['', '', '', ''],
      correctAnswer: ''
    }
    setQuestions([...questions, newQuestion])
  }

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const newQuestions = [...questions]
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    }
    setQuestions(newQuestions)
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
  }

  const handleFormSubmit = async (data: ExerciseFormData) => {
    const formattedData = {
      ...data,
      questions: questions.map(q => ({
        ...q,
        options: exercise?.type === 'dictation' 
          ? JSON.stringify([q.correctAnswer])
          : JSON.stringify(q.options)
      }))
    }
    await onSubmit(formattedData)
  }

  const exerciseType = exercise?.type || 'reading'

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <Input
            {...register('title')}
            placeholder="Digite o título do exercício"
            className="bg-white border-gray-200"
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
            className="bg-white border-gray-200"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {exerciseType === 'reading' ? 'Texto' : exerciseType === 'listening' ? 'Texto para Áudio' : 'Texto para Ditado'}
          </label>
          <Textarea
            {...register('content')}
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
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Idioma</label>
            <Select 
              onValueChange={(value) => setValue('languageId', value)}
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
            {errors.languageId && (
              <p className="text-red-500 text-sm mt-1">{errors.languageId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nível</label>
            <Select 
              onValueChange={(value) => setValue('levelId', value)}
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
            {errors.levelId && (
              <p className="text-red-500 text-sm mt-1">{errors.levelId.message}</p>
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