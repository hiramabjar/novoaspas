import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { authOptions } from '@/lib/auth/auth-options'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar as últimas 10 atividades completadas do usuário
    const activities = await prisma.exerciseProgress.findMany({
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
        finishedAt: { not: null }
      },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      },
      orderBy: {
        finishedAt: 'desc'
      },
      take: 10
    })

    // Formatar os dados para o formato esperado pelo frontend
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.exercise.type.toLowerCase() as 'reading' | 'listening',
      title: activity.exercise.title,
      score: activity.score || 0,
      completedAt: activity.finishedAt?.toISOString() || new Date().toISOString()
    }))

    return NextResponse.json(formattedActivities)

  } catch (error) {
    console.error('Erro ao buscar atividades:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar atividades' },
      { status: 500 }
    )
  }
} 