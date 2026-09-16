import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  mapDbTeamToTeam,
  mapDbMemberToTeamMember,
  mapDbAgentScore,
  type DbUser,
  type DbTeamMember,
  type DbAgentScore,
} from '@/lib/types'

// GET /api/teams/[id] — Get team detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params

    const supabase = createServiceClient()

    const { data: dbTeam, error: teamErr } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (teamErr || !dbTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Get members with user data
    const { data: dbMembers } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)

    const members = await Promise.all(
      (dbMembers || []).map(async (dbMember: DbTeamMember) => {
        const { data: memberUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', dbMember.user_id)
          .single()

        return mapDbMemberToTeamMember(dbMember, memberUser as DbUser)
      })
    )

    // Get agent scores
    const { data: dbScores } = await supabase
      .from('agent_scores')
      .select('*')
      .eq('team_id', teamId)

    const agentScores = (dbScores || []).map((s: DbAgentScore) => mapDbAgentScore(s))

    return NextResponse.json({
      team: mapDbTeamToTeam(dbTeam, members, agentScores),
    })
  } catch (error) {
    console.error('Fetch team error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/teams/[id] — Delete team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete team error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
