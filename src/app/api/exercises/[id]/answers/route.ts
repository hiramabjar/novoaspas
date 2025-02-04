import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient, type Question, type Prisma } from '@prisma/client'
import prisma from '@/lib/database/prisma'
import { authOptions } from '@/lib/auth/auth-options'

interface ExerciseWithQuestions {
  id: string
  moduleId?: string | null
  type: string
  questions: Question[]
}

const normalizeText = (text: string) => {
  return text.toLowerCase().trim().replace(/\s+/g, ' ')
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('Received request for exercise:', params.id)

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('No session or user found')
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    console.log('User ID:', userId)

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      console.log('User not found in database')
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const { answers } = await request.json()
    console.log('Received answers:', answers)

    // Buscar exercício e questões
    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
      include: { questions: true }
    }) as ExerciseWithQuestions | null

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercício não encontrado' },
        { status: 404 }
      )
    }

    // Calcular pontuação
    let correctAnswers = 0
    exercise.questions.forEach((question) => {
      const userAnswer = answers.find((a: any) => a.questionId === question.id)?.answer
      if (!userAnswer) return

      if (exercise.type === 'dictation') {
        if (normalizeText(userAnswer) === normalizeText(question.correctAnswer)) {
          correctAnswers++
        }
      } else {
        if (userAnswer === question.correctAnswer) {
          correctAnswers++
        }
      }
    })

    const score = (correctAnswers / exercise.questions.length) * 100

    try {
      // Criar tentativa
      const attempt = await prisma.exerciseAttempt.create({
        data: {
          exerciseId: exercise.id,
          userId,
          score,
          completed: true,
          answers: JSON.stringify(answers),
          completedAt: new Date()
        }
      })

      // Atualizar ou criar progresso
      const progress = await prisma.exerciseProgress.upsert({
        where: {
          userId_exerciseId: {
            userId,
            exerciseId: exercise.id
          }
        },
        update: {
          status: score >= 70 ? 'COMPLETED' : 'FAILED',
          score,
          attempts: { increment: 1 },
          answers: JSON.stringify(answers),
          finishedAt: new Date()
        },
        create: {
          userId,
          exerciseId: exercise.id,
          status: score >= 70 ? 'COMPLETED' : 'FAILED',
          score,
          attempts: 1,
          answers: JSON.stringify(answers),
          finishedAt: new Date()
        }
      })

      // Atualizar progresso do módulo
      if (exercise.moduleId) {
        await prisma.moduleProgress.upsert({
          where: {
            userId_moduleId: {
              userId,
              moduleId: exercise.moduleId
            }
          },
          update: {
            completed: score >= 70 ? { increment: 1 } : undefined,
            total: { increment: 1 }
          },
          create: {
            userId,
            moduleId: exercise.moduleId,
            completed: score >= 70 ? 1 : 0,
            total: 1
          }
        })
      }

      console.log('Operations completed successfully')
      const result = {
        score,
        correctCount: correctAnswers,
        totalQuestions: exercise.questions.length,
        attempt,
        progress
      }

      return NextResponse.json(result)
    } catch (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Erro ao salvar respostas' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error submitting answers:', error)
    return NextResponse.json(
      { error: 'Erro ao processar respostas' },
      { status: 500 }
    )
  }
} 