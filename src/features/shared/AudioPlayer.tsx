import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface AudioPlayerProps {
  url: string
}

export function AudioPlayer({ url }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <audio ref={audioRef} src={url} />
      <Button onClick={togglePlay} variant="outline">
        {isPlaying ? 'Pause' : 'Play'}
      </Button>
    </div>
  )
} 