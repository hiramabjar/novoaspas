import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { textToSpeech } from '@/lib/text-to-speech'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { text, language } = await request.json()

    if (!text || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const audioBase64 = await textToSpeech(text, language as "en" | "es" | "fr" | "de" | "it" | "pt")

    return NextResponse.json({ audio: audioBase64 })
  } catch (error) {
    console.error('Error generating audio:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 