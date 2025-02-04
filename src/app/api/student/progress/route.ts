import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/database/prisma'
import { Prisma, type ExerciseProgress } from '@prisma/client'

interface ProgressData {
  exerciseId: string
  status: 'started' | 'completed'
  score?: number
}

interface ProgressStats {
  totalExercises: number
  completedExercises: number
  averageScore: number
  streak: number
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { exerciseId, status, score } = await request.json() as ProgressData

    if (!exerciseId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const progress = await prisma.exerciseProgress.upsert({
      where: {
        userId_exerciseId: {
          userId: session.user.id,
          exerciseId
        }
      },
      create: {
        userId: session.user.id,
        exerciseId,
        status,
        score: score || null,
        finishedAt: status === 'completed' ? new Date() : null,
        attempts: 1
      },
      update: {
        status,
        score: score || null,
        finishedAt: status === 'completed' ? new Date() : null,
        attempts: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const stats = await prisma.$transaction<ProgressStats>(async (tx) => {
      const totalExercises = await tx.exercise.count()

      const completedExercises = await tx.exerciseProgress.count({
        where: {
          userId: session.user.id,
          status: 'completed'
        }
      })

      const scores = await tx.exerciseProgress.findMany({
        where: {
          userId: session.user.id,
          status: 'completed',
          score: { not: null }
        },
        select: {
          score: true
        }
      })

      const averageScore = scores.length > 0
        ? Math.round(scores.reduce((acc: number, curr: { score: number | null }) => acc + (curr.score || 0), 0) / scores.length)
        : 0

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const lastDaysActivities = await tx.exerciseProgress.findMany({
        where: {
          userId: session.user.id,
          status: 'completed',
          finishedAt: {
            gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          finishedAt: true
        },
        orderBy: {
          finishedAt: 'desc'
        }
      })

      const uniqueDays = new Set(
        lastDaysActivities.map((activity: { finishedAt: Date | null }) => {
          const date = new Date(activity.finishedAt!)
          date.setHours(0, 0, 0, 0)
          return date.getTime()
        })
      )

      let streak = 0
      let currentDate = today.getTime()

      while (uniqueDays.has(currentDate)) {
        streak++
        currentDate -= 24 * 60 * 60 * 1000
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
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 