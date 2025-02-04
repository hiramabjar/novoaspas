import { Exercise as PrismaExercise } from '@prisma/client'

export interface Question {
  id: string
  exerciseId: string
  question: string
  options: string
  correctAnswer: string
  createdAt: Date
  updatedAt: Date
}

export interface Exercise extends PrismaExercise {
  questions: Question[]
}

export type Module = {
  id: string
  name: string
  description: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export type Language = {
  id: string
  name: string
  code: string
  createdAt: Date
  updatedAt: Date
}

export type Level = {
  id: string
  name: string
  code: string
  createdAt: Date
  updatedAt: Date
}

export interface ExerciseWithRelations extends Exercise {
  questions: Question[]
  language?: Language
  level?: Level
  module?: Module
}

export type ExerciseFormData = {
  title: string
  description: string
  content: string
  type: 'reading' | 'listening' | 'dictation'
  languageId: string
  levelId: string
  questions: {
    question: string
    options: any
    correctAnswer: string
  }[]
}

export interface ExerciseFormProps {
  exercise?: ExerciseWithRelations
  onSubmit?: (data: ExerciseFormData) => Promise<void>
  onSuccess?: () => void
} 