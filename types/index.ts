export interface Placeholder {
  id: string
  key: string
  value: string
  description?: string
}

export interface DocumentData {
  id: string
  originalText: string
  placeholders: Placeholder[]
  filledText: string
  fileBuffer?: string // Base64 encoded file buffer for serverless environments
}

