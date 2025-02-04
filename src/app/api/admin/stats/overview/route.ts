import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

interface StatsResult {
  averageScore: number
  averageTime: number
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
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

    // Get average score and time using raw SQL for better performance
    const stats = await prisma.$queryRaw<StatsResult[]>`
      SELECT 
        COALESCE(ROUND(AVG(CAST(score as FLOAT)), 2), 0) as "averageScore",
        COALESCE(ROUND(AVG(CAST(EXTRACT(EPOCH FROM (completedAt - startedAt)) / 60 as FLOAT)), 2), 0) as "averageTime"
      FROM "ExerciseAttempt"
      WHERE "completedAt" IS NOT NULL
      AND score IS NOT NULL
    `

    const { averageScore = 0, averageTime = 0 } = stats[0] || {}

    return NextResponse.json({
      totalStudents,
      totalExercises,
      totalAttempts,
      averageScore,
      averageTime
    })
  } catch (error) {
    console.error('Error fetching overview stats:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 