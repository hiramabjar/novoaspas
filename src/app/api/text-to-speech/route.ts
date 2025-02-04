import { NextResponse } from 'next/server'
import { textToSpeech } from '@/lib/services/textToSpeech'

export async function POST(req: Request) {
  try {
    const { text, language } = await req.json()

    if (!text || !language) {
      return NextResponse.json(
        { error: 'Texto e idioma são obrigatórios' },
        { status: 400 }
      )
    }

    const audioBase64 = await textToSpeech(text, language)
    return NextResponse.json({ audioUrl: audioBase64 })
  } catch (error) {
    console.error('Erro na conversão de texto para áudio:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar áudio' },
      { status: 500 }
    )
  }
} 