import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
export const dynamic = "force-dynamic";


export async function DELETE(
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

    const id = await Promise.resolve(params.id)

    // Primeiro excluir todas as questões relacionadas
    await prisma.question.deleteMany({
      where: { exerciseId: id }
    })

    // Depois excluir o progresso dos alunos neste exercício
    await prisma.exerciseProgress.deleteMany({
      where: { exerciseId: id }
    })

    // Por fim, excluir o exercício
    await prisma.exercise.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Exercício excluído com sucesso' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao excluir exercício:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir exercício' },
      { status: 500 }
    )
  }
}

// Rota GET para buscar um exercício específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado - Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { id } = params
    const exerciseId = id

    // Verificar se o usuário é aluno e tem acesso ao exercício
    if (session.user.role === 'student') {
      const studentProfile = await prisma.studentProfile.findFirst({
        where: { 
          userId: session.user.id 
        },
        include: {
          enrollments: {
            include: {
              language: true,
              level: true
            }
          }
        }
      })

      if (!studentProfile) {
        return NextResponse.json(
          { error: 'Perfil de aluno não encontrado' },
          { status: 404 }
        )
      }

      const exercise = await prisma.exercise.findUnique({
        where: { 
          id: exerciseId
        },
        include: {
          module: true,
          language: true,
          level: true,
          questions: {
            select: {
              id: true,
              question: true,
              options: true,
              correctAnswer: true
            }
          }
        }
      })

      if (!exercise) {
        return NextResponse.json(
          { error: 'Exercício não encontrado' },
          { status: 404 }
        )
      }

      // Verificar se o aluno está matriculado no idioma do exercício
      const hasAccess = studentProfile.enrollments.some(
        enrollment => enrollment.languageId === exercise.languageId
      )

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Aluno não está matriculado neste idioma' },
          { status: 403 }
        )
      }

      return NextResponse.json({ exercise })
    }

    // Se for admin, retorna normalmente
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        module: true,
        language: true,
        level: true,
        questions: {
          select: {
            id: true,
            question: true,
            options: true,
            correctAnswer: true
          }
        }
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
      { 
        error: 'Erro ao buscar exercício',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
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
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const { id } = params

    // Atualizar exercício e questões em uma transação
    const exercise = await prisma.$transaction(async (tx) => {
      // Primeiro deletar questões existentes
      await tx.question.deleteMany({
        where: { exerciseId: id }
      })

      // Depois atualizar o exercício e criar novas questões
      return tx.exercise.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          content: data.content,
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
    })

    return NextResponse.json({ exercise })

  } catch (error) {
    console.error('Erro ao atualizar exercício:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar exercício: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    )
  }
} 