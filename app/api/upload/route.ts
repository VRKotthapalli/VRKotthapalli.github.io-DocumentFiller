import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
import { Placeholder, DocumentData } from '@/types'

// Use /tmp for serverless environments (Vercel, AWS Lambda, etc.)
// /tmp is the only writable directory in serverless functions
const TEMP_DIR = '/tmp'

async function ensureDirectories() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true })
  } catch (error) {
    // /tmp should always exist, but handle gracefully
    console.error('Error creating temp directory:', error)
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

    // Save file temporarily to /tmp for processing
    await fs.writeFile(tempFilePath, buffer)

    // Extract text from docx
    const result = await mammoth.extractRawText({ path: tempFilePath })
    const text = result.value

    // Extract placeholders
    const placeholders = extractPlaceholders(text)

    // Convert file buffer to base64 for storage (needed for serverless environments)
    // where files don't persist between requests
    const fileBufferBase64 = buffer.toString('base64')

    // Create document data
    const documentData: DocumentData = {
      id: documentId,
      originalText: text,
      placeholders,
      filledText: text,
      fileBuffer: fileBufferBase64, // Store file buffer for download
    }

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

