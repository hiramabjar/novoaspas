import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get top students using aggregation
    const topStudents = await prisma.$queryRaw`
      WITH StudentStats AS (
        SELECT 
          u.id,
          u.name,
          COUNT(ea.id) as totalAttempts,
          ROUND(AVG(CAST(ea.score as FLOAT)), 2) as averageScore,
          ROUND(AVG(CAST((julianday(ea.completedAt) - julianday(ea.startedAt)) * 24 * 60 as FLOAT)), 2) as averageTime
        FROM User u
        INNER JOIN ExerciseAttempt ea ON u.id = ea.userId
        WHERE u.role = 'student'
        AND ea.completedAt IS NOT NULL
        GROUP BY u.id, u.name
        HAVING COUNT(ea.id) > 0
      )
      SELECT 
        id,
        COALESCE(name, 'Usuário Anônimo') as name,
        totalAttempts,
        ROUND(averageScore) as averageScore,
        ROUND(averageTime) as averageTime
      FROM StudentStats
      ORDER BY averageScore DESC
      LIMIT 10
    `

    return NextResponse.json(topStudents)
  } catch (error) {
    console.error('Error fetching top students:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 