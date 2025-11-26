'use client'

import { DocumentData } from '@/types'
import { useState } from 'react'

interface DocumentPreviewProps {
  documentData: DocumentData
  onDownload: () => void
}

export default function DocumentPreview({
  documentData,
  onDownload,
}: DocumentPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: documentData.id,
          placeholders: documentData.placeholders,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate document')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `filled-document-${documentData.id}.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      onDownload()
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Failed to download document. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const filledPlaceholders = documentData.placeholders.filter(
    p => p.value && p.value.trim() !== ''
  )
  const totalPlaceholders = documentData.placeholders.length

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Document Preview
        </h2>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          {filledPlaceholders.length} / {totalPlaceholders} filled
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <div className="prose dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900 dark:text-slate-100">
            {documentData.filledText || documentData.originalText}
          </pre>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Placeholders Status:
          </p>
          <div className="space-y-1">
            {documentData.placeholders.map(placeholder => (
              <div
                key={placeholder.id}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-slate-700 dark:text-slate-300">
                  {placeholder.key}
                </span>
                <span
                  className={`px-2 py-1 rounded ${
                    placeholder.value && placeholder.value.trim() !== ''
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {placeholder.value && placeholder.value.trim() !== ''
                    ? placeholder.value
                    : 'Not filled'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={isDownloading || filledPlaceholders.length === 0}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
        >
          {isDownloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download Completed Document
            </>
          )}
        </button>
      </div>
    </div>
  )
}

