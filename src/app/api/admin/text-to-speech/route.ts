import { NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Processar o FormData
    const formData = await request.formData()
    const audioFile = formData.get('audio') as Blob
    const exerciseId = formData.get('exerciseId') as string

    if (!audioFile || !exerciseId) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // Verificar se o exercício existe
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    })

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercício não encontrado' },
        { status: 404 }
      )
    }

    try {
      // Converter o Blob para ArrayBuffer
      const audioBuffer = await audioFile.arrayBuffer()
      const audioData = new Uint8Array(audioBuffer)

      // Atualizar o exercício com o áudio
      await prisma.exercise.update({
        where: { id: exerciseId },
        data: { 
          audioData,
          voiceId: 'system'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Áudio salvo com sucesso',
        audioUrl: `/api/exercises/${exerciseId}/audio`
      })

    } catch (dbError) {
      console.error('Erro ao salvar no banco:', dbError)
      return NextResponse.json({
        error: 'Erro ao salvar áudio no banco de dados',
        details: dbError instanceof Error ? dbError.message : 'Erro desconhecido'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json({
      error: 'Erro ao processar áudio',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 