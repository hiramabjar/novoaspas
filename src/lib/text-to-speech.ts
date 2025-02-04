const LANGUAGE_VOICES = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-BR'
} as const

type LanguageCode = keyof typeof LANGUAGE_VOICES

export async function textToSpeech(text: string, langCode: LanguageCode): Promise<ArrayBuffer> {
  try {
    const voiceLocale = LANGUAGE_VOICES[langCode] || LANGUAGE_VOICES.en
    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, language: voiceLocale }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate speech')
    }

    const audioData = await response.arrayBuffer()
    return audioData
  } catch (error) {
    console.error('Error in text-to-speech:', error)
    throw error
  }
} 