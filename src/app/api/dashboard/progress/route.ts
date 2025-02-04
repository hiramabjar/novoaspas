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

    const modules = await prisma.module.findMany({
      include: {
        exercises: {
          include: {
            progress: {
              where: session.user.role === 'admin' 
                ? undefined 
                : { userId: session.user.id }
            }
          }
        }
      }
    })

    const progress = modules.map(module => ({
      name: module.name,
      total: module.exercises.length,
      completed: module.exercises.filter(exercise => 
        exercise.progress.some(p => p.status === 'COMPLETED')
      ).length
    }))

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Erro ao obter progresso:', error)
    return NextResponse.json(
      { error: 'Erro ao obter progresso' },
      { status: 500 }
    )
  }
} 