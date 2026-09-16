import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/users/search?q=query — Search users for member selection
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const excludeTeamId = searchParams.get('excludeTeamId')

    const supabase = createServiceClient()

    let usersQuery = supabase
      .from('users')
      .select('id, name, email, role, personality_stability_score, personality_strengths, personality_weaknesses, profile_complete')
      .eq('profile_complete', true)
      .order('name')
      .limit(20)

    if (query) {
      usersQuery = usersQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    }

    const { data: users, error } = await usersQuery

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If excludeTeamId provided, filter out existing team members
    let filteredUsers = users || []
    if (excludeTeamId) {
      const { data: existingMembers } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', excludeTeamId)

      const existingUserIds = new Set(
        (existingMembers || []).map((m: { user_id: string }) => m.user_id)
      )
      filteredUsers = filteredUsers.filter((u) => !existingUserIds.has(u.id))
    }

    return NextResponse.json({ users: filteredUsers })
  } catch (error) {
    console.error('User search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
