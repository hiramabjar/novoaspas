'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export interface Question {
  question: string
  options: string[]
  correctAnswer: string
}

export interface QuestionFormProps {
  questions: Question[]
  onChange: (questions: Question[]) => void
}

export function QuestionForm({ questions = [], onChange }: QuestionFormProps) {
  const addQuestion = () => {
    const newQuestion: Question = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: ''
    }
    onChange([...questions, newQuestion])
  }

  const updateQuestion = (index: number, field: keyof Question, value: string | string[]) => {
    const updatedQuestions = questions.map((q, i) => {
      if (i === index) {
        return { ...q, [field]: value }
      }
      return q
    })
    onChange(updatedQuestions)
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index)
    onChange(updatedQuestions)
  }

  return (
    <div className="space-y-4">
      {questions.map((question, questionIndex) => (
        <Card key={questionIndex} className="p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Questão {questionIndex + 1}</Label>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeQuestion(questionIndex)}
              >
                Remover
              </Button>
            </div>

            <div>
              <Label>Pergunta</Label>
              <Input
                value={question.question}
                onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                placeholder="Digite a pergunta"
              />
            </div>

            <div className="space-y-2">
              <Label>Opções</Label>
              {question.options.map((option, optionIndex) => (
                <Input
                  key={optionIndex}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options]
                    newOptions[optionIndex] = e.target.value
                    updateQuestion(questionIndex, 'options', newOptions)
                  }}
                  placeholder={`Opção ${optionIndex + 1}`}
                />
              ))}
            </div>

            <div>
              <Label>Resposta Correta</Label>
              <select
                value={question.correctAnswer}
                onChange={(e) => updateQuestion(questionIndex, 'correctAnswer', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Selecione a resposta correta</option>
                {question.options.map((option, optionIndex) => (
                  option && (
                    <option key={optionIndex} value={option}>
                      {option}
                    </option>
                  )
                ))}
              </select>
            </div>
          </div>
        </Card>
      ))}

      <Button type="button" onClick={addQuestion} className="w-full">
        Adicionar Questão
      </Button>
    </div>
  )
} 