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

    // Buscar dados do mês atual
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    // Buscar dados do mês anterior
    const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)

    // Queries em paralelo para melhor performance
    const [
      activeStudentsThisMonth,
      activeStudentsLastMonth,
      totalExercises,
      totalExercisesLastMonth,
      exerciseStats,
      completedExercises,
      attempts
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: 'student',
          exerciseAttempts: {
            some: {
              startedAt: {
                gte: firstDayOfMonth,
                lte: lastDayOfMonth
              }
            }
          }
        }
      }),
      prisma.user.count({
        where: {
          role: 'student',
          exerciseAttempts: {
            some: {
              startedAt: {
                gte: firstDayOfLastMonth,
                lte: lastDayOfLastMonth
              }
            }
          }
        }
      }),
      prisma.exercise.count(),
      prisma.exercise.count({
        where: {
          createdAt: {
            lt: firstDayOfMonth
          }
        }
      }),
      prisma.exerciseAttempt.aggregate({
        _count: { id: true },
        where: {
          startedAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        }
      }),
      prisma.exerciseAttempt.count({
        where: {
          completed: true,
          startedAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        }
      }),
      prisma.exerciseAttempt.findMany({
        where: {
          completed: true,
          startedAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        },
        select: {
          startedAt: true,
          completedAt: true
        }
      })
    ])

    const completionRate = exerciseStats._count.id > 0
      ? (completedExercises / exerciseStats._count.id) * 100
      : 0

    const averageTime = attempts.length > 0
      ? attempts.reduce((acc, curr) => {
          const duration = curr.completedAt 
            ? (curr.completedAt.getTime() - curr.startedAt.getTime()) / 60000 
            : 0
          return acc + duration
        }, 0) / attempts.length
      : 0

    return NextResponse.json({
      activeStudents: {
        current: activeStudentsThisMonth,
        previous: activeStudentsLastMonth,
        change: activeStudentsThisMonth - activeStudentsLastMonth
      },
      totalExercises: {
        current: totalExercises,
        previous: totalExercisesLastMonth,
        change: totalExercises - totalExercisesLastMonth
      },
      completionRate: {
        current: Math.round(completionRate * 10) / 10,
        previous: 0,
        change: 0
      },
      averageTime: {
        current: Math.round(averageTime),
        previous: 0,
        change: 0
      }
    })
  } catch (error) {
    console.error('Error fetching overview stats:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 