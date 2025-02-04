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
    const recentAttempts = await prisma.exerciseAttempt.findMany({
      where: {
        completed: true
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 10,
      include: {
        user: {
          select: {
            name: true
          }
        },
        exercise: {
          select: {
            title: true,
            type: true
          }
        }
      }
    })

    const activities = recentAttempts.map(attempt => ({
      id: attempt.id,
      studentName: attempt.user.name || 'Usuário Anônimo',
      exerciseTitle: attempt.exercise.title,
      type: attempt.exercise.type,
      score: attempt.score,
      completedAt: attempt.completedAt?.toISOString() || ''
    }))

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 