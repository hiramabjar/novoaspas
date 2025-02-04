'use client'

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, BlobProvider } from '@react-pdf/renderer'
import type { Exercise } from '@/types/exercise'
import { ExercisePDF } from './ExercisePDF'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center'
  },
  content: {
    fontSize: 12,
    marginBottom: 20,
    lineHeight: 1.5
  },
  questionSection: {
    marginTop: 20
  },
  question: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  option: {
    fontSize: 12,
    marginBottom: 5,
    marginLeft: 20
  }
})

const ExercisePDFDocument = ({ exercise }: { exercise: Exercise }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{exercise.title}</Text>
      
      {/* Texto do exercício */}
      <View style={styles.content}>
        <Text>{exercise.content}</Text>
      </View>

      {/* Questões */}
      <View style={styles.questionSection}>
        <Text style={{ fontSize: 16, marginBottom: 10, fontWeight: 'bold' }}>Questões:</Text>
        {exercise.questions.map((question, index) => (
          <View key={question.id} style={{ marginBottom: 15 }}>
            <Text style={styles.question}>
              {index + 1}. {question.question}
            </Text>
            {JSON.parse(question.options as string).map((option: string, optIndex: number) => (
              <Text key={optIndex} style={styles.option}>
                {String.fromCharCode(97 + optIndex)}) {option}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </Page>
  </Document>
)

interface BlobProviderRenderProps {
  blob: Blob | null
  url: string | null
  loading: boolean
  error: Error | null
}

interface ExercisePDFClientProps {
  exercise: Exercise
}

export function ExercisePDFClient({ exercise }: ExercisePDFClientProps) {
  if (!exercise.questions || exercise.questions.length === 0) {
    return null
  }

  return (
    <BlobProvider document={<ExercisePDF exercise={exercise} />}>
      {({ blob, url, loading, error }: BlobProviderRenderProps) => (
        loading ? (
          <button
            disabled
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Gerando PDF...
          </button>
        ) : (
          <a
            href={url || '#'}
            download={`exercicio-${exercise.id}.pdf`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Baixar PDF
          </a>
        )
      )}
    </BlobProvider>
  )
} 