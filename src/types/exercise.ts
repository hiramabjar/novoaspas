export interface Exercise {
  id: string
  title: string
  description: string
  content: string
  type: 'reading' | 'listening' | 'dictation'
  audioUrl?: string
  moduleId?: string
  languageId: string
  levelId: string
  questions: Question[]
  language: {
    id: string
    name: string
    code: string
  }
  level: {
    id: string
    name: string
  }
  module?: {
    id: string
    name: string
    description: string | null
  }
  createdAt: string
  updatedAt: string
}

export interface Question {
  id: string
  exerciseId: string
  question: string
  options: string // JSON string
  correctAnswer: string
  createdAt: Date
  updatedAt: Date
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

export type ExerciseWithRelations = Exercise & {
  module: Module
  language: Language
  level: Level
  questions: Question[]
} 