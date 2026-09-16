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

// GET /api/teams — List user's teams
export async function GET(request: NextRequest) {
  try {
    const authId = request.headers.get('x-auth-id')
    if (!authId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', authId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get teams owned by user
    const { data: dbTeams, error: teamsErr } = await supabase
      .from('teams')
      .select('*')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: false })

    if (teamsErr) {
      return NextResponse.json({ error: teamsErr.message }, { status: 500 })
    }

    // For each team, get members and agent scores
    const teams = await Promise.all(
      (dbTeams || []).map(async (dbTeam) => {
        // Get team members with user data
        const { data: dbMembers } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', dbTeam.id)

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
          .eq('team_id', dbTeam.id)

        const agentScores = (dbScores || []).map((s: DbAgentScore) => mapDbAgentScore(s))

        return mapDbTeamToTeam(dbTeam, members, agentScores)
      })
    )

    return NextResponse.json({ teams })
  } catch (error) {
    console.error('Fetch teams error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/teams — Create team
export async function POST(request: NextRequest) {
  try {
    const authId = request.headers.get('x-auth-id')
    if (!authId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', authId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .insert({
        owner_user_id: user.id,
        name,
        description: description || '',
      })
      .select()
      .single()

    if (teamErr) {
      return NextResponse.json({ error: teamErr.message }, { status: 500 })
    }

    return NextResponse.json({
      team: mapDbTeamToTeam(team, [], []),
    })
  } catch (error) {
    console.error('Create team error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
