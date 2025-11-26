import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
import { Placeholder, DocumentData } from '@/types'

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
const TEMP_DIR = path.join(process.cwd(), 'temp')

async function ensureDirectories() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true })
    await fs.mkdir(TEMP_DIR, { recursive: true })
  } catch (error) {
    console.error('Error creating directories:', error)
  }
}

function extractPlaceholders(text: string): Placeholder[] {
  const placeholders: Placeholder[] = []
  const patterns = [
    /\{\{([^}]+)\}\}/g, // {{placeholder}}
    /\[([^\]]+)\]/g,    // [placeholder]
    /\{([^}]+)\}/g,     // {placeholder}
  ]

  const found = new Set<string>()

  patterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const key = match[1].trim()
      if (key && !found.has(key)) {
        found.add(key)
        placeholders.push({
          id: uuidv4(),
          key,
          value: '',
        })
      }
    }
  })

  return placeholders
}

export async function POST(request: NextRequest) {
  try {
    await ensureDirectories()

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'File must be a .docx file' },
        { status: 400 }
      )
    }

    const documentId = uuidv4()
    const buffer = Buffer.from(await file.arrayBuffer())
    const tempFilePath = path.join(TEMP_DIR, `${documentId}.docx`)

    // Save file temporarily
    await fs.writeFile(tempFilePath, buffer)

    // Extract text from docx
    const result = await mammoth.extractRawText({ path: tempFilePath })
    const text = result.value

    // Extract placeholders
    const placeholders = extractPlaceholders(text)

    // Create document data
    const documentData: DocumentData = {
      id: documentId,
      originalText: text,
      placeholders,
      filledText: text,
    }

    // Save document data to a JSON file for later retrieval
    const dataFilePath = path.join(UPLOADS_DIR, `${documentId}.json`)
    await fs.writeFile(dataFilePath, JSON.stringify(documentData, null, 2))

    // Keep the original file for download generation
    const savedFilePath = path.join(UPLOADS_DIR, `${documentId}.docx`)
    await fs.copyFile(tempFilePath, savedFilePath)

    // Clean up temp file
    await fs.unlink(tempFilePath).catch(() => {})

    return NextResponse.json(documentData)
  } catch (error) {
    console.error('Error processing upload:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}

