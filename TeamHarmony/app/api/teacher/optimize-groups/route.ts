import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { buildPairwiseMatrix } from '@/lib/teacher/buildPairwiseMatrix'
import { greedyCluster } from '@/lib/teacher/greedyCluster'
import { refineSwaps } from '@/lib/teacher/refineSwaps'
import { parseSkills, type StudentData } from '@/lib/teacher/scoringUtils'
import type { DbUser, SurveyData } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { student_emails, group_size } = body as {
      student_emails: string[]
      group_size: number
    }

    // ===== INPUT VALIDATION =====
    if (!Array.isArray(student_emails) || student_emails.length === 0) {
      return NextResponse.json(
        { error: 'student_emails must be a non-empty array of email strings' },
        { status: 400 }
      )
    }

    if (typeof group_size !== 'number' || group_size < 2) {
      return NextResponse.json(
        { error: 'group_size must be a number >= 2' },
        { status: 400 }
      )
    }

    if (group_size > student_emails.length) {
      return NextResponse.json(
        { error: 'group_size cannot be greater than the number of students' },
        { status: 400 }
      )
    }

    // Deduplicate emails (case-insensitive)
    const normalizedEmails = [...new Set(student_emails.map((e) => e.trim().toLowerCase()))]

    if (normalizedEmails.length !== student_emails.length) {
      return NextResponse.json(
        { error: 'Duplicate emails detected. Please provide unique email addresses.' },
        { status: 400 }
      )
    }

    // ===== FETCH STUDENT DATA =====
    const supabase = createServiceClient()

    const { data: users, error: fetchErr } = await supabase
      .from('users')
      .select('*')
      .in('email', normalizedEmails)

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 })
    }

    // Check for missing users
    const foundEmails = new Set((users || []).map((u: DbUser) => u.email.toLowerCase()))
    const missingEmails = normalizedEmails.filter((e) => !foundEmails.has(e))
    if (missingEmails.length > 0) {
      return NextResponse.json(
        { error: `Users not found for emails: ${missingEmails.join(', ')}` },
        { status: 404 }
      )
    }

    // Validate required fields
    const dbUsers = users as DbUser[]
    const missingData: string[] = []
    for (const user of dbUsers) {
      if (user.personality_stability_score === null) {
        missingData.push(`${user.email}: missing personality stability score`)
      }
    }
    if (missingData.length > 0) {
      return NextResponse.json(
        { error: `Some students have incomplete profiles. Run personality analysis first.\n${missingData.join('\n')}` },
        { status: 400 }
      )
    }

    // ===== BUILD STUDENT DATA =====
    const students: StudentData[] = dbUsers.map((user) => {
      const surveyData = (user.survey_data || {}) as SurveyData
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        estimatedMbti: user.estimated_mbti,
        stabilityScore: Number(user.personality_stability_score) || 0,
        skills: parseSkills(surveyData.skills),
      }
    })

    // Sort deterministically by email to ensure consistent output
    students.sort((a, b) => a.email.localeCompare(b.email))

    // ===== RUN OPTIMIZATION PIPELINE =====

    // Step 1: Build pairwise compatibility matrix
    const matrix = buildPairwiseMatrix(students)

    // Step 2: Greedy group construction
    const initialGroups = greedyCluster(matrix, group_size)

    // Step 3: Local swap refinement
    const optimizedGroups = refineSwaps(initialGroups, matrix)

    // ===== FORMAT RESPONSE =====
    const groups = optimizedGroups.map((group) => ({
      members: group.memberIndices.map((idx) => ({
        email: students[idx].email,
        name: students[idx].name,
        stabilityScore: students[idx].stabilityScore,
        estimatedMbti: students[idx].estimatedMbti,
      })),
      score: Math.round(group.score * 1000) / 1000,
    }))

    const overallScore =
      groups.length > 0
        ? Math.round((groups.reduce((sum, g) => sum + g.score, 0) / groups.length) * 1000) / 1000
        : 0

    return NextResponse.json({
      groups,
      overall_score: overallScore,
      metadata: {
        total_students: students.length,
        num_groups: groups.length,
        target_group_size: group_size,
      },
    })
  } catch (error) {
    console.error('Group optimization error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
