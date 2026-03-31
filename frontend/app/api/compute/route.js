import { NextResponse } from 'next/server'
import { gunzipSync } from 'node:zlib'

const MODAL_ENDPOINT = process.env.MODAL_ENDPOINT || 'https://suislanchez--polygenic-risk-score-calc-compute-prs-web.modal.run'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB (after compression)

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const ancestry = formData.get('ancestry') || 'EUR'
    const compressed = formData.get('compressed') === 'true'
    const originalFilename = formData.get('original_filename') || file.name

    if (!file) {
      return NextResponse.json(
        { status: 'error', message: 'No file provided' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { status: 'error', message: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 50 MB.` },
        { status: 413 }
      )
    }

    // Read file and decompress if needed
    const bytes = await file.arrayBuffer()
    let buffer = Buffer.from(bytes)

    if (compressed) {
      buffer = gunzipSync(buffer)
    }

    const base64Content = buffer.toString('base64')

    // Call Modal endpoint
    const response = await fetch(MODAL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_content: base64Content,
        filename: originalFilename,
        ancestry: ancestry,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Server error (${response.status}): ${text.slice(0, 200)}`)
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Compute error:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}