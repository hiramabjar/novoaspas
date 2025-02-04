import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const activities = await prisma.$queryRaw<RecentActivity[]>`
      SELECT 
        ea.id,
        COALESCE(u.name, 'Anonymous User') as "studentName",
        COALESCE(e.title, 'Removed Exercise') as "exerciseTitle",
        COALESCE(e.type, 'unknown') as "type",
        ea.score,
        ea."completedAt"
      FROM "ExerciseAttempt" ea
      LEFT JOIN "User" u ON ea."userId" = u.id
      LEFT JOIN "Exercise" e ON ea."exerciseId" = e.id
      WHERE ea."completedAt" IS NOT NULL
      ORDER BY ea."completedAt" DESC
      LIMIT 10
    `

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}