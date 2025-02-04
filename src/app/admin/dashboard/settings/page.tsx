'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoGrading: true,
    language: 'pt-BR'
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Preferências Gerais
            </h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Notificações por Email
                  </label>
                  <p className="text-sm text-gray-500">
                    Receber atualizações sobre atividades dos alunos
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({
                    ...settings,
                    emailNotifications: e.target.checked
                  })}
                  className="h-4 w-4 text-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Correção Automática
                  </label>
                  <p className="text-sm text-gray-500">
                    Habilitar correção automática de exercícios
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoGrading}
                  onChange={(e) => setSettings({
                    ...settings,
                    autoGrading: e.target.checked
                  })}
                  className="h-4 w-4 text-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button className="btn-primary">
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 