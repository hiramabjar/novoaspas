import type { AxiosResponse } from 'axios'
import api from './api'

type LanguageCode = 'en-US' | 'pt-BR'

interface GenerateAudioResponse {
  audioContent: string
}

export async function generateAudio(text: string, language: LanguageCode = 'pt-BR'): Promise<string> {
  const response: AxiosResponse<GenerateAudioResponse> = await api.post('/text-to-speech', {
    text,
    language,
  })

  return response.data.audioContent
} 