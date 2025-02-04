import { useMutation } from '@tanstack/react-query'
import { textToSpeech } from '@/lib/text-to-speech'

export const useAudioGeneration = () => {
  return useMutation({
    mutationFn: async (payload: { text: string; language: string }) => {
      const response = await fetch('/api/tts', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) throw new Error('Generation failed')
      return response.json()
    },
    onError: (error) => {
      console.error('Audio generation error:', error)
    }
  })
} 