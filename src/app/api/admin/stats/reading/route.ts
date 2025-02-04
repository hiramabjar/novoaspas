import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get total reading exercises
    const totalExercises = await prisma.exercise.count({
      where: {
        type: 'reading'
      }
    })

    // Get total completed attempts
    const totalAttempts = await prisma.exerciseAttempt.count({
      where: {
        completedAt: {
          not: null
        },
        exercise: {
          type: 'reading'
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
          type: 'reading'
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
    console.error('Error fetching reading stats:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 