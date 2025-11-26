import { NextRequest, NextResponse } from 'next/server'
import PizZip from 'pizzip'
import fs from 'fs/promises'
import path from 'path'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentId, placeholders } = body

    if (!documentId) {
      return NextResponse.json(
        { error: 'No document ID provided' },
        { status: 400 }
      )
    }

    // Load the original document
    const originalFilePath = path.join(UPLOADS_DIR, `${documentId}.docx`)
    
    try {
      await fs.access(originalFilePath)
    } catch {
      return NextResponse.json(
        { error: 'Original document not found' },
        { status: 404 }
      )
    }

    // Read the original document
    const content = await fs.readFile(originalFilePath, 'binary')
    const zip = new PizZip(content)

    // Helper function to escape XML special characters
    const escapeXml = (text: string): string => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
    }

    // Helper function to replace placeholders in XML content
    // Word documents can split placeholders across multiple <w:t> nodes
    // We need to handle this by processing the XML structure more carefully
    const replacePlaceholdersInXml = (xmlContent: string): string => {
      let result = xmlContent
      
      // First, create a map of all placeholders with their values for quick lookup
      const placeholderMap = new Map<string, string>()
      for (const placeholder of placeholders) {
        const value = placeholder.value || ''
        if (value && value.trim() !== '') {
          const escapedValue = escapeXml(value)
          placeholderMap.set(placeholder.key, escapedValue)
        }
      }
      
      // Process each placeholder key - do multiple passes to ensure all are replaced
      for (const [key, escapedValue] of placeholderMap.entries()) {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        
        // Pass 1: Replace {{key}} format - do this first to avoid conflicts
        const pattern1 = new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g')
        result = result.replace(pattern1, escapedValue)
        
        // Pass 2: Replace [key] format
        const pattern2 = new RegExp(`\\[${escapedKey}\\]`, 'g')
        result = result.replace(pattern2, escapedValue)
        
        // Pass 3: Replace {key} format (but not {{key}} which we already handled)
        // Since we already replaced {{key}}, any remaining {key} is safe to replace
        const pattern3 = new RegExp(`\\{${escapedKey}\\}`, 'g')
        result = result.replace(pattern3, escapedValue)
        
        // Pass 4: Handle placeholders that might be split across XML text nodes
        // Use a simpler approach: search for the key and check if it's part of a placeholder
        // by looking for bracket patterns that might span XML tags
        
        // Try to find placeholders even if split by XML tags using a more flexible regex
        // This pattern allows for XML tags between the brackets and the key
        const flexiblePattern1 = new RegExp(
          `\\{\\{[^}]*?${escapedKey}[^}]*?\\}\\}`,
          'gs'
        )
        result = result.replace(flexiblePattern1, (match) => {
          // Clean the match to check if it contains our key
          const cleaned = match.replace(/<[^>]+>/g, '')
          if (cleaned.includes(`{{${key}}}`) || cleaned.includes(key)) {
            return escapedValue
          }
          return match
        })
        
        const flexiblePattern2 = new RegExp(
          `\\[[^\\]]*?${escapedKey}[^\\]]*?\\]`,
          'gs'
        )
        result = result.replace(flexiblePattern2, (match) => {
          const cleaned = match.replace(/<[^>]+>/g, '')
          if (cleaned.includes(`[${key}]`) || cleaned.includes(key)) {
            return escapedValue
          }
          return match
        })
        
        const flexiblePattern3 = new RegExp(
          `\\{[^{]*?${escapedKey}[^}]*?\\}`,
          'gs'
        )
        result = result.replace(flexiblePattern3, (match) => {
          const cleaned = match.replace(/<[^>]+>/g, '')
          // Make sure it's not {{key}} (should start with single {)
          if (!cleaned.startsWith('{{') && (cleaned.includes(`{${key}}`) || cleaned.includes(key))) {
            return escapedValue
          }
          return match
        })
      }
      
      return result
    }

    // Process main document
    const docXml = zip.files['word/document.xml']
    if (!docXml) {
      return NextResponse.json(
        { error: 'Invalid document format' },
        { status: 400 }
      )
    }
    let xmlContent = docXml.asText()
    
    xmlContent = replacePlaceholdersInXml(xmlContent)
    zip.file('word/document.xml', xmlContent)

    // Process headers (if they exist)
    Object.keys(zip.files).forEach((filename) => {
      if (filename.startsWith('word/header') && filename.endsWith('.xml')) {
        const headerXml = zip.files[filename]
        if (headerXml) {
          let headerContent = headerXml.asText()
          headerContent = replacePlaceholdersInXml(headerContent)
          zip.file(filename, headerContent)
        }
      }
    })

    // Process footers (if they exist)
    Object.keys(zip.files).forEach((filename) => {
      if (filename.startsWith('word/footer') && filename.endsWith('.xml')) {
        const footerXml = zip.files[filename]
        if (footerXml) {
          let footerContent = footerXml.asText()
          footerContent = replacePlaceholdersInXml(footerContent)
          zip.file(filename, footerContent)
        }
      }
    })

    // Generate the document buffer
    const buffer = zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    })

    // Return as blob
    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="filled-document-${documentId}.docx"`,
      },
    })
  } catch (error) {
    console.error('Error generating document:', error)
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    )
  }
}

