import { Prisma } from '@prisma/client'

type Exercise = Prisma.ExerciseGetPayload<{}>
type Question = Prisma.QuestionGetPayload<{}>
type Module = Prisma.ModuleGetPayload<{}>
type Language = Prisma.LanguageGetPayload<{}>
type Level = Prisma.LevelGetPayload<{}>

export type { Exercise, Question, Module, Language, Level } 