import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ProgressData {
  totalExercises: number
  completedExercises: number
  averageScore: number
  streak: number
}

interface ChartDataPoint {
  date: string
  score: number
}

export function ProgressChart({ progress }: { progress: ProgressData }) {
  const chartData: ChartDataPoint[] = [
    { date: 'Total', score: progress.totalExercises },
    { date: 'Completed', score: progress.completedExercises },
    { date: 'Average', score: progress.averageScore },
    { date: 'Streak', score: progress.streak }
  ]

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#2563eb" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 