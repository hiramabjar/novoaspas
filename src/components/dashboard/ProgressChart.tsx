'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ExerciseProgressData } from '@/types/exercise'

interface ProgressChartProps {
  progress: ExerciseProgressData[]
}

interface ChartData {
  date: string
  score: number
}

export function ProgressChart({ progress }: ProgressChartProps) {
  const data: ChartData[] = progress.map((item) => ({
    date: new Date(item.startedAt).toLocaleDateString(),
    score: item.score || 0
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 