import axios from 'axios'

export async function generateAudioFromText(text: string, language: string) {
  const response = await axios.post('/api/tts', {
    text,
    language,
    voice: language === 'EN' ? 'Joanna' : 'Lupe' // Vozes específicas por idioma
  })
  
  return response.data.audioUrl
} 