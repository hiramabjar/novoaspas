import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'
import jsPDF from 'jspdf'

interface DownloadPdfButtonProps {
  title: string
  content: string
  description?: string
  className?: string
}

export function DownloadPdfButton({ 
  title, 
  content, 
  description, 
  className = '' 
}: DownloadPdfButtonProps) {
  const handleDownload = () => {
    const pdf = new jsPDF()
    
    // Configurar fonte para suportar caracteres especiais
    pdf.setFont("helvetica")
    
    // Adicionar título
    pdf.setFontSize(16)
    pdf.text(title, 20, 20)
    
    // Adicionar descrição se existir
    if (description) {
      pdf.setFontSize(12)
      pdf.text(description, 20, 30)
    }
    
    // Adicionar conteúdo principal
    pdf.setFontSize(12)
    const splitContent = pdf.splitTextToSize(content, 170) // Quebrar texto em linhas
    pdf.text(splitContent, 20, description ? 40 : 30)
    
    // Salvar o PDF
    pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`)
  }

  return (
    <Tooltip content="Baixar conteúdo em PDF">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDownload}
        className={`hover:bg-gray-100 ${className}`}
      >
        <FileDown className="h-4 w-4" />
      </Button>
    </Tooltip>
  )
} 