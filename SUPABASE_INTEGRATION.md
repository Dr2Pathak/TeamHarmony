# TeamHarmony - Supabase Integration Guide

This document outlines how to connect the TeamHarmony frontend to Supabase for data persistence and authentication.

## Prerequisites

- Supabase project created at https://supabase.com
- Environment variables configured in your Vercel project or `.env.local`

## Environment Variables

Add the following environment variables to your project:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Only for server-side operations
```

## Database Schema

Create the following tables in your Supabase database:

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR,
  bio TEXT,
  resume_url VARCHAR,
  audio_url VARCHAR,
  survey_score INTEGER,
  personality_stability JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Teams Table
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  is_confirmed BOOLEAN DEFAULT FALSE,
  evaluation JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Team Members Table
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);
```

## Integration Points

### 1. Authentication Context (`contexts/AuthContext.tsx`)

The Auth Context is prepared for Supabase integration. To connect:

```typescript
// Import Supabase
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// In the login method:
const login = useCallback(async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  // Set user data from response
}, [])

// In the register method:
const register = useCallback(async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  // Create user profile in users table
  await supabase.from('users').insert({
    id: data.user?.id,
    email,
    name,
  })
}, [])

// In the logout method:
const logout = useCallback(async () => {
  await supabase.auth.signOut()
  setUser(null)
}, [])
```

### 2. Profile Updates (`contexts/AuthContext.tsx`)

Update the `updateProfile` method:

```typescript
const updateProfile = useCallback(async (updates: Partial<User>) => {
  if (!user) return
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
  if (error) throw error
  setUser({ ...user, ...updates })
}, [user])
```

### 3. Team Management (`contexts/TeamContext.tsx`)

Connect team operations to Supabase:

```typescript
// Create team
const createTeam = useCallback(async (name: string, description?: string) => {
  const { data, error } = await supabase
    .from('teams')
    .insert([{ name, description }])
    .select()
  if (error) throw error
  setTeams([...teams, data[0]])
  return data[0]
}, [teams])

// Fetch teams
const fetchTeams = useCallback(async () => {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      team_members(
        id,
        user_id,
        users(name, role, personality_stability)
      )
    `)
  if (error) throw error
  setTeams(data || [])
}, [])

// Add member to team
const addMemberToTeam = useCallback(async (teamId: string, userId: string) => {
  const { error } = await supabase
    .from('team_members')
    .insert([{ team_id: teamId, user_id: userId }])
  if (error) throw error
}, [])

// Remove member from team
const removeMemberFromTeam = useCallback(async (teamId: string, userId: string) => {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .match({ team_id: teamId, user_id: userId })
  if (error) throw error
}, [])
```

### 4. Row Level Security (RLS)

Enable RLS policies for data protection:

```sql
-- Users can only see their own profile
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can view teams they're part of
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their teams"
  ON teams
  FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

-- Team members visibility
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team members of their teams"
  ON team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND (
        teams.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members tm2
          WHERE tm2.team_id = teams.id
          AND tm2.user_id = auth.uid()
        )
      )
    )
  );
```

## Implementation Steps

1. **Set up Supabase project** with the database schema above
2. **Configure environment variables** in your Vercel project
3. **Install Supabase client**: `npm install @supabase/supabase-js`
4. **Create `lib/supabase.ts`**:

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

5. **Update contexts** to use Supabase client as shown above
6. **Test authentication** by attempting login/register
7. **Verify data persistence** in Supabase dashboard

## Key Features Ready for Integration

- Authentication (login, register, logout)
- User profiles with personality data
- Team creation and management
- Team member management (add, remove, swap)
- Team evaluation and confirmation
- All data validation through Zod schemas

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code
- Use RLS policies to restrict data access
- Validate all inputs on both client and server
- Use Supabase JWT tokens for authenticated requests
- Keep session tokens in HTTP-only cookies when possible

## Testing Checklist

- [ ] Users can register with email/password
- [ ] Users can login and logout
- [ ] User profiles persist after updates
- [ ] Teams are created and listed correctly
- [ ] Team members can be added/removed
- [ ] Team data is properly scoped to team members
- [ ] Personality stability data displays correctly
- [ ] Team evaluations are calculated and stored

## Support

For Supabase documentation, visit: https://supabase.com/docs
For questions about this frontend, refer to the component files and context providers.
