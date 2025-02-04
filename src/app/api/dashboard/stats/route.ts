import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/database/prisma'
import { authOptions } from '@/lib/auth/auth-options'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Obter data do início do mês atual e do mês anterior
    const now = new Date()
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const stats = await prisma.$transaction(async (tx) => {
      // Total de alunos
      const totalStudents = await tx.user.count({
        where: { role: 'student' }
      })

      // Alunos do mês anterior
      const lastMonthStudents = await tx.user.count({
        where: {
          role: 'student',
          createdAt: {
            gte: startOfLastMonth,
            lt: startOfCurrentMonth
          }
        }
      })

      // Total de exercícios ativos
      const totalExercises = await tx.exercise.count()

      // Exercícios do mês anterior
      const lastMonthExercises = await tx.exercise.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lt: startOfCurrentMonth
          }
        }
      })

      // Taxa de conclusão (exercícios completados / total de tentativas)
      const exerciseProgress = await tx.exerciseProgress.findMany({
        where: {
          status: 'COMPLETED'
        },
        include: {
          exercise: true
        }
      })

      const totalAttempts = await tx.exerciseProgress.count()
      const completionRate = totalAttempts > 0 
        ? (exerciseProgress.length / totalAttempts) * 100 
        : 0

      // Média de notas
      const averageScore = exerciseProgress.length > 0
        ? exerciseProgress.reduce((acc, curr) => acc + (curr.score || 0), 0) / exerciseProgress.length
        : 0

      // Progresso por módulo
      const modules = await tx.module.findMany({
        include: {
          exercises: {
            include: {
              progress: true
            }
          }
        }
      })

      const moduleProgress = modules.map(module => {
        const totalExercises = module.exercises.length
        const completedExercises = module.exercises.reduce(
          (acc, exercise) => acc + exercise.progress.filter(p => p.status === 'COMPLETED').length,
          0
        )
        
        return {
          moduleName: module.name,
          completed: completedExercises,
          total: totalExercises
        }
      })

      // Atividades recentes
      const recentActivities = await tx.exerciseProgress.findMany({
        where: {
          finishedAt: { not: null }
        },
        include: {
          user: true,
          exercise: {
            include: {
              language: true,
              level: true
            }
          }
        },
        orderBy: {
          finishedAt: 'desc'
        },
        take: 5
      })

      return {
        students: {
          total: totalStudents,
          growth: lastMonthStudents
        },
        exercises: {
          total: totalExercises,
          growth: lastMonthExercises
        },
        completion: {
          rate: completionRate,
          previousRate: 0 // Implementar comparação com mês anterior se necessário
        },
        averageScore: {
          current: averageScore,
          previousScore: 0 // Implementar comparação com mês anterior se necessário
        },
        moduleProgress,
        recentActivities: recentActivities.map(activity => ({
          id: activity.id,
          studentName: activity.user.name,
          exerciseTitle: activity.exercise.title,
          status: activity.status,
          score: activity.score,
          language: activity.exercise.language.name,
          level: activity.exercise.level.name,
          finishedAt: activity.finishedAt
        }))
      }
    })

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro ao obter estatísticas' },
      { status: 500 }
    )
  }
} 