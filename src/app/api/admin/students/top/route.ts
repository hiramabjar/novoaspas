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
    const topStudents = await prisma.user.findMany({
      where: {
        role: 'student',
        exerciseAttempts: {
          some: {
            completed: true
          }
        }
      },
      select: {
        id: true,
        name: true,
        exerciseAttempts: {
          where: {
            completed: true
          },
          select: {
            score: true,
            startedAt: true,
            completedAt: true
          }
        }
      },
      take: 5
    })

    const studentsWithStats = topStudents.map(student => {
      const attempts = student.exerciseAttempts
      const totalScore = attempts.reduce((acc, attempt) => acc + attempt.score, 0)
      const averageScore = attempts.length > 0 ? totalScore / attempts.length : 0

      const totalTime = attempts.reduce((acc, attempt) => {
        if (attempt.completedAt && attempt.startedAt) {
          return acc + (attempt.completedAt.getTime() - attempt.startedAt.getTime())
        }
        return acc
      }, 0)

      const totalHours = Math.floor(totalTime / (1000 * 60 * 60))
      const totalMinutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60))

      return {
        id: student.id,
        name: student.name || 'Usuário Anônimo',
        completedExercises: attempts.length,
        averageScore: Math.round(averageScore),
        totalTime: totalHours > 0 
          ? `${totalHours}h ${totalMinutes}min`
          : `${totalMinutes}min`
      }
    })

    // Ordena por média de pontuação
    studentsWithStats.sort((a, b) => b.averageScore - a.averageScore)

    return NextResponse.json(studentsWithStats)
  } catch (error) {
    console.error('Error fetching top students:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 