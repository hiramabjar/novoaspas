import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const createListeningExerciseSchema = z.object({
  title: z.string(),
  description: z.string(),
  content: z.string(),
  type: z.literal('listening'),
  moduleId: z.string(),
  languageId: z.string(),
  levelId: z.string(),
  audioUrl: z.string(),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string()
  }))
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createListeningExerciseSchema.parse(body)

    const exercise = await prisma.exercise.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        content: validatedData.content,
        type: validatedData.type,
        moduleId: validatedData.moduleId,
        languageId: validatedData.languageId,
        levelId: validatedData.levelId,
        audioUrl: validatedData.audioUrl,
        questions: {
          create: validatedData.questions.map(q => ({
            question: q.question,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer
          }))
        }
      },
      include: {
        questions: true
      }
    })

    return NextResponse.json(exercise)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')
    const languageId = searchParams.get('languageId')
    const levelId = searchParams.get('levelId')

    const exercises = await prisma.exercise.findMany({
      where: {
        type: 'listening',
        moduleId: moduleId || undefined,
        languageId: languageId || undefined,
        levelId: levelId || undefined
      },
      include: {
        questions: true,
        module: true,
        language: true,
        level: true
      }
    })

    return NextResponse.json(exercises)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 