'use client'

import { BarChart2, Download } from 'lucide-react'

export default function ReportsPage() {
  const reports = [
    { 
      title: 'Desempenho dos Alunos',
      description: 'Relatório detalhado do progresso dos alunos',
      lastGenerated: '2024-01-30'
    },
    { 
      title: 'Exercícios Mais Realizados',
      description: 'Análise dos exercícios mais populares',
      lastGenerated: '2024-01-29'
    }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>

      <div className="grid gap-6">
        {reports.map((report) => (
          <div 
            key={report.title} 
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <BarChart2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {report.description}
                  </p>
                </div>
              </div>
              <button className="btn-primary flex items-center gap-2">
                <Download className="w-4 h-4" />
                Baixar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 