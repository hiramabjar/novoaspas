import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { AudioPlayer } from './AudioPlayer'
import { Play, Pause, RotateCcw, Volume2, Volume1, VolumeX, FastForward } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { DownloadPdfButton } from './DownloadPdfButton'
import type { Exercise } from '@/types/exercise'

interface DictationExerciseProps {
  exercise: Exercise
  onSubmit: (answers: Array<{ questionId: string; answer: string }>) => void
}

export function DictationExercise({ exercise, onSubmit }: DictationExerciseProps) {
  const { toast } = useToast()
  const [answers, setAnswers] = useState<string[]>(Array(exercise.questions.length).fill(''))
  const [showResults, setShowResults] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (!exercise.audioUrl) {
      // Configurar a síntese de voz como fallback
      utteranceRef.current = new SpeechSynthesisUtterance(exercise.content)
      utteranceRef.current.lang = exercise.language.code
      utteranceRef.current.rate = playbackRate
      utteranceRef.current.volume = volume
      
      return () => {
        if (utteranceRef.current) {
          speechSynthesis.cancel()
        }
      }
    }
  }, [exercise.content, exercise.language.code, exercise.audioUrl, playbackRate, volume])

  const playAudio = () => {
    if (!utteranceRef.current) return

    if (isPlaying) {
      speechSynthesis.cancel()
      setIsPlaying(false)
    } else {
      utteranceRef.current.onend = () => setIsPlaying(false)
      speechSynthesis.speak(utteranceRef.current)
      setIsPlaying(true)
    }
  }

  const restartAudio = () => {
    if (utteranceRef.current) {
      speechSynthesis.cancel()
      setIsPlaying(false)
      setCurrentTime(0)
      setTimeout(() => {
        speechSynthesis.speak(utteranceRef.current!)
        setIsPlaying(true)
      }, 100)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (utteranceRef.current) {
      utteranceRef.current.volume = newVolume
    }
  }

  const handlePlaybackRateChange = (newRate: number) => {
    setPlaybackRate(newRate)
    if (utteranceRef.current) {
      utteranceRef.current.rate = newRate
    }
  }

  const handleSubmit = () => {
    if (answers.some(answer => !answer)) {
      toast({
        title: "Atenção",
        description: "Por favor, responda todas as questões antes de enviar.",
        variant: "destructive"
      })
      return
    }

    // Criar array de respostas no formato esperado
    const formattedAnswers = exercise.questions.map((question, index) => ({
      questionId: question.id,
      answer: answers[index]
    }))

    // Enviar respostas para pontuação
    try {
      onSubmit(formattedAnswers)
      setShowResults(true)
      toast({
        title: "Sucesso",
        description: "Respostas enviadas com sucesso!",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar respostas. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-2">Exercício de Ditado</h2>
            <p className="text-gray-600">{exercise.description}</p>
          </div>
          <DownloadPdfButton
            title={exercise.title}
            content={exercise.content}
            description={exercise.description}
          />
        </div>

        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            {exercise.audioUrl ? (
              <AudioPlayer 
                audioUrl={exercise.audioUrl}
                onPlaybackRateChange={handlePlaybackRateChange}
                onVolumeChange={handleVolumeChange}
                className="bg-white shadow-sm"
              />
            ) : (
              <Card className="p-4">
                <div className="space-y-4">
                  {/* Controles principais */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={playAudio}
                      className="w-10 h-10"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={restartAudio}
                      className="w-10 h-10"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Controles de volume e velocidade */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 flex-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => handleVolumeChange(volume === 0 ? 1 : 0)}
                      >
                        {volume === 0 ? <VolumeX className="h-4 w-4" /> : 
                         volume < 0.5 ? <Volume1 className="h-4 w-4" /> : 
                         <Volume2 className="h-4 w-4" />}
                      </Button>
                      <Slider
                        value={[volume]}
                        onValueChange={(value) => handleVolumeChange(value[0])}
                        max={1}
                        step={0.1}
                        className="w-24"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <FastForward className="h-4 w-4 text-gray-500" />
                      <Slider
                        value={[playbackRate]}
                        onValueChange={(value) => handlePlaybackRateChange(value[0])}
                        min={0.5}
                        max={2}
                        step={0.25}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-500 w-12">
                        {playbackRate}x
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {exercise.questions.map((question, index) => (
            <div key={question.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {index + 1}. Digite o que você ouviu:
              </label>
              <Input
                value={answers[index]}
                onChange={(e) => {
                  const newAnswers = [...answers]
                  newAnswers[index] = e.target.value
                  setAnswers(newAnswers)
                }}
                placeholder="Digite sua resposta aqui..."
                className="w-full"
              />
              {showResults && (
                <p className={`text-sm ${
                  answers[index].toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {answers[index].toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
                    ? '✓ Resposta correta!'
                    : `✗ Resposta incorreta. A resposta correta é: ${question.correctAnswer}`}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {!showResults && (
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Enviar Respostas
          </Button>
        </div>
      )}
    </div>
  )
} 