import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// DELETE /api/teams/[id]/members/[memberId] — Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id: teamId, memberId } = await params

    const supabase = createServiceClient()

    // Verify team is not confirmed
    const { data: team } = await supabase
      .from('teams')
      .select('confirmed')
      .eq('id', teamId)
      .single()

    if (team?.confirmed) {
      return NextResponse.json(
        { error: 'Cannot modify a confirmed team' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('team_id', teamId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
