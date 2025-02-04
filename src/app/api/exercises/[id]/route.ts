import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/database/prisma'
import { authOptions } from '@/lib/auth/auth-options'
import { exerciseSchema } from '@/features/exercises/schemas'

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
      include: {
        language: true,
        level: true,
        questions: true
      }
    })

    console.log('Exercise from DB:', exercise)

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercício não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(exercise)
  } catch (error) {
    console.error('Erro ao buscar exercício:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar exercício' },
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
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()

    const exercise = await prisma.exercise.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        languageId: data.languageId,
        levelId: data.levelId,
      }
    })

    return NextResponse.json(exercise)
  } catch (error) {
    console.error('Erro ao atualizar exercício:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar exercício' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Primeiro, verificar se o exercício existe
    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id }
    })

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercício não encontrado' },
        { status: 404 }
      )
    }

    // Deletar o exercício e suas questões (cascade delete configurado no schema)
    await prisma.exercise.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar exercício:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar exercício' },
      { status: 500 }
    )
  }
} 