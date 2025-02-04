import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401 }
      )
    }

    const data = await request.json()
    const { exerciseId, question, options, correctAnswer } = data

    const newQuestion = await prisma.question.create({
      data: {
        exerciseId,
        question,
        options,
        correctAnswer
      }
    })

    return new NextResponse(
      JSON.stringify({ question: newQuestion }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Erro ao criar questão' }),
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
        { status: 401 }
      )
    }

    const data = await request.json()
    const { id, question, options, correctAnswer } = data

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        question,
        options,
        correctAnswer
      }
    })

    return new NextResponse(
      JSON.stringify({ question: updatedQuestion }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Erro ao atualizar questão' }),
      { status: 500 }
    )
  }
} 