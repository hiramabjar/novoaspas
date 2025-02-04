import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar o perfil do aluno com suas matrículas
    const student = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        studentProfile: {
          include: {
            enrollments: {
              where: { status: 'ACTIVE' },
              include: {
                language: true,
                level: true
              }
            }
          }
        }
      }
    })

    if (!student?.studentProfile) {
      return NextResponse.json(
        { error: 'Perfil de aluno não encontrado' },
        { status: 404 }
      )
    }

    // Buscar exercícios baseados nas matrículas do aluno
    const enrollments = student.studentProfile.enrollments
    const exercises = await prisma.exercise.findMany({
      where: {
        OR: enrollments.map(enrollment => ({
          AND: {
            languageId: enrollment.languageId,
            levelId: enrollment.levelId
          }
        }))
      },
      include: {
        module: true,
        language: true,
        level: true,
        questions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ exercises })

  } catch (error) {
    console.error('Erro ao buscar exercícios:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao buscar exercícios',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 