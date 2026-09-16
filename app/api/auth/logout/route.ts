import { NextResponse } from 'next/server'

export async function POST() {
  // Auth state is managed client-side via Supabase browser client.
  // This route exists as a server-side hook point if needed.
  return NextResponse.json({ success: true })
}
