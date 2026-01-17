import { NextResponse } from 'next/server'

const MODAL_ENDPOINT = process.env.MODAL_ENDPOINT || 'https://suislanchez--polygenic-risk-score-calc-compute-prs-web.modal.run'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const ancestry = formData.get('ancestry') || 'EUR'

    if (!file) {
      return NextResponse.json(
        { status: 'error', message: 'No file provided' },
        { status: 400 }
      )
    }

    // Read file and convert to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Content = buffer.toString('base64')

    // Call Modal endpoint
    const response = await fetch(MODAL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_content: base64Content,
        filename: file.name,
        ancestry: ancestry,
      }),
    })

    if (!response.ok) {
      throw new Error(`Modal API error: ${response.status}`)
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
