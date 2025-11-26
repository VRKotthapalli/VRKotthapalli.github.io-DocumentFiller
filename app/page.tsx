'use client'

import { useState } from 'react'
import DocumentUpload from '@/components/DocumentUpload'
import ConversationInterface from '@/components/ConversationInterface'
import DocumentPreview from '@/components/DocumentPreview'
import { Placeholder, DocumentData } from '@/types'

export default function Home() {
  const [documentData, setDocumentData] = useState<DocumentData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDocumentUploaded = (data: DocumentData) => {
    setDocumentData(data)
  }

  const handlePlaceholderUpdate = (placeholderId: string, value: string) => {
    if (!documentData) return

    const updatedPlaceholders = documentData.placeholders.map(p =>
      p.id === placeholderId ? { ...p, value } : p
    )

    // Update filled text - escape special regex characters in placeholder key
    let filledText = documentData.originalText
    updatedPlaceholders.forEach(placeholder => {
      const escapedKey = placeholder.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(
        `\\{\\{${escapedKey}\\}\\}|\\[${escapedKey}\\]|\\{${escapedKey}\\}`,
        'g'
      )
      filledText = filledText.replace(regex, placeholder.value || `[${placeholder.key}]`)
    })

    setDocumentData({
      ...documentData,
      placeholders: updatedPlaceholders,
      filledText,
    })
  }

  const handleReset = () => {
    setDocumentData(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Lexsy Document Filler
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Upload a legal document and fill in placeholders through conversation
          </p>
        </div>

        {!documentData ? (
          <DocumentUpload
            onUpload={handleDocumentUploaded}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ConversationInterface
                placeholders={documentData.placeholders}
                onPlaceholderUpdate={handlePlaceholderUpdate}
                onReset={handleReset}
              />
            </div>
            <div>
              <DocumentPreview
                documentData={documentData}
                onDownload={() => {
                  // Download will be handled in DocumentPreview component
                }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

