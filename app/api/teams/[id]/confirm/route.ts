import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { runTeamEvaluationPipeline } from '@/lib/agents/team-evaluation-pipeline'
import { parseSkills } from '@/lib/teacher/scoringUtils'
import type { EnrichedMember } from '@/lib/agents/signals'
import type { DbUser, DbTeamMember } from '@/lib/types'

// POST /api/teams/[id]/confirm — Confirm team and run evaluation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params
    const supabase = createServiceClient()

    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (teamErr || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    const { data: dbMembers } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)

    if (!dbMembers || dbMembers.length === 0) {
      return NextResponse.json(
        { error: 'Team must have at least one member' },
        { status: 400 }
      )
    }

    // Fetch full user data for each member and ENRICH with structured fields.
    // select('*') already returns estimated_mbti / stability / survey_data,
    // so grounding costs ZERO extra queries.
    const memberProfiles: EnrichedMember[] = await Promise.all(
      dbMembers.map(async (member: DbTeamMember) => {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('id', member.user_id)
          .single()

        const dbUser = user as DbUser
        return {
          userId: dbUser.id,
          memberId: member.id,
          name: dbUser.name,
          role: dbUser.role,
          canonicalProfile: dbUser.canonical_profile
            ? JSON.stringify(dbUser.canonical_profile)
            : `Name: ${dbUser.name}, Role: ${dbUser.role}`,
          estimatedMbti: dbUser.estimated_mbti ?? null,
          stabilityScore: dbUser.personality_stability_score ?? 0,
          skills: parseSkills(dbUser.survey_data?.skills),
          survey: dbUser.survey_data ?? {},
        }
      })
    )

    const evaluation = await runTeamEvaluationPipeline(memberProfiles)

    await supabase
      .from('teams')
      .update({
        confirmed: true,
        team_stability_score: Math.round(40 + evaluation.weightedScore * 60),
        team_classification: evaluation.classification,
        team_recommendation: evaluation.recommendation,
        team_strengths: evaluation.strengths,
        team_weaknesses: evaluation.weaknesses,
      })
      .eq('id', teamId)

    await supabase.from('agent_scores').delete().eq('team_id', teamId)

    await supabase.from('agent_scores').insert(
      evaluation.agentScores.map((score) => ({
        team_id: teamId,
        agent_name: score.agentName,
        score: score.score,
        strengths: score.strengths,
        weaknesses: score.weaknesses,
        explanation: score.explanation,
        recommendation: score.recommendation,
      }))
    )

    for (const memberRec of evaluation.memberRecommendations) {
      const matchingMember = memberProfiles.find(
        (mp) => mp.userId === memberRec.user_id || mp.name === memberRec.name
      )
      if (matchingMember) {
        await supabase
          .from('team_members')
          .update({
            member_recommendation: memberRec.recommendation,
            member_strengths: memberRec.strengths,
            member_weaknesses: memberRec.weaknesses,
          })
          .eq('id', matchingMember.memberId)
      }
    }

    return NextResponse.json({
      success: true,
      evaluation: {
        weightedScore: evaluation.weightedScore,
        classification: evaluation.classification,
        recommendation: evaluation.recommendation,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        agentScores: evaluation.agentScores,
        memberRecommendations: evaluation.memberRecommendations,
      },
    })
  } catch (error) {
    console.error('Team evaluation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}