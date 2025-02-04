import { useState, useRef } from 'react'

export function AudioPlayer({ url }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (playing) {
      audioRef.current?.pause()
    } else {
      audioRef.current?.play()
    }
    setPlaying(!playing)
  }

  return (
    <div className="flex items-center gap-4">
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} />
      <Button onClick={togglePlay}>
        {playing ? 'Pausar' : 'Ouvir'}
      </Button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        onChange={(e) => {
          if (audioRef.current) {
            audioRef.current.volume = parseFloat(e.target.value)
          }
        }}
        className="w-24"
      />
    </div>
  )
} 