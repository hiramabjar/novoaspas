'use client'

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, BlobProvider } from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import type { ExerciseWithRelations } from '@/types/exercise'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30
  },
  section: {
    marginBottom: 10
  },
  title: {
    fontSize: 18,
    marginBottom: 10
  },
  description: {
    fontSize: 12,
    marginBottom: 20
  },
  content: {
    fontSize: 12,
    marginBottom: 20,
    lineHeight: 1.5
  },
  question: {
    fontSize: 12,
    marginBottom: 10
  },
  option: {
    fontSize: 12,
    marginLeft: 20,
    marginBottom: 5
  }
})

interface ExercisePDFProps {
  exercise: ExerciseWithRelations
}

export function ExercisePDF({ exercise }: ExercisePDFProps) {
  if (!exercise.questions) {
    return null
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>{exercise.title}</Text>
          <Text style={styles.description}>{exercise.description}</Text>
          <Text style={styles.content}>{exercise.content}</Text>
        </View>

        <View style={styles.section}>
          {exercise.questions.map((question, index) => {
            const options = question.options ? question.options.split(',') : []
            return (
              <View key={question.id} style={styles.section}>
                <Text style={styles.question}>
                  {index + 1}. {question.question}
                </Text>
                {options.map((option, optionIndex) => (
                  <Text key={optionIndex} style={styles.option}>
                    {String.fromCharCode(97 + optionIndex)}. {option}
                  </Text>
                ))}
              </View>
            )
          })}
        </View>
      </Page>
    </Document>
  )
}

interface ExercisePDFDownloadProps {
  exercise: ExerciseWithRelations | null
}

export function ExercisePDFDownload({ exercise }: ExercisePDFDownloadProps) {
  if (!exercise) return null

  return (
    <BlobProvider document={<ExercisePDF exercise={exercise} />}>
      {({ url, loading }) => (
        <a
          href={url || '#'}
          download={`exercicio-${exercise.title.toLowerCase().replace(/\s+/g, '-')}.pdf`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          style={{ pointerEvents: loading ? 'none' : 'auto' }}
        >
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Gerando PDF...' : 'Baixar PDF'}
        </a>
      )}
    </BlobProvider>
  )
} 