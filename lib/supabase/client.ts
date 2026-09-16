import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let client: ReturnType<typeof createSupabaseClient> | null = null

function getSupabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (url && anonKey) {
    return { url, anonKey }
  }

  // Allow the UI shell to render when env vars are not configured yet.
  // Auth/API calls still require real credentials.
  console.warn(
    'Supabase env vars missing — using placeholder client. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for full functionality.',
  )
  return {
    url: 'https://placeholder.supabase.co',
    anonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.placeholder',
  }
}

export function createClient() {
  if (!client) {
    const { url, anonKey } = getSupabaseCredentials()
    client = createSupabaseClient(url, anonKey)
  }
  return client
}

// Force-create a fresh client (used after logout to clear stale auth state)
export function resetClient() {
  const { url, anonKey } = getSupabaseCredentials()
  client = createSupabaseClient(url, anonKey)
  return client
}
