import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addMonths, startOfMonth, endOfMonth } from 'date-fns'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get current month range
    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)

    // Get previous month range
    const previousMonthStart = startOfMonth(addMonths(now, -1))
    const previousMonthEnd = endOfMonth(addMonths(now, -1))

    // Get active students (students who attempted at least one exercise)
    const currentActiveStudents = await prisma.exerciseAttempt.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      },
      _count: true
    })

    const previousActiveStudents = await prisma.exerciseAttempt.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: previousMonthStart,
          lte: previousMonthEnd
        }
      },
      _count: true
    })

    // Get total exercises
    const totalExercises = await prisma.exercise.count()
    const previousTotalExercises = await prisma.exercise.count({
      where: {
        createdAt: {
          lt: currentMonthStart
        }
      }
    })

    // Get completion rate
    const currentCompletedExercises = await prisma.exerciseAttempt.count({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      }
    })

    const currentTotalAttempts = await prisma.exerciseAttempt.count({
      where: {
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      }
    })

    const previousCompletedExercises = await prisma.exerciseAttempt.count({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: previousMonthStart,
          lte: previousMonthEnd
        }
      }
    })

    const previousTotalAttempts = await prisma.exerciseAttempt.count({
      where: {
        createdAt: {
          gte: previousMonthStart,
          lte: previousMonthEnd
        }
      }
    })

    // Get average completion time
    const currentAverageTime = await prisma.exerciseAttempt.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      },
      _avg: {
        timeSpentInSeconds: true
      }
    })

    const previousAverageTime = await prisma.exerciseAttempt.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: previousMonthStart,
          lte: previousMonthEnd
        }
      },
      _avg: {
        timeSpentInSeconds: true
      }
    })

    // Calculate changes
    const currentActiveStudentsCount = currentActiveStudents.length
    const previousActiveStudentsCount = previousActiveStudents.length
    const activeStudentsChange = previousActiveStudentsCount === 0 
      ? 0 
      : Math.round(((currentActiveStudentsCount - previousActiveStudentsCount) / previousActiveStudentsCount) * 100)

    const exercisesChange = previousTotalExercises === 0 
      ? 0 
      : Math.round(((totalExercises - previousTotalExercises) / previousTotalExercises) * 100)

    const currentCompletionRate = currentTotalAttempts === 0 
      ? 0 
      : Math.round((currentCompletedExercises / currentTotalAttempts) * 100)
    const previousCompletionRate = previousTotalAttempts === 0 
      ? 0 
      : Math.round((previousCompletedExercises / previousTotalAttempts) * 100)
    const completionRateChange = previousCompletionRate === 0 
      ? 0 
      : Math.round(((currentCompletionRate - previousCompletionRate) / previousCompletionRate) * 100)

    const currentAvgTimeMinutes = Math.round((currentAverageTime._avg.timeSpentInSeconds || 0) / 60)
    const previousAvgTimeMinutes = Math.round((previousAverageTime._avg.timeSpentInSeconds || 0) / 60)
    const averageTimeChange = previousAvgTimeMinutes === 0 
      ? 0 
      : Math.round(((currentAvgTimeMinutes - previousAvgTimeMinutes) / previousAvgTimeMinutes) * 100)

    return NextResponse.json({
      activeStudents: {
        total: currentActiveStudentsCount,
        change: activeStudentsChange
      },
      totalExercises: {
        total: totalExercises,
        change: exercisesChange
      },
      completionRate: {
        total: currentCompletionRate,
        change: completionRateChange
      },
      averageTime: {
        total: currentAvgTimeMinutes,
        change: averageTimeChange
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 