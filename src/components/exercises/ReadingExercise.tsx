import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { DownloadPdfButton } from './DownloadPdfButton'
import type { ExerciseWithRelations } from '@/types/exercise'

interface ReadingExerciseProps {
  exercise: ExerciseWithRelations
  onComplete: (score: number, answers: Record<string, string>) => Promise<void>
}

export function ReadingExercise({ exercise, onComplete }: ReadingExerciseProps) {
  const { toast } = useToast()
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(
    Array(exercise.questions?.length || 0).fill('')
  )
  const [showResults, setShowResults] = useState(false)

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[questionIndex] = answer
    setSelectedAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    if (!exercise.questions) return

    const formattedAnswers = exercise.questions.map((question, index) => ({
      questionId: question.id,
      answer: selectedAnswers[index]
    }))

    let score = 0
    const answers: Record<string, string> = {}

    exercise.questions.forEach((question, index) => {
      const selectedAnswer = selectedAnswers[index]
      answers[question.id] = selectedAnswer

      if (selectedAnswer === question.correctAnswer) {
        score++
      }
    })

    const finalScore = Math.round((score / exercise.questions.length) * 100)
    await onComplete(finalScore, answers)
    setShowResults(true)
    toast({
      title: "Sucesso",
      description: "Respostas enviadas com sucesso!",
      variant: "default"
    })
  }

  if (!exercise.questions) {
    return <div>No questions available</div>
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{exercise.title}</h2>
          <p className="text-gray-600">{exercise.description}</p>
          <div className="prose max-w-none">
            {exercise.content}
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {exercise.questions.map((question, index) => {
          const options = question.options ? question.options.split(',') : []
          return (
            <Card key={question.id} className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Question {index + 1}: {question.question}
                </h3>
                <div className="space-y-2">
                  {options.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={selectedAnswers[index] === option}
                        onChange={() => handleAnswerSelect(index, option)}
                        className="form-radio"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              {showResults && (
                <div className="mt-4">
                  <p className={`text-sm ${
                    selectedAnswers[index] === question.correctAnswer
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {selectedAnswers[index] === question.correctAnswer
                      ? '✓ Resposta correta!'
                      : `✗ Resposta incorreta. A resposta correta é: ${question.correctAnswer}`}
                  </p>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={selectedAnswers.some(answer => !answer)}
        className="w-full"
      >
        Submit
      </Button>
    </div>
  )
} 