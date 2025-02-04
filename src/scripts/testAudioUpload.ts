import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface AudioData {
  buffer: Buffer
  mimeType: string
}

async function testAudioUpload() {
  try {
    // Read audio file
    const audioPath = path.join(process.cwd(), 'public', 'audio', 'test.mp3')
    const audioBuffer = fs.readFileSync(audioPath)
    
    const audioData: AudioData = {
      buffer: audioBuffer,
      mimeType: 'audio/mpeg'
    }

    // Create exercise with audio
    const exercise = await prisma.exercise.create({
      data: {
        title: 'Test Audio Exercise',
        description: 'Testing audio upload functionality',
        content: 'Listen to the audio and answer the questions',
        type: 'listening',
        audioUrl: '/audio/test.mp3',
        languageId: 'your-language-id', // Replace with actual ID
        levelId: 'your-level-id', // Replace with actual ID
      }
    })

    console.log('Exercise created successfully:', exercise.id)
  } catch (error) {
    console.error('Error testing audio upload:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAudioUpload() 