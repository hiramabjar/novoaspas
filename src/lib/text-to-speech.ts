const LANGUAGE_VOICES = {
  'en': 'en-US',
  'es': 'es-ES',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'it': 'it-IT',
  'pt': 'pt-BR'
}

export async function textToSpeech(text: string, language: string = 'en'): Promise<Buffer> {
  try {
    // Normalizar o código do idioma
    const langCode = language.toLowerCase().split('-')[0]
    const voiceLocale = LANGUAGE_VOICES[langCode] || 'en-US'

    // Dividir o texto em partes menores
    const maxLength = 150
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    const audioBuffers: Buffer[] = []

    for (const sentence of sentences) {
      if (!sentence.trim()) continue

      try {
        const response = await fetch(
          `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
            sentence.trim().substring(0, maxLength)
          )}&tl=${voiceLocale}&client=tw-ob`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Referer': 'https://translate.google.com/',
            },
          }
        )

        if (!response.ok) {
          console.error(`Erro na parte do texto: ${sentence}`)
          continue
        }

        const arrayBuffer = await response.arrayBuffer()
        if (arrayBuffer.byteLength > 0) {
          audioBuffers.push(Buffer.from(arrayBuffer))
        }

        // Pequeno delay entre requisições
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        console.error(`Erro ao processar sentença: ${sentence}`, error)
      }
    }

    if (audioBuffers.length === 0) {
      throw new Error(`Não foi possível gerar áudio para o texto no idioma ${language}`)
    }

    return Buffer.concat(audioBuffers)
  } catch (error) {
    console.error('Erro ao converter texto em áudio:', error)
    throw error
  }
} 