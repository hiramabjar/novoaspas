import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/database/prisma'
import { authOptions } from '@/lib/auth/auth-options'

export const dynamic = "force-dynamic"; // Forçar a rota a ser dinâmica

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

    // Corrigir aqui: usar await para params
    const { id } = await params

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        module: true,
        language: true,
        level: true,
        questions: true
      }
    })

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercício não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ exercise })
    
  } catch (error) {
    console.error('Erro ao buscar exercício:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar exercício' },
      { status: 500 }
    )
  }
}