'use client'

import { useEffect, useState, use } from 'react'
import { Exercise, Module, Language, Level, Question } from '@prisma/client'
import { useRouter } from 'next/navigation'

type ExerciseWithRelations = Exercise & {
  module: Module
  language: Language
  level: Level
  questions: Question[]
}

export default function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const [exercise, setExercise] = useState<ExerciseWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const router = useRouter()
  const { id } = use(params)

  useEffect(() => {
    loadExercise()
  }, [id])

  async function loadExercise() {
    try {
      const response = await fetch(`/api/student/exercises/${id}`)
      const data = await response.json()
      setExercise(data.exercise)
    } catch (error) {
      console.error('Erro ao carregar exercício:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    if (!exercise) return

    let correctCount = 0
    exercise.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })

    const finalScore = (correctCount / exercise.questions.length) * 100
    setScore(finalScore)
    setSubmitted(true)

    // Salvar o progresso do exercício
    try {
      await fetch('/api/student/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseId: exercise.id,
          score: finalScore,
          answers
        }),
      })
    } catch (error) {
      console.error('Erro ao salvar progresso:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando exercício...</p>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="p-6">
        <p className="text-red-600">Exercício não encontrado</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{exercise.title}</h1>
          <div className="flex gap-2">
            <span className="px-2 py-1 text-sm rounded bg-blue-100 text-blue-800">
              {exercise.language.name}
            </span>
            <span className="px-2 py-1 text-sm rounded bg-green-100 text-green-800">
              {exercise.level.name}
            </span>
          </div>
        </div>
        <p className="text-gray-600 mt-2">{exercise.description}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="prose max-w-none mb-8">
          {exercise.content}
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-6">Questões</h2>
          {exercise.questions?.map((question) => {
            const options = JSON.parse(question.options as string)
            return (
              <div key={question.id} className="mb-8">
                <p className="font-medium mb-4">{question.question}</p>
                <div className="space-y-3">
                  {options.map((option: string, index: number) => (
                    <label
                      key={index}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors
                        ${answers[question.id] === option ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}
                        ${submitted ? (
                          option === question.correctAnswer 
                            ? 'border-green-500 bg-green-50' 
                            : answers[question.id] === option 
                              ? 'border-red-500 bg-red-50'
                              : ''
                        ) : ''}`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => handleAnswerSelect(question.id, option)}
                        disabled={submitted}
                        className="mr-3"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {submitted && answers[question.id] === question.correctAnswer && (
                  <p className="mt-2 text-green-600">Correto!</p>
                )}
                {submitted && answers[question.id] !== question.correctAnswer && (
                  <p className="mt-2 text-red-600">
                    Incorreto. A resposta correta é: {question.correctAnswer}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Voltar
          </button>
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== exercise.questions.length}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Finalizar
            </button>
          ) : (
            <div className="text-lg font-semibold">
              Pontuação: {score?.toFixed(0)}%
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 