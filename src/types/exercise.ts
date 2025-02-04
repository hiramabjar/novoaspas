import { Exercise as PrismaExercise, Question as PrismaQuestion, Language, Level, Module, ExerciseAttempt, ExerciseProgress } from '@prisma/client'

export interface Question extends Omit<PrismaQuestion, 'options'> {
  options: string
  parsedOptions?: string[]
}

export interface Exercise extends Omit<PrismaExercise, 'content' | 'type'> {
  content: string
  type: 'reading' | 'listening' | 'dictation'
  questions: Question[]
  language: Language
  level: Level
  module?: Module | null
  attempts?: ExerciseAttempt[]
  progress?: ExerciseProgress[]
}

export interface ExerciseWithRelations extends Exercise {
  questions: Question[]
  language: Language
  level: Level
  module?: Module | null
  attempts?: ExerciseAttempt[]
  progress?: ExerciseProgress[]
}

export type QuestionFormData = {
  question: string
  options: string[]
  correctAnswer: string
}

export type ExerciseFormData = {
  title: string
  description: string
  content: string
  type: 'reading' | 'listening' | 'dictation'
  languageId: string
  levelId: string
  moduleId?: string
  questions: QuestionFormData[]
}

export interface ExerciseFormProps {
  exercise?: ExerciseWithRelations
  onSubmit?: (data: ExerciseFormData) => Promise<void>
  onSuccess?: () => void
}

export interface ExerciseAttemptData {
  exerciseId: string
  userId: string
  score: number
  answers: Record<string, string>
  startedAt: Date
  completedAt?: Date
}

export interface ExerciseProgressData extends ExerciseProgress {
  exercise?: Exercise
}

export interface ExerciseStats {
  totalExercises: number
  completedExercises: number
  averageScore: number
  averageTime: number
  exercisesByType: {
    reading: number
    listening: number
    dictation: number
  }
  exercisesByLanguage: Record<string, number>
  exercisesByLevel: Record<string, number>
  recentActivity: ExerciseProgressData[]
} 