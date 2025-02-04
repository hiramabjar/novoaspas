export async function generateSpeech(utterance: SpeechSynthesisUtterance): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const mediaRecorder = new MediaRecorder(audioContext.createMediaStreamDestination().stream)
    const audioChunks: BlobPart[] = []

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' })
      const arrayBuffer = await audioBlob.arrayBuffer()
      resolve(arrayBuffer)
    }

    mediaRecorder.start()

    utterance.onend = () => {
      mediaRecorder.stop()
    }
    utterance.onerror = (error) => {
      reject(error)
    }

    window.speechSynthesis.speak(utterance)
  })
} 