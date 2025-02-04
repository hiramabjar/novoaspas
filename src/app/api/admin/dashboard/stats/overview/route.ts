import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/database/prisma'
import { authOptions } from '@/lib/auth/auth-options'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get total students
    const totalStudents = await prisma.user.count({
      where: {
        role: 'student'
      }
    })

    // Get total exercises
    const totalExercises = await prisma.exercise.count()

    // Get total exercise attempts
    const totalAttempts = await prisma.exerciseAttempt.count({
      where: {
        completedAt: {
          not: null
        }
      }
    })

    // Get average score
    const attempts = await prisma.exerciseAttempt.findMany({
      where: {
        completedAt: {
          not: null
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

    return NextResponse.json({
      totalStudents,
      totalExercises,
      totalAttempts,
      averageScore,
      averageTime
    })
  } catch (error) {
    console.error('Error fetching overview stats:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 