import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateJSON } from '@/lib/gemini'
import { runPersonalityStabilityPipeline } from '@/lib/agents/personality-stability-pipeline'
import type { CanonicalProfile, SurveyData } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { authId } = await request.json()

    if (!authId) {
      return NextResponse.json({ error: 'Auth ID is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Get user data
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single()

    if (userErr || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build canonical profile from all available data
    const surveyData = (user.survey_data || {}) as SurveyData
    const resumeText = user.resume_text || ''
    const audioTranscript = user.audio_transcript || ''

    // Log data sources for debugging
    const surveyFields = Object.entries(surveyData).filter(([, v]) => v && String(v).trim().length > 0)
    console.log('[Analyze] Data sources:')
    console.log(`  - Resume: ${resumeText ? `${resumeText.length} chars` : 'EMPTY'}`)
    console.log(`  - Audio transcript: ${audioTranscript ? `${audioTranscript.length} chars` : 'EMPTY'}`)
    console.log(`  - Survey fields filled: ${surveyFields.length}/8 (${surveyFields.map(([k]) => k).join(', ')})`)

    const canonicalProfile = await buildCanonicalProfile(
      user.name,
      resumeText,
      audioTranscript,
      surveyData,
    )

    // Store canonical profile
    await supabase
      .from('users')
      .update({ canonical_profile: canonicalProfile })
      .eq('auth_id', authId)

    // Run personality stability pipeline
    const result = await runPersonalityStabilityPipeline(
      JSON.stringify(canonicalProfile)
    )

    // Store results in user record
    const { data: updatedUser, error: updateErr } = await supabase
      .from('users')
      .update({
        personality_stability_score: result.score,
        personality_confidence_level: result.confidenceLevel,
        personality_recommendation: result.recommendation,
        personality_strengths: result.strengths,
        personality_weaknesses: result.weaknesses,
        estimated_mbti: result.estimatedMbti,
      })
      .eq('auth_id', authId)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({
      user: updatedUser,
      analysis: result,
    })
  } catch (error) {
    console.error('Personality analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function formatSurveyForAI(survey: SurveyData): string {
  const questions: Array<{ key: keyof SurveyData; label: string }> = [
    { key: 'groupRole', label: 'What role do you naturally take in group projects?' },
    { key: 'decisionMaking', label: 'How do you prefer to make decisions?' },
    { key: 'deadline', label: 'When facing a tight deadline, you usually...' },
    { key: 'conflict', label: 'How do you typically handle conflict in a team?' },
    { key: 'organized', label: 'On a scale from 1–5, how organized are you?' },
    { key: 'speakingUp', label: 'On a scale from 1–5, how comfortable are you speaking up in group discussions?' },
    { key: 'skills', label: 'What are your top 5 technical or functional skills?' },
    { key: 'frustrations', label: 'When working in a team, what frustrates you the most?' },
  ]

  const lines = questions
    .filter(({ key }) => survey[key] && survey[key]!.trim().length > 0)
    .map(({ key, label }) => `Q: ${label}\nA: ${survey[key]}`)

  return lines.length > 0 ? lines.join('\n\n') : '[No survey responses provided]'
}

async function buildCanonicalProfile(
  name: string,
  resumeText: string,
  audioTranscript: string,
  surveyData: SurveyData,
): Promise<CanonicalProfile> {
  const formattedSurvey = formatSurveyForAI(surveyData)

  const systemPrompt = `You are a profile aggregation assistant. Given a user's name, resume text, audio transcript, and structured survey responses, create a unified canonical profile that captures their personality, work style, skills, and team dynamics preferences.

You MUST output ONLY valid JSON with this exact structure:
{
  "name": "the user's name",
  "resumeSummary": "a concise summary of the resume highlighting key skills, experience, and qualifications",
  "audioTranscriptSummary": "a concise summary of what the user said in their audio recording, focusing on personality traits, work style, and preferences",
  "surveyResponses": {
    "groupRole": "their answer or empty string",
    "decisionMaking": "their answer or empty string",
    "deadline": "their answer or empty string",
    "conflict": "their answer or empty string",
    "organized": "their answer or empty string",
    "speakingUp": "their answer or empty string",
    "skills": "their answer or empty string",
    "frustrations": "their answer or empty string"
  },
  "combinedNarrative": "a comprehensive 2-3 paragraph narrative that integrates ALL data sources — resume, audio, AND survey responses — into a unified personality and professional profile. Pay special attention to the survey answers as they reveal team dynamics preferences, decision-making style, conflict handling approach, stress response, communication comfort, and key frustrations."
}

IMPORTANT: The survey responses are structured answers to specific behavioral questions. These are CRITICAL for personality and team compatibility assessment. Integrate them thoroughly into the combinedNarrative.

If any data source is empty or missing, note that in the relevant field and work with available data.`

  const userInput = `Name: ${name}

RESUME TEXT:
${resumeText || '[No resume provided]'}

AUDIO TRANSCRIPT:
${audioTranscript || '[No audio provided]'}

STRUCTURED SURVEY RESPONSES:
${formattedSurvey}`

  return generateJSON<CanonicalProfile>(systemPrompt, userInput)
}
