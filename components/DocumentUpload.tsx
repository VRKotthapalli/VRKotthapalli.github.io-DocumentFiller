'use client'

import { useState, useRef } from 'react'
import { DocumentData } from '@/app/page'

interface DocumentUploadProps {
  onUpload: (data: DocumentData) => void
  isProcessing: boolean
  setIsProcessing: (value: boolean) => void
}

export default function DocumentUpload({
  onUpload,
  isProcessing,
  setIsProcessing,
}: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      alert('Please upload a .docx file')
      return
    }

    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process document')
      }

      const data: DocumentData = await response.json()
      onUpload(data)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to process document. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          onChange={handleChange}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-slate-600 dark:text-slate-300">
              Processing document...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Drop your document here
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Select .docx File
              </button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Supports Microsoft Word documents (.docx)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

