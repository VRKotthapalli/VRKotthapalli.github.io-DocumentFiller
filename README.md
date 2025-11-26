# Lexsy Document Filler

A Next.js application that allows users to upload legal document templates (.docx files), identify placeholders, and fill them in through a conversational interface.

## Features

- 📄 **Document Upload**: Drag-and-drop or click to upload .docx files
- 🔍 **Placeholder Detection**: Automatically identifies placeholders in formats like `{{placeholder}}`, `[placeholder]`, or `{placeholder}`
- 💬 **Conversational Interface**: Fill placeholders through a chat-like experience
- 👁️ **Live Preview**: See the document update in real-time as you fill placeholders
- ⬇️ **Download**: Generate and download the completed document

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** for styling
- **mammoth** for parsing .docx files
- **docx** for generating .docx files

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## File Storage

### Current Implementation (Development)

Uploaded files are stored in the following locations on the local filesystem:

- **Original uploaded files**: `/uploads/{documentId}.docx`
- **Document metadata**: `/uploads/{documentId}.json`
- **Temporary files**: `/temp/` (automatically cleaned up after processing)

These directories are created automatically when the application runs and are gitignored.

### Production Considerations

For production deployments, you should consider:

1. **Cloud Storage Services**:
   - **AWS S3**: Store files in S3 buckets with signed URLs for access
   - **Google Cloud Storage**: Similar to S3, with good integration options
   - **Vercel Blob Storage**: Native integration with Vercel deployments
   - **Cloudinary**: Good for document storage and processing

2. **Database Storage**:
   - Store document metadata in PostgreSQL, MongoDB, or similar
   - Keep file references (URLs or paths) in the database
   - Store placeholder data and user responses

3. **File Cleanup**:
   - Implement a scheduled job (cron) to delete files older than X days
   - Use cloud storage lifecycle policies
   - Clean up after document download or after a session expires

4. **Security**:
   - Implement file size limits
   - Validate file types server-side
   - Use signed URLs for file access
   - Implement rate limiting on upload endpoints

### Migration Path

To migrate to cloud storage, you would need to:

1. Update `/app/api/upload/route.ts` to upload to your cloud storage service
2. Update `/app/api/download/route.ts` to fetch from cloud storage if needed
3. Replace filesystem operations with cloud storage SDK calls
4. Update environment variables for storage credentials

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Deploy (Vercel will automatically detect Next.js)

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── upload/route.ts    # File upload endpoint
│   │   └── download/route.ts  # Document download endpoint
│   ├── layout.tsx
│   ├── page.tsx               # Main page
│   └── globals.css
├── components/
│   ├── DocumentUpload.tsx     # File upload component
│   ├── ConversationInterface.tsx  # Chat interface
│   └── DocumentPreview.tsx    # Document preview
├── uploads/                   # Uploaded files (gitignored)
└── temp/                      # Temporary files (gitignored)
```

## Usage

1. **Upload a Document**: Click or drag-and-drop a .docx file containing placeholders
2. **Fill Placeholders**: Use the conversation interface to provide values for each placeholder
3. **Preview**: Watch the document update in real-time
4. **Download**: Once all placeholders are filled, download the completed document

## Placeholder Formats Supported

The application recognizes placeholders in the following formats:
- `{{placeholder}}`
- `[placeholder]`
- `{placeholder}`

## Notes

- The application processes documents server-side for security
- Files are stored locally by default (see File Storage section for production considerations)
- The conversational interface uses simple pattern matching (can be enhanced with AI/LLM integration)

## License

MIT

