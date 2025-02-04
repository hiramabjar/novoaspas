import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { exerciseId, score, answers } = data

    // Registrar o progresso do exercício
    const progress = await prisma.exerciseProgress.create({
      data: {
        userId: session.user.id,
        exerciseId,
        status: 'COMPLETED',
        score,
        answers,
        finishedAt: new Date(),
        attempts: 1
      }
    })

    return NextResponse.json({ 
      success: true,
      progress 
    })

  } catch (error) {
    console.error('Erro ao salvar progresso:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar progresso' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar todas as estatísticas necessárias em uma única transação
    const stats = await prisma.$transaction(async (tx) => {
      // Total de exercícios disponíveis
      const totalExercises = await tx.exercise.count()

      // Exercícios completados pelo usuário
      const completedExercises = await tx.exerciseProgress.count({
        where: {
          userId: session.user.id,
          status: 'COMPLETED'
        }
      })

      // Média de pontuação
      const scores = await tx.exerciseProgress.findMany({
        where: {
          userId: session.user.id,
          status: 'COMPLETED',
          score: { not: null }
        },
        select: {
          score: true
        }
      })

      const averageScore = scores.length > 0
        ? Math.round(scores.reduce((acc, curr) => acc + (curr.score || 0), 0) / scores.length)
        : 0

      // Calcular sequência de dias (streak)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const lastDaysActivities = await tx.exerciseProgress.findMany({
        where: {
          userId: session.user.id,
          status: 'COMPLETED',
          finishedAt: {
            gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) // últimos 30 dias
          }
        },
        select: {
          finishedAt: true
        },
        orderBy: {
          finishedAt: 'desc'
        }
      })

      // Converter as datas para dias únicos (sem hora)
      const uniqueDays = new Set(
        lastDaysActivities.map(activity => {
          const date = new Date(activity.finishedAt!)
          date.setHours(0, 0, 0, 0)
          return date.getTime()
        })
      )

      // Calcular streak atual
      let streak = 0
      let currentDate = today.getTime()

      while (uniqueDays.has(currentDate)) {
        streak++
        currentDate -= 24 * 60 * 60 * 1000 // subtrair um dia
      }

      return {
        totalExercises,
        completedExercises,
        averageScore,
        streak
      }
    })

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erro ao buscar progresso:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar progresso' },
      { status: 500 }
    )
  }
} 