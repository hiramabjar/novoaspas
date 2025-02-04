import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/database/prisma'
import { Prisma } from '@prisma/client'

interface ExerciseGroupByLanguage {
  languageId: string
  _count: {
    id: number
  }
}

interface ExerciseGroupByLevel {
  levelId: string
  _count: {
    id: number
  }
}

interface CompletedExercises {
  count: number
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const totalCompletedExercises = await prisma.$queryRaw<CompletedExercises[]>`
      SELECT COUNT(*) as count
      FROM "ExerciseProgress"
      WHERE status = 'completed'
    `

    const exercisesByLanguage = await prisma.$queryRaw<ExerciseGroupByLanguage[]>`
      SELECT 
        "languageId",
        COUNT(id) as "_count__id"
      FROM "Exercise"
      GROUP BY "languageId"
    `

    const exercisesByLevel = await prisma.$queryRaw<ExerciseGroupByLevel[]>`
      SELECT 
        "levelId",
        COUNT(id) as "_count__id"
      FROM "Exercise"
      GROUP BY "levelId"
    `

    return NextResponse.json({
      totalCompletedExercises: totalCompletedExercises[0]?.count || 0,
      byLanguage: exercisesByLanguage,
      byLevel: exercisesByLevel
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 