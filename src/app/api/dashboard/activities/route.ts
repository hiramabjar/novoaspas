import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/features/auth/authOptions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const activities = await prisma.exerciseProgress.findMany({
      where: session.user.role === 'admin' 
        ? undefined 
        : { userId: session.user.id },
      take: 10,
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        exercise: {
          select: {
            title: true
          }
        }
      }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Erro ao obter atividades:', error)
    return NextResponse.json(
      { error: 'Erro ao obter atividades' },
      { status: 500 }
    )
  }
} 