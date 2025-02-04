'use client'

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'
import type { Exercise } from '@/types/exercise'

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

export function ExercisePDFDownload({ exercise }: { exercise: Exercise }) {
  return (
    <PDFDownloadLink
      document={<ExercisePDFDocument exercise={exercise} />}
      fileName={`exercicio-${exercise.title.toLowerCase().replace(/\s+/g, '-')}.pdf`}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      {({ loading }) =>
        loading ? 'Gerando PDF...' : (
          <>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Baixar PDF
          </>
        )
      }
    </PDFDownloadLink>
  )
} 