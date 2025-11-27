'use client'

import { useState, useRef, useEffect } from 'react'
import { Placeholder } from '@/types'

interface ConversationInterfaceProps {
  placeholders: Placeholder[]
  onPlaceholderUpdate: (placeholderId: string, value: string) => void
  onReset: () => void
}

export default function ConversationInterface({
  placeholders,
  onPlaceholderUpdate,
  onReset,
}: ConversationInterfaceProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `I found ${placeholders.length} placeholder${placeholders.length !== 1 ? 's' : ''} in your document. Let's fill them in! What would you like to start with?`,
    },
  ])
  const [input, setInput] = useState('')
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Find the next unfilled placeholder
  const findNextUnfilledPlaceholder = (startIndex: number = 0) => {
    for (let i = startIndex; i < placeholders.length; i++) {
      const placeholder = placeholders[i]
      if (!placeholder.value || placeholder.value.trim() === '') {
        return i
      }
    }
    return -1 // No unfilled placeholder found
  }

  // Update current index to always point to the first unfilled placeholder when values change
  useEffect(() => {
    // Always find the first unfilled placeholder from the beginning
    const firstUnfilledIndex = findNextUnfilledPlaceholder(0)
    if (firstUnfilledIndex !== -1) {
      setCurrentPlaceholderIndex(firstUnfilledIndex)
    } else {
      // All placeholders are filled
      setCurrentPlaceholderIndex(placeholders.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholders.map(p => p.value).join(',')]) // Only react to value changes

  const getCurrentPlaceholder = () => {
    // Always start from the first unfilled placeholder
    const firstUnfilledIndex = findNextUnfilledPlaceholder(0)
    if (firstUnfilledIndex !== -1) {
      if (currentPlaceholderIndex !== firstUnfilledIndex) {
        setCurrentPlaceholderIndex(firstUnfilledIndex)
      }
      return placeholders[firstUnfilledIndex]
    }
    // All placeholders are filled
    if (currentPlaceholderIndex < placeholders.length) {
      setCurrentPlaceholderIndex(placeholders.length)
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    setIsProcessing(true)
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    // Simple conversational logic
    const currentPlaceholder = getCurrentPlaceholder()
    
    // Check if user is providing a value for the current placeholder
    if (currentPlaceholder) {
      // Extract value from user input (simple heuristic)
      let extractedValue = userMessage
      
      // If user says something like "set it to X" or "make it X"
      const setPattern = /(?:set|make|use|put)\s+(?:it|this|that)\s+(?:to|as|equal to)?\s*(.+)/i
      const match = userMessage.match(setPattern)
      if (match) {
        extractedValue = match[1].trim()
      }

      // Update the placeholder
      onPlaceholderUpdate(currentPlaceholder.id, extractedValue)

      // Always find the first unfilled placeholder from the beginning
      const nextIndex = findNextUnfilledPlaceholder(0)
      if (nextIndex !== -1) {
        setCurrentPlaceholderIndex(nextIndex)
        const nextPlaceholder = placeholders[nextIndex]
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Got it! I've set "${currentPlaceholder.key}" to "${extractedValue}". Next, what should "${nextPlaceholder.key}" be?`,
          },
        ])
      } else {
        // All placeholders are filled
        setCurrentPlaceholderIndex(placeholders.length)
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Perfect! I've set "${currentPlaceholder.key}" to "${extractedValue}". All placeholders are now filled! You can review the document and download it when ready.`,
          },
        ])
      }
    } else {
      // General conversation (all placeholders filled)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'All placeholders are filled! You can review the document and download it when ready.',
        },
      ])
    }

    setIsProcessing(false)
  }

  const handleQuickFill = (placeholderId: string, value: string) => {
    onPlaceholderUpdate(placeholderId, value)
    const placeholder = placeholders.find(p => p.id === placeholderId)
    if (placeholder) {
      // Always find the first unfilled placeholder from the beginning
      const nextIndex = findNextUnfilledPlaceholder(0)
      if (nextIndex !== -1) {
        setCurrentPlaceholderIndex(nextIndex)
        const nextPlaceholder = placeholders[nextIndex]
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `I've set "${placeholder.key}" to "${value}". Next, what should "${nextPlaceholder.key}" be?`,
          },
        ])
      } else {
        // All placeholders are filled
        setCurrentPlaceholderIndex(placeholders.length)
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `I've set "${placeholder.key}" to "${value}". All placeholders are now filled! You can review the document and download it when ready.`,
          },
        ])
      }
    }
  }

  const remainingPlaceholders = placeholders.filter(p => !p.value || p.value.trim() === '')

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Conversation
        </h2>
        <button
          onClick={onReset}
          className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        >
          Upload New Document
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {remainingPlaceholders.length > 0 && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
            Remaining placeholders:
          </p>
          <div className="flex flex-wrap gap-2">
            {remainingPlaceholders.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  const value = prompt(`Enter value for "${p.key}":`)
                  if (value) handleQuickFill(p.id, value)
                }}
                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                {p.key}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isProcessing || currentPlaceholderIndex >= placeholders.length}
          placeholder={
            currentPlaceholderIndex >= placeholders.length
              ? 'All placeholders filled!'
              : (() => {
                  const current = getCurrentPlaceholder()
                  return current ? `Enter value for "${current.key}"...` : 'Type your message...'
                })()
          }
          className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!input.trim() || isProcessing || currentPlaceholderIndex >= placeholders.length}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
        >
          Send
        </button>
      </form>
    </div>
  )
}

