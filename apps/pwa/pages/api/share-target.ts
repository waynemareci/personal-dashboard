import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false // Disable body parser to handle multipart/form-data
  }
};

/**
 * Web Share Target API Handler
 *
 * Receives shared content from other apps via the Web Share Target API.
 * Handles text, URLs, and files (images, PDFs, etc.)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse multipart form data
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'uploads'),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024 // 10MB max
    });

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const [fields, files] = await form.parse(req);

    // Extract shared data
    const title = fields.title?.[0] || '';
    const text = fields.text?.[0] || '';
    const url = fields.url?.[0] || '';
    const file = files.file?.[0];

    console.log('[ShareTarget] Received shared content:', {
      title,
      text: text.substring(0, 100),
      url,
      hasFile: !!file
    });

    // Process the shared content
    const captureData = {
      id: generateId(),
      title,
      text,
      url,
      file: file ? {
        filename: file.originalFilename || 'shared-file',
        filepath: file.filepath,
        mimetype: file.mimetype,
        size: file.size
      } : null,
      timestamp: new Date().toISOString()
    };

    // Determine capture type based on content
    const captureType = determineCaptureType(captureData);

    // Store in appropriate collection
    await storeSharedContent(captureData, captureType);

    // Redirect to appropriate page
    const redirectUrl = getRedirectUrl(captureType, captureData.id);

    // Return HTML redirect (required for Share Target API)
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Capture Successful</title>
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              color: white;
            }
            .container {
              text-align: center;
            }
            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid rgba(255, 255, 255, 0.2);
              border-top-color: #3b82f6;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin: 0 auto 20px;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h2>Content Captured!</h2>
            <p>Redirecting...</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('[ShareTarget] Error processing shared content:', error);

    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              color: white;
            }
            .error {
              text-align: center;
              padding: 40px;
              background: rgba(239, 68, 68, 0.1);
              border-radius: 12px;
              border: 1px solid rgba(239, 68, 68, 0.3);
            }
            button {
              margin-top: 20px;
              padding: 12px 24px;
              background: #3b82f6;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>❌ Capture Failed</h2>
            <p>${error instanceof Error ? error.message : 'Unknown error occurred'}</p>
            <button onclick="window.location.href='/'">Return to Dashboard</button>
          </div>
        </body>
      </html>
    `);
  }
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `capture-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Determine capture type based on content
 */
function determineCaptureType(data: any): 'transaction' | 'meal' | 'task' | 'note' {
  const content = `${data.title} ${data.text}`.toLowerCase();

  // Financial keywords
  if (
    content.includes('$') ||
    content.includes('paid') ||
    content.includes('bought') ||
    content.includes('expense') ||
    content.includes('transaction')
  ) {
    return 'transaction';
  }

  // Health/meal keywords
  if (
    content.includes('meal') ||
    content.includes('food') ||
    content.includes('ate') ||
    content.includes('calories') ||
    content.includes('recipe')
  ) {
    return 'meal';
  }

  // Task keywords
  if (
    content.includes('todo') ||
    content.includes('task') ||
    content.includes('reminder') ||
    content.includes('deadline')
  ) {
    return 'task';
  }

  // Default to note
  return 'note';
}

/**
 * Store shared content in database
 */
async function storeSharedContent(data: any, type: string): Promise<void> {
  // In a real implementation, this would store to IndexedDB or API
  // For now, we'll just log it
  console.log('[ShareTarget] Storing as', type, ':', data);

  // TODO: Implement actual storage
  // This would use the IndexedDB layer created earlier
  // Example:
  // const store = new OfflineStore(type === 'transaction' ? 'transactions' : 'tasks');
  // await store.add({ ...data, syncStatus: 'pending', lastModified: Date.now(), version: 1 });
}

/**
 * Get redirect URL based on capture type
 */
function getRedirectUrl(type: string, id: string): string {
  switch (type) {
    case 'transaction':
      return `/financial?captured=${id}`;
    case 'meal':
      return `/health?captured=${id}`;
    case 'task':
      return `/schedule?captured=${id}`;
    default:
      return `/?captured=${id}`;
  }
}
