import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { transcribeAudio } from '@/lib/elevenlabs'
import type { SurveyData } from '@/lib/types'
import { PDFParse } from 'pdf-parse'

// Helper to add timeout to any promise
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ])
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const authId = formData.get('authId') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const resumeFile = formData.get('resume') as File | null
    const audioFile = formData.get('audio') as File | null

    // Parse structured survey data
    const surveyDataRaw = formData.get('surveyData') as string | null
    let surveyData: SurveyData = {}
    if (surveyDataRaw) {
      try {
        surveyData = JSON.parse(surveyDataRaw) as SurveyData
      } catch {
        surveyData = {}
      }
    }

    if (!authId) {
      return NextResponse.json({ error: 'Auth ID is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Get the user record
    const { data: existingUser, error: userErr } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', authId)
      .single()

    if (userErr || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let resumeText = ''
    let audioTranscript = ''

    // Process resume file (with timeout)
    if (resumeFile) {
      try {
        const buffer = Buffer.from(await resumeFile.arrayBuffer())
        const ext = resumeFile.name.split('.').pop()?.toLowerCase()

        if (ext === 'pdf') {
          try {
            const parser = new PDFParse({ data: new Uint8Array(buffer) })
            const result = await parser.getText()
            resumeText = result.text || ''
            await parser.destroy()
          } catch (pdfErr) {
            console.error('PDF parsing failed:', pdfErr)
            resumeText = `[Uploaded file: ${resumeFile.name}]`
          }
        } else if (ext === 'txt') {
          resumeText = new TextDecoder().decode(buffer)
        } else {
          resumeText = `[Uploaded file: ${resumeFile.name}]`
        }

        // Sanitize: remove null bytes and invalid characters that PostgreSQL JSONB rejects
        resumeText = resumeText.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')

        // Upload to Supabase Storage (non-blocking — don't let it hang the save)
        withTimeout(
          supabase.storage
            .from('uploads')
            .upload(`${authId}/resume_${Date.now()}.${ext || 'txt'}`, buffer, {
              contentType: resumeFile.type,
              upsert: true,
            }),
          15000,
          'Resume upload'
        ).catch((err) => console.error('Resume upload failed (non-critical):', err))
      } catch (err) {
        console.error('Resume processing error:', err)
      }
    }

    // Process audio file (with timeout)
    if (audioFile) {
      try {
        const buffer = Buffer.from(await audioFile.arrayBuffer())

        // Upload to Supabase Storage (non-blocking)
        withTimeout(
          supabase.storage
            .from('uploads')
            .upload(`${authId}/audio_${Date.now()}.webm`, buffer, {
              contentType: audioFile.type,
              upsert: true,
            }),
          15000,
          'Audio upload'
        ).catch((err) => console.error('Audio upload failed (non-critical):', err))

        // Transcribe via ElevenLabs (with 30s timeout)
        const rawTranscript = await withTimeout(
          transcribeAudio(buffer, audioFile.name),
          30000,
          'Audio transcription'
        )
        // Sanitize transcript
        audioTranscript = rawTranscript.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      } catch (err) {
        console.error('Audio processing error (continuing without transcript):', err)
        // Continue without transcript — user can still save profile
      }
    }

    // Build the update object — only include fields that were actually sent
    const updateFields: Record<string, unknown> = {}

    if (name) updateFields.name = name
    if (email) updateFields.email = email
    if (Object.keys(surveyData).length > 0) {
      updateFields.survey_data = surveyData
      updateFields.profile_complete = true
    }
    if (resumeText) updateFields.resume_text = resumeText
    if (audioTranscript) updateFields.audio_transcript = audioTranscript

    // Clear canonical_profile so it gets rebuilt on next Analyze
    const hasSurveyData = Object.values(surveyData).some((v) => v && v.trim().length > 0)
    if (hasSurveyData || resumeText || audioTranscript) {
      updateFields.canonical_profile = null
    }

    // Update user record
    const { data: updatedUser, error: updateErr } = await supabase
      .from('users')
      .update(updateFields)
      .eq('auth_id', authId)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
