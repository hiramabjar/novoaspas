import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { AudioPlayer } from './AudioPlayer'
import { Play, Pause, RotateCcw, Volume2, Volume1, VolumeX, FastForward } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { DownloadPdfButton } from './DownloadPdfButton'
import type { ExerciseWithRelations } from '@/types/exercise'

interface DictationExerciseProps {
  exercise: ExerciseWithRelations
  onComplete: (score: number, answers: Record<string, string>) => Promise<void>
}

export function DictationExercise({ exercise, onComplete }: DictationExerciseProps) {
  const { toast } = useToast()
  const [answers, setAnswers] = useState<string[]>(
    Array(exercise.questions?.length || 0).fill('')
  )
  const [showResults, setShowResults] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (!exercise.audioUrl) {
      utteranceRef.current = new SpeechSynthesisUtterance(exercise.content)
      if (exercise.language?.code) {
        utteranceRef.current.lang = exercise.language.code
      }
      utteranceRef.current.rate = playbackRate
      utteranceRef.current.volume = volume
    }

    return () => {
      if (utteranceRef.current) {
        speechSynthesis.cancel()
      }
    }
  }, [exercise.content, exercise.language?.code, exercise.audioUrl, playbackRate, volume])

  const togglePlay = () => {
    if (exercise.audioUrl) {
      const audio = document.querySelector('audio')
      if (audio) {
        if (isPlaying) {
          audio.pause()
        } else {
          audio.play()
        }
        setIsPlaying(!isPlaying)
      }
    } else {
      if (isPlaying) {
        speechSynthesis.cancel()
      } else if (utteranceRef.current) {
        speechSynthesis.speak(utteranceRef.current)
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers]
    newAnswers[index] = value
    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    if (!exercise.questions) return

    const formattedAnswers = exercise.questions.map((question, index) => ({
      questionId: question.id,
      answer: answers[index]
    }))

    let score = 0
    const answersMap: Record<string, string> = {}

    exercise.questions.forEach((question, index) => {
      const userAnswer = answers[index].toLowerCase().trim()
      const correctAnswer = question.correctAnswer.toLowerCase().trim()
      answersMap[question.id] = userAnswer

      if (userAnswer === correctAnswer) {
        score++
      }
    })

    const finalScore = Math.round((score / exercise.questions.length) * 100)
    await onComplete(finalScore, answersMap)
  }

  if (!exercise.questions) {
    return <div>No questions available</div>
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{exercise.title}</h2>
          <p className="text-gray-600">{exercise.description}</p>

          {exercise.audioUrl ? (
            <audio
              src={exercise.audioUrl}
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            <div className="space-y-4">
              <Button onClick={togglePlay}>
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Speed: {playbackRate}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Volume: {Math.round(volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        {exercise.questions.map((question, index) => (
          <Card key={question.id} className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Question {index + 1}: {question.question}
              </h3>
              <Input
                type="text"
                value={answers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder="Type your answer here"
              />
            </div>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={answers.some(answer => !answer)}
        className="w-full"
      >
        Submit
      </Button>
    </div>
  )
} 