import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const questions = await prisma.question.findMany({
      where: { exerciseId: String(params.id) },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ questions })

  } catch (error) {
    console.error('Erro ao buscar questões:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar questões' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Excluir questões antigas
    await prisma.question.deleteMany({
      where: { exerciseId: String(params.id) }
    })

    // Criar novas questões
    const questions = await Promise.all(
      data.questions.map((q: any) =>
        prisma.question.create({
          data: {
            exerciseId: String(params.id),
            question: q.question,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer
          }
        })
      )
    )

    return NextResponse.json({ 
      success: true,
      questions 
    })

  } catch (error) {
    console.error('Erro ao atualizar questões:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao atualizar questões',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 