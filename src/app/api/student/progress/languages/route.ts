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

    // Buscar progresso por idioma em uma única transação
    const languagesProgress = await prisma.$transaction(async (tx) => {
      // Buscar todos os idiomas
      const languages = await tx.language.findMany({
        select: {
          id: true,
          name: true,
          exercises: {
            select: {
              id: true,
              progress: {
                where: {
                  userId: session.user.id,
                  status: 'COMPLETED'
                }
              }
            }
          }
        }
      })

      // Calcular progresso para cada idioma
      return languages.map(language => {
        const totalExercises = language.exercises.length
        const completedExercises = language.exercises.reduce(
          (acc, exercise) => acc + (exercise.progress.length > 0 ? 1 : 0),
          0
        )
        const progress = totalExercises > 0
          ? Math.round((completedExercises / totalExercises) * 100)
          : 0

        return {
          languageId: language.id,
          languageName: language.name,
          totalExercises,
          completedExercises,
          progress
        }
      })
    })

    return NextResponse.json(languagesProgress)

  } catch (error) {
    console.error('Erro ao buscar progresso por idioma:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar progresso por idioma' },
      { status: 500 }
    )
  }
} 