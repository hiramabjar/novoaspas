import type { AxiosResponse } from 'axios'
import api from '@/lib/api'

interface GenerateAudioResponse {
  audioUrl: string
  voiceId: string
}

type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt'

export async function generateAudio(text: string, language: LanguageCode): Promise<GenerateAudioResponse> {
  try {
    const response: AxiosResponse<GenerateAudioResponse> = await api.post('/api/text-to-speech', {
      text,
      language
    })

    return response.data
  } catch (error) {
    console.error('Error generating audio:', error)
    throw new Error('Failed to generate audio')
  }
} 