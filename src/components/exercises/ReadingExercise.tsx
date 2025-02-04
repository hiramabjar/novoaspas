import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { DownloadPdfButton } from './DownloadPdfButton'
import type { Exercise } from '@/types/exercise'

interface ReadingExerciseProps {
  exercise: Exercise
  onSubmit: (answers: Array<{ questionId: string; answer: string }>) => void
}

export function ReadingExercise({ exercise, onSubmit }: ReadingExerciseProps) {
  const { toast } = useToast()
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(Array(exercise.questions.length).fill(''))
  const [showResults, setShowResults] = useState(false)

  const handleSubmit = () => {
    if (selectedAnswers.some(answer => !answer)) {
      toast({
        title: "Atenção",
        description: "Por favor, responda todas as questões antes de enviar.",
        variant: "destructive"
      })
      return
    }

    // Criar array de respostas no formato esperado
    const formattedAnswers = exercise.questions.map((question, index) => ({
      questionId: question.id,
      answer: selectedAnswers[index]
    }))

    // Enviar respostas para pontuação
    try {
      onSubmit(formattedAnswers)
      setShowResults(true)
      toast({
        title: "Sucesso",
        description: "Respostas enviadas com sucesso!",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar respostas. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="prose max-w-none">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">Exercício de Leitura</h2>
              <p className="text-gray-600">Leia o texto e responda as questões abaixo.</p>
            </div>
            <DownloadPdfButton
              title={exercise.title}
              content={exercise.content}
              description={exercise.description}
            />
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="whitespace-pre-wrap">{exercise.content}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {exercise.questions.map((question, index) => {
          const options = JSON.parse(question.options)
          return (
            <Card key={question.id} className="p-6">
              <p className="font-medium mb-4">
                {index + 1}. {question.question}
              </p>
              <div className="space-y-2">
                {options.map((option: string, optIndex: number) => (
                  <label
                    key={optIndex}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={selectedAnswers[index] === option}
                      onChange={(e) => {
                        const newAnswers = [...selectedAnswers]
                        newAnswers[index] = e.target.value
                        setSelectedAnswers(newAnswers)
                      }}
                      className="form-radio"
                    />
                    <span>{option}</span>
                  </label>
                ))}
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

      {!showResults && (
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Enviar Respostas
          </Button>
        </div>
      )}
    </div>
  )
} 