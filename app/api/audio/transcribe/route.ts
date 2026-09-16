import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/elevenlabs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 })
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer())
    const transcript = await transcribeAudio(buffer, audioFile.name)

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
