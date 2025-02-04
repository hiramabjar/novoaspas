import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { authOptions } from '@/lib/auth/auth-options'
import { textToSpeech } from '@/lib/text-to-speech'
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Criar ou buscar o módulo padrão
    const defaultModule = await prisma.module.findFirst({
      where: { name: 'Reading Exercises' }
    }) || await prisma.module.create({
      data: {
        name: 'Reading Exercises',
        description: 'Módulo padrão para exercícios de leitura',
        order: 1
      }
    })

    // Criar exercício com todas as relações
    const exercise = await prisma.exercise.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        type: data.type || 'READING',
        moduleId: defaultModule.id,
        languageId: data.languageId,
        levelId: data.levelId,
        questions: {
          create: data.questions.map((q: any) => ({
            question: q.question,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer
          }))
        }
      },
      include: {
        module: true,
        language: true,
        level: true,
        questions: true
      }
    })

    return NextResponse.json({ exercise }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar exercício:', error)
    return NextResponse.json(
      { error: 'Erro ao criar exercício: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Não autorizado' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const data = await request.json()
    
    const exercise = await prisma.exercise.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        type: data.type,
        languageId: data.languageId,
        levelId: data.levelId
      },
      include: {
        module: true,
        language: true,
        level: true
      }
    })

    return new NextResponse(
      JSON.stringify({ exercise }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erro ao atualizar exercício:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Erro ao atualizar exercício',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany({
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

    return new NextResponse(
      JSON.stringify({ exercises }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Erro ao buscar exercícios:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Erro ao buscar exercícios',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 