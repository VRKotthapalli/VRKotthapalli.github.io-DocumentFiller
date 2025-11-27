'use client'

import { Placeholder } from '@/types'

interface PlaceholdersStatusProps {
  placeholders: Placeholder[]
}

export default function PlaceholdersStatus({
  placeholders,
}: PlaceholdersStatusProps) {
  const filledPlaceholders = placeholders.filter(
    p => p.value && p.value.trim() !== ''
  )
  const totalPlaceholders = placeholders.length

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Placeholders Status
        </h2>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          {filledPlaceholders.length} / {totalPlaceholders} filled
        </div>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {placeholders.map(placeholder => (
          <div
            key={placeholder.id}
            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
          >
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">
              {placeholder.key}
            </span>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${
                placeholder.value && placeholder.value.trim() !== ''
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
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
  )
}

