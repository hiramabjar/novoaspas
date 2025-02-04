import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/database/prisma'
import type { Question, Exercise } from '@prisma/client'
import type { ExerciseFormData } from '@/types/exercise'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const exercises = await prisma.exercise.findMany({
      include: {
        language: true,
        level: true,
        questions: true,
        module: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedExercises = exercises.map(exercise => ({
      ...exercise,
      questions: exercise.questions.map((question: Question) => ({
        ...question,
        parsedOptions: JSON.parse(question.options)
      }))
    }))

    return NextResponse.json({ exercises: formattedExercises })
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data: ExerciseFormData = await request.json()

    const language = await prisma.language.findUnique({
      where: { id: data.languageId }
    })

    const level = await prisma.level.findUnique({
      where: { id: data.levelId }
    })

    if (!language || !level) {
      return NextResponse.json(
        { error: 'Idioma ou nível não encontrado' },
        { status: 404 }
      )
    }

    const moduleId = data.type === 'reading' ? 'reading-module' : 'listening-module'

    const module = await prisma.module.findUnique({
      where: { id: moduleId }
    })

    if (!module) {
      return NextResponse.json(
        { error: 'Módulo não encontrado' },
        { status: 404 }
      )
    }

    const exercise = await prisma.exercise.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        type: data.type,
        moduleId,
        languageId: data.languageId,
        levelId: data.levelId,
        questions: {
          create: data.questions.map(q => ({
            question: q.question,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer
          }))
        }
      },
      include: {
        questions: true,
        module: true,
        language: true,
        level: true
      }
    })

    return NextResponse.json(exercise)
  } catch (error) {
    console.error('Erro ao criar exercício:', error)
    return NextResponse.json(
      { error: 'Erro ao criar exercício' },
      { status: 500 }
    )
  }
} 