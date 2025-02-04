import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

interface RecentActivity {
  id: string
  studentName: string
  exerciseTitle: string
  type: string
  score: number
  completedAt: Date
}

export async function GET() {
  try {
    const activities = await prisma.exerciseAttempt.findMany({
      where: {
        completedAt: {
          not: null
        }
      },
      select: {
        id: true,
        score: true,
        completedAt: true,
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
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 10
    })

    const formattedActivities: RecentActivity[] = activities.map(activity => ({
      id: activity.id,
      studentName: activity.user?.name || 'Anonymous User',
      exerciseTitle: activity.exercise?.title || 'Removed Exercise',
      type: activity.exercise?.type || 'unknown',
      score: activity.score,
      completedAt: activity.completedAt!
    }))

    return NextResponse.json(formattedActivities)
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}