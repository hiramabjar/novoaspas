'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Exercise, Question } from '@prisma/client'

type ExerciseWithQuestions = Exercise & {
  questions: Question[]
}

export default function QuestionsPage() {
  const router = useRouter()
  const params = useParams()
  const [exercise, setExercise] = useState<ExerciseWithQuestions | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const exerciseId = typeof params?.id === 'string' ? params.id : null
    if (!exerciseId) return

    loadQuestions(exerciseId)
  }, [params])

  async function loadQuestions(exerciseId: string) {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/exercises/${exerciseId}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar questões')
      }

      const data = await response.json()
      setExercise(data.exercise)
      setQuestions(data.exercise.questions)
    } catch (error) {
      console.error('Erro:', error)
      setError(error instanceof Error ? error.message : 'Erro ao carregar questões')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddQuestion() {
    if (!exercise) return

    const newQuestion = {
      question: '',
      options: JSON.stringify(['', '', '', '']),
      correctAnswer: '',
      exerciseId: exercise.id
    }

    setQuestions(prev => [...prev, { ...newQuestion, id: `temp-${Date.now()}` } as Question])
  }

  async function handleSaveQuestions() {
    if (!exercise) return

    try {
      const response = await fetch(`/api/admin/exercises/${exercise.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...exercise,
          questions: questions.map(q => ({
            question: q.question,
            options: JSON.parse(q.options),
            correctAnswer: q.correctAnswer
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar questões')
      }

      router.push(`/admin/dashboard/exercises/${exercise.id}`)
    } catch (error) {
      console.error('Erro:', error)
      setError(error instanceof Error ? error.message : 'Erro ao salvar questões')
    }
  }

  function handleQuestionChange(index: number, field: keyof Question, value: string) {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== index) return q
      return { ...q, [field]: value }
    }))
  }

  function handleOptionsChange(index: number, value: string) {
    const options = value.split('\n').filter(Boolean)
    setQuestions(prev => prev.map((q, i) => {
      if (i !== index) return q
      return { ...q, options: JSON.stringify(options) }
    }))
  }

  function handleRemoveQuestion(index: number) {
    setQuestions(prev => prev.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded">
        Erro: {error}
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-600 rounded">
        Exercício não encontrado
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Questões do Exercício</h1>
        <button
          onClick={handleAddQuestion}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Adicionar Questão
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">Questão {index + 1}</h3>
              <button
                onClick={() => handleRemoveQuestion(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remover
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pergunta</label>
                <input
                  type="text"
                  value={question.question}
                  onChange={e => handleQuestionChange(index, 'question', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Digite a pergunta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Opções (uma por linha)
                </label>
                <textarea
                  value={JSON.parse(question.options).join('\n')}
                  onChange={e => handleOptionsChange(index, e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={4}
                  placeholder="Digite as opções"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Resposta Correta
                </label>
                <input
                  type="text"
                  value={question.correctAnswer}
                  onChange={e => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Digite a resposta correta"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          onClick={handleSaveQuestions}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Salvar Questões
        </button>
      </div>
    </div>
  )
} 