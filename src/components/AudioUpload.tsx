'use client'

import { useState } from 'react'

export interface AudioUploadProps {
  onUpload: (url: string) => void
}

export function AudioUpload({ onUpload }: AudioUploadProps) {
  const [audioPreview, setAudioPreview] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Simular upload do arquivo e retornar uma URL
        const url = URL.createObjectURL(file)
        setAudioPreview(url)
        onUpload(url)
      } catch (error) {
        console.error('Erro ao fazer upload do áudio:', error)
      }
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {audioPreview && (
        <audio controls className="mt-2 w-full">
          <source src={audioPreview} type="audio/mpeg" />
          Seu navegador não suporta o elemento de áudio.
        </audio>
      )}
    </div>
  )
} 