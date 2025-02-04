import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Total de exercícios de reading
    const totalExercises = await prisma.exercise.count({
      where: {
        type: 'reading'
      }
    })

    // Exercícios completados
    const completedAttempts = await prisma.exerciseAttempt.count({
      where: {
        completed: true,
        exercise: {
          type: 'reading'
        }
      }
    })

    // Total de tentativas
    const totalAttempts = await prisma.exerciseAttempt.count({
      where: {
        exercise: {
          type: 'reading'
        }
      }
    })

    // Média de pontuação
    const attempts = await prisma.exerciseAttempt.findMany({
      where: {
        completed: true,
        exercise: {
          type: 'reading'
        }
      },
      select: {
        score: true,
        startedAt: true,
        completedAt: true
      }
    })

    const totalScore = attempts.reduce((acc, attempt) => acc + attempt.score, 0)
    const averageScore = attempts.length > 0 ? totalScore / attempts.length : 0

    // Tempo médio
    const totalTime = attempts.reduce((acc, attempt) => {
      if (attempt.completedAt && attempt.startedAt) {
        return acc + (attempt.completedAt.getTime() - attempt.startedAt.getTime())
      }
      return acc
    }, 0)

    const averageTime = attempts.length > 0 ? totalTime / attempts.length : 0
    const averageMinutes = Math.round(averageTime / (1000 * 60))

    // Usuários ativos (que fizeram pelo menos uma tentativa no último mês)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activeUsers = await prisma.user.count({
      where: {
        role: 'student',
        exerciseAttempts: {
          some: {
            exercise: {
              type: 'reading'
            },
            startedAt: {
              gte: thirtyDaysAgo
            }
          }
        }
      }
    })

    return NextResponse.json({
      totalExercises,
      completedExercises: completedAttempts,
      averageScore,
      totalAttempts,
      averageTime: `${averageMinutes}min`,
      activeUsers
    })
  } catch (error) {
    console.error('Error fetching reading stats:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 