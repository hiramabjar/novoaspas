'use client'

interface ExerciseCreatedFeedbackProps {
  exerciseId: string
  title: string
  hasAudio: boolean
  onClose: () => void
}

export function ExerciseCreatedFeedback({ 
  exerciseId, 
  title, 
  hasAudio, 
  onClose 
}: ExerciseCreatedFeedbackProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Exercício Criado com Sucesso!</h2>
        <p className="mb-4">O exercício "{title}" foi criado com sucesso.</p>
        
        {hasAudio ? (
          <div className="mb-4">
            <p className="mb-2 font-medium">Teste o áudio gerado:</p>
            <audio controls className="w-full">
              <source src={`/api/exercises/${exerciseId}/audio`} type="audio/mpeg" />
              Seu navegador não suporta o elemento de áudio.
            </audio>
          </div>
        ) : (
          <p className="text-yellow-600 mb-4">
            Atenção: Não foi possível gerar o áudio para este exercício.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
} 