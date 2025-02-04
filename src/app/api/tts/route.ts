import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { text, language } = await request.json()
  
  try {
    // Por enquanto, retornamos uma resposta simples
    return NextResponse.json({ 
      message: 'Text-to-speech functionality is currently unavailable'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 