import { NextResponse } from 'next/server'
import AWS from 'aws-sdk'

export async function POST(request: Request) {
  const { text, language } = await request.json()
  
  // Configurar AWS Polly
  const polly = new AWS.Polly({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: 'us-east-1'
  })
  
  const params = {
    OutputFormat: 'mp3',
    Text: text,
    VoiceId: getVoiceId(language),
    Engine: 'neural'
  }

  try {
    const data = await polly.synthesizeSpeech(params).promise()
    // Upload para S3 e retornar URL
    return NextResponse.json({ audioUrl: generatedUrl })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    )
  }
}

function getVoiceId(language: string) {
  const voices: Record<string, string> = {
    EN: 'Joanna',
    ES: 'Lupe',
    FR: 'Lea',
    DE: 'Vicki',
    IT: 'Bianca'
  }
  return voices[language] || 'Joanna'
} 