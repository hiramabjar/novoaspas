import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const exercises = await prisma.exercise.findMany({
      include: {
        language: true,
        level: true,
        questions: true,
        module: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('Exercises from DB:', exercises) // Para debug

    return NextResponse.json(exercises)
  } catch (error) {
    console.error('Erro ao buscar exercícios:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar exercícios' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()
    console.log('Creating exercise with data:', data)

    // Verificar se language e level existem
    const language = await prisma.language.findUnique({
      where: { id: data.languageId }
    })
    console.log('Found language:', language)

    const level = await prisma.level.findUnique({
      where: { id: data.levelId }
    })
    console.log('Found level:', level)

    if (!language || !level) {
      console.error('Language or level not found:', { 
        languageId: data.languageId, 
        levelId: data.levelId,
        foundLanguage: language,
        foundLevel: level
      })
      return NextResponse.json(
        { error: 'Idioma ou nível não encontrado' },
        { status: 404 }
      )
    }

    // Determinar o módulo baseado no tipo de exercício
    const moduleId = data.type === 'reading' ? 'reading-module' : 'listening-module'
    console.log('Using moduleId:', moduleId)

    // Verificar se o módulo existe
    const module = await prisma.module.findUnique({
      where: { id: moduleId }
    })
    console.log('Found module:', module)

    if (!module) {
      console.error('Module not found:', moduleId)
      return NextResponse.json(
        { error: 'Módulo não encontrado' },
        { status: 404 }
      )
    }

    const exercise = await prisma.exercise.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        type: data.type,
        moduleId,
        languageId: data.languageId,
        levelId: data.levelId,
        questions: {
          create: data.questions.map(q => ({
            question: q.question,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer
          }))
        }
      },
      include: {
        questions: true,
        module: true,
        language: true,
        level: true
      }
    })

    console.log('Created exercise:', exercise)
    return NextResponse.json(exercise)
  } catch (error) {
    console.error('Erro ao criar exercício:', error)
    return NextResponse.json(
      { error: 'Erro ao criar exercício' },
      { status: 500 }
    )
  }
} 