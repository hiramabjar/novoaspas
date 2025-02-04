import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function testAudioUpload() {
  try {
    // Caminho absoluto para o arquivo de áudio
    const audioPath = path.join(__dirname, '..', '..', 'public', 'audio', 'test-audio.mp3')
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(audioPath)) {
      console.error('Arquivo de áudio não encontrado:', audioPath)
      return
    }

    console.log('Lendo arquivo de áudio:', audioPath)
    const audioData = fs.readFileSync(audioPath)
    console.log('Tamanho do arquivo:', audioData.length, 'bytes')

    // Atualizar exercício existente com áudio
    const updatedExercise = await prisma.exercise.update({
      where: {
        id: 'cm6k1u7qt00014yfcy1t5yqv4'
      },
      data: {
        audioData: audioData
      }
    })

    console.log('Áudio atualizado com sucesso:', updatedExercise.id)

    // Verificar se o áudio foi salvo
    const checkExercise = await prisma.exercise.findUnique({
      where: {
        id: 'cm6k1u7qt00014yfcy1t5yqv4'
      },
      select: {
        audioData: true
      }
    })

    if (checkExercise?.audioData) {
      console.log('Áudio encontrado no banco de dados')
      console.log('Tamanho do áudio:', checkExercise.audioData.length, 'bytes')
    } else {
      console.log('Áudio não encontrado no banco de dados')
    }

  } catch (error) {
    console.error('Erro no teste de áudio:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o teste
testAudioUpload() 