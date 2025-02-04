import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { ExercisePDFDownload } from './ExercisePDF'
import type { ExerciseWithRelations } from '@/types/exercise'

interface DownloadPdfButtonProps {
  exercise: ExerciseWithRelations
}

export function DownloadPdfButton({ exercise }: DownloadPdfButtonProps) {
  return (
    <div className="flex justify-end">
      <ExercisePDFDownload exercise={exercise} />
    </div>
  )
} 