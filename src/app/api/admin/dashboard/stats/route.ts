import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Language, Level, Prisma } from '@prisma/client'
import prisma from '@/lib/database/prisma'
import { authOptions } from '@/lib/auth/auth-options'

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar total de alunos (usuários com role 'student')
    const totalStudents = await prisma.user.count({
      where: { role: 'student' }
    })

    // Buscar total de exercícios
    const totalExercises = await prisma.exercise.count()

    // Buscar total de exercícios completados (status COMPLETED)
    const totalCompletedExercises = await prisma.exerciseProgress.count({
      where: { status: 'COMPLETED' }
    })

    // Buscar exercícios por idioma
    const exercisesByLanguage = await prisma.exercise.groupBy({
      by: ['languageId'],
      _count: {
        id: true
      }
    }) as ExerciseGroupByLanguage[]

    // Buscar nomes dos idiomas
    const languages = await prisma.language.findMany()
    const languageMap = new Map(
      languages.map((l: Language) => [l.id, l.name])
    )

    // Buscar exercícios por nível
    const exercisesByLevel = await prisma.exercise.groupBy({
      by: ['levelId'],
      _count: {
        id: true
      }
    }) as ExerciseGroupByLevel[]

    // Buscar nomes dos níveis
    const levels = await prisma.level.findMany()
    const levelMap = new Map(
      levels.map((l: Level) => [l.id, l.name])
    )

    return NextResponse.json({
      totalStudents,
      totalExercises,
      totalCompletedExercises,
      exercisesByLanguage: exercisesByLanguage.map((item: ExerciseGroupByLanguage) => ({
        languageId: item.languageId,
        languageName: languageMap.get(item.languageId) || item.languageId,
        count: item._count.id
      })),
      exercisesByLevel: exercisesByLevel.map((item: ExerciseGroupByLevel) => ({
        levelId: item.levelId,
        levelName: levelMap.get(item.levelId) || item.levelId,
        count: item._count.id
      }))
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
} 