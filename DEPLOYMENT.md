# Deployment Guide

## Quick Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js
   - Click "Deploy"

3. **That's it!** Your app will be live at `https://your-project.vercel.app`

## Environment Variables

Currently, no environment variables are required for basic functionality. If you want to add cloud storage or other services, you'll need to add them in Vercel's dashboard under Project Settings > Environment Variables.

## File Storage on Vercel

**Important**: Vercel's filesystem is read-only except for `/tmp`. For production, you should:

1. Use Vercel Blob Storage (recommended for Vercel deployments)
2. Use AWS S3 or similar cloud storage
3. Use a database to store file metadata

The current implementation uses local filesystem which works for development but will need modification for production on Vercel.

## Testing Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### File Upload Issues
- Ensure the `uploads` and `temp` directories exist (they're created automatically)
- Check file size limits (default is 10MB, configurable in `next.config.js`)

### Document Parsing Issues
- Ensure uploaded files are valid .docx format
- Check browser console for errors
- Verify mammoth library is installed correctly

### Deployment Issues
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (18+)

