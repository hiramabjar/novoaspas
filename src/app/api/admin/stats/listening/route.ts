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
    // Get total listening exercises
    const totalExercises = await prisma.exercise.count({
      where: {
        type: 'listening'
      }
    })

    // Get total completed attempts
    const totalAttempts = await prisma.exerciseAttempt.count({
      where: {
        completedAt: {
          not: null
        },
        exercise: {
          type: 'listening'
        }
      }
    })

    // Get average score
    const attempts = await prisma.exerciseAttempt.findMany({
      where: {
        completedAt: {
          not: null
        },
        exercise: {
          type: 'listening'
        }
      },
      select: {
        score: true,
        startedAt: true,
        completedAt: true
      }
    })

    let totalScore = 0
    let totalTime = 0
    let validAttempts = 0

    attempts.forEach(attempt => {
      if (attempt.score !== null && attempt.completedAt) {
        totalScore += attempt.score
        const time = attempt.completedAt.getTime() - attempt.startedAt.getTime()
        totalTime += time
        validAttempts++
      }
    })

    const averageScore = validAttempts > 0 ? totalScore / validAttempts : 0
    const averageTime = validAttempts > 0 ? totalTime / validAttempts : 0
    const averageMinutes = Math.round(averageTime / (1000 * 60))

    // Get active users
    const activeUsers = await prisma.user.count({
      where: {
        role: 'student'
      }
    })

    return NextResponse.json({
      totalExercises,
      totalAttempts,
      averageScore,
      averageTime: `${averageMinutes}min`,
      activeUsers
    })
  } catch (error) {
    console.error('Error fetching listening stats:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 