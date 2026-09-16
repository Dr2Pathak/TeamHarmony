import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// POST /api/teams/[id]/members — Add member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Verify team exists
    const { data: team } = await supabase
      .from('teams')
      .select('id, confirmed')
      .eq('id', teamId)
      .single()

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    if (team.confirmed) {
      return NextResponse.json(
        { error: 'Cannot modify a confirmed team' },
        { status: 400 }
      )
    }

    // Verify user exists
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Add member
    const { data: member, error: memberErr } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
      })
      .select()
      .single()

    if (memberErr) {
      if (memberErr.code === '23505') {
        return NextResponse.json({ error: 'User is already a team member' }, { status: 409 })
      }
      return NextResponse.json({ error: memberErr.message }, { status: 500 })
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Add member error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
