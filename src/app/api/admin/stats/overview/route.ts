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
    // Busca dados do mês atual
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    // Busca dados do mês anterior
    const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)

    // Estatísticas de alunos
    const totalStudents = await prisma.user.count({
      where: { role: 'student' }
    })

    const activeStudents = await prisma.user.count({
      where: {
        role: 'student',
        exerciseAttempts: {
          some: {
            completedAt: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            }
          }
        }
      }
    })

    const lastMonthActiveStudents = await prisma.user.count({
      where: {
        role: 'student',
        exerciseAttempts: {
          some: {
            completedAt: {
              gte: firstDayOfLastMonth,
              lte: lastDayOfLastMonth
            }
          }
        }
      }
    })

    // Estatísticas de exercícios
    const totalExercises = await prisma.exercise.count()
    const lastMonthExercises = await prisma.exercise.count({
      where: {
        createdAt: {
          lt: firstDayOfMonth
        }
      }
    })

    // Taxa de conclusão
    const totalAttempts = await prisma.exerciseAttempt.count({
      where: {
        completedAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        }
      }
    })

    const completedAttempts = await prisma.exerciseAttempt.count({
      where: {
        completedAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        },
        completed: true
      }
    })

    const lastMonthTotalAttempts = await prisma.exerciseAttempt.count({
      where: {
        completedAt: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth
        }
      }
    })

    const lastMonthCompletedAttempts = await prisma.exerciseAttempt.count({
      where: {
        completedAt: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth
        },
        completed: true
      }
    })

    // Tempo médio de conclusão
    const attempts = await prisma.exerciseAttempt.findMany({
      where: {
        completedAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        },
        completed: true
      },
      select: {
        startedAt: true,
        completedAt: true
      }
    })

    const totalTime = attempts.reduce((acc, attempt) => {
      const time = attempt.completedAt.getTime() - attempt.startedAt.getTime()
      return acc + time
    }, 0)

    const averageTime = attempts.length > 0 ? totalTime / attempts.length : 0
    const averageMinutes = Math.round(averageTime / (1000 * 60))

    return NextResponse.json({
      totalStudents,
      activeStudents,
      studentsGrowth: activeStudents - lastMonthActiveStudents,
      totalExercises,
      exercisesGrowth: totalExercises - lastMonthExercises,
      completionRate: totalAttempts > 0 ? (completedAttempts / totalAttempts) * 100 : 0,
      previousCompletionRate: lastMonthTotalAttempts > 0 
        ? (lastMonthCompletedAttempts / lastMonthTotalAttempts) * 100 
        : 0,
      averageCompletionTime: `${averageMinutes}min`
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 