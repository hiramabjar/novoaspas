'use client'

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import type { Exercise } from '@/types/exercise'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center'
  },
  description: {
    marginBottom: 20
  },
  content: {
    marginBottom: 30,
    lineHeight: 1.5
  },
  question: {
    marginBottom: 15
  },
  questionText: {
    marginBottom: 10,
    fontWeight: 'bold'
  },
  option: {
    marginBottom: 5,
    paddingLeft: 10
  }
})

function ExercisePDF({ exercise }: { exercise: Exercise }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.title}>{exercise.title}</Text>
          <Text style={styles.description}>{exercise.description}</Text>
          <Text style={styles.content}>{exercise.content}</Text>

          {exercise.questions.map((question, index) => {
            const options = JSON.parse(question.options as string)
            return (
              <View key={question.id} style={styles.question}>
                <Text style={styles.questionText}>
                  {index + 1}. {question.question}
                </Text>
                {options.map((option: string, optIndex: number) => (
                  <Text key={optIndex} style={styles.option}>
                    {String.fromCharCode(97 + optIndex)}) {option}
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

export function ExercisePDFDownload({ exercise }: { exercise: Exercise | null }) {
  if (!exercise) return null

  return (
    <PDFDownloadLink
      document={<ExercisePDF exercise={exercise} />}
      fileName={`exercicio-${exercise.title.toLowerCase().replace(/\s+/g, '-')}.pdf`}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      {({ loading }) => (
        <>
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Gerando PDF...' : 'Baixar PDF'}
        </>
      )}
    </PDFDownloadLink>
  )
} 