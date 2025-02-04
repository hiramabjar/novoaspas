'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/components/ui/use-toast'
import { AudioPlayer } from './AudioPlayer'
import { Play, Pause, RotateCcw, Volume2, Volume1, VolumeX, FastForward } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { DownloadPdfButton } from './DownloadPdfButton'
import type { ExerciseWithRelations } from '@/types/exercise'

interface ListeningExerciseProps {
  exercise: ExerciseWithRelations
  onComplete: (score: number, answers: Record<string, string>) => Promise<void>
}

export function ListeningExercise({ exercise, onComplete }: ListeningExerciseProps) {
  const { toast } = useToast()
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(
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

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[questionIndex] = answer
    setSelectedAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    if (!exercise.questions) return

    const formattedAnswers = exercise.questions.map((question, index) => ({
      questionId: question.id,
      answer: selectedAnswers[index]
    }))

    let score = 0
    const answers: Record<string, string> = {}

    exercise.questions.forEach((question, index) => {
      const selectedAnswer = selectedAnswers[index]
      answers[question.id] = selectedAnswer

      if (selectedAnswer === question.correctAnswer) {
        score++
      }
    })

    const finalScore = Math.round((score / exercise.questions.length) * 100)
    await onComplete(finalScore, answers)
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
        {exercise.questions.map((question, index) => {
          const options = question.options ? question.options.split(',') : []
          return (
            <Card key={question.id} className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Question {index + 1}: {question.question}
                </h3>
                <div className="space-y-2">
                  {options.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={selectedAnswers[index] === option}
                        onChange={() => handleAnswerSelect(index, option)}
                        className="form-radio"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={selectedAnswers.some(answer => !answer)}
        className="w-full"
      >
        Submit
      </Button>
    </div>
  )
} 