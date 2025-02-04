type DecodeSuccessCallback = (decodedData: AudioBuffer) => void
type DecodeErrorCallback = (error: DOMException) => void

interface AudioContext extends BaseAudioContext {
  decodeAudioData(
    audioData: ArrayBuffer,
    successCallback?: DecodeSuccessCallback,
    errorCallback?: DecodeErrorCallback
  ): Promise<AudioBuffer>
  createMediaStreamDestination(): MediaStreamAudioDestinationNode
  close(): Promise<void>
}

declare global {
  interface Window {
    AudioContext: {
      new (): AudioContext
    }
    webkitAudioContext: {
      new (): AudioContext
    }
  }
}

export async function decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer> {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const audioContext = new AudioContext()
  
  try {
    const audioBuffer = await audioContext.decodeAudioData(audioData)
    return audioBuffer
  } catch (error) {
    console.error('Error decoding audio data:', error)
    throw new Error('Failed to decode audio data')
  } finally {
    if (audioContext.state !== 'closed') {
      await audioContext.close()
    }
  }
}

export async function generateSpeech(utterance: SpeechSynthesisUtterance): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    const audioContext = new AudioContext()
    const destination = audioContext.createMediaStreamDestination()
    const mediaRecorder = new MediaRecorder(destination.stream)
    const audioChunks: BlobPart[] = []

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' })
        const arrayBuffer = await audioBlob.arrayBuffer()
        await audioContext.close()
        resolve(arrayBuffer)
      } catch (error) {
        reject(error)
      }
    }

    mediaRecorder.start()

    utterance.onend = () => {
      mediaRecorder.stop()
    }
    
    utterance.onerror = (error) => {
      audioContext.close().catch(console.error)
      reject(error)
    }

    window.speechSynthesis.speak(utterance)
  })
} 