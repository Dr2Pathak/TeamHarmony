# Supabase Integration Guide for TeamHarmony Frontend

This document provides a comprehensive guide for integrating the TeamHarmony frontend with Supabase backend services.

## Current State

The frontend is fully prepared for Supabase integration with:
- Type definitions for all data models
- Validation schemas using Zod
- Context-based state management ready for async operations
- Mock data and functions ready to be replaced with Supabase calls
- Proper component structure with clear integration points

## Integration Points

### 1. Authentication (Auth Context)

**File**: `context/auth-context.tsx`

Replace these mock functions with Supabase Auth:

```typescript
// Current: Mock login
const login = async (data: LoginFormData) => {
  // TODO: Replace with:
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });
  
  if (error) throw error;
  
  // Fetch user profile from 'profiles' table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();
    
  setCurrentUser(profile);
};
```

**Supabase Tables Needed**:
- `auth.users` (built-in)
- `profiles` table with user profile data
- `personality_stability` table or JSON field

### 2. Profile Management

**File**: `components/profile/profile-form.tsx`

Replace update profile function:

```typescript
const updateProfile = async (data: ProfileFormData) => {
  // Upload resume and audio files to Supabase Storage
  let resumeUrl = null;
  if (data.resume) {
    const { data: uploadData } = await supabase.storage
      .from('resumes')
      .upload(`${currentUser.id}/${data.resume.name}`, data.resume);
    resumeUrl = uploadData?.path;
  }
  
  // Update profile record
  const { error } = await supabase
    .from('profiles')
    .update({
      name: data.name,
      role: data.role,
      survey: data.survey,
      resume_url: resumeUrl,
      profile_complete: true,
    })
    .eq('id', currentUser.id);
    
  if (error) throw error;
};
```

**Supabase Tables & Storage**:
- `profiles` table
- `storage/resumes` bucket for file uploads

### 3. Team Operations (Team Context)

**File**: `context/team-context.tsx`

Replace these functions with Supabase queries:

```typescript
const fetchTeams = async () => {
  const { data, error } = await supabase
    .from('teams')
    .select('*, team_members(*, user_personality_stability(*))')
    .eq('created_by', currentUserId);
    
  if (error) throw error;
  setTeams(data || []);
};

const createTeam = async (data: TeamFormData) => {
  const { data: newTeam, error } = await supabase
    .from('teams')
    .insert([{
      name: data.name,
      description: data.description,
      created_by: currentUserId,
    }])
    .select()
    .single();
    
  if (error) throw error;
  return newTeam;
};

const addMember = async (teamId: string, member: TeamMember) => {
  const { error } = await supabase
    .from('team_members')
    .insert([{
      team_id: teamId,
      user_id: member.userId,
      added_at: new Date(),
    }]);
    
  if (error) throw error;
};

const confirmTeam = async (teamId: string) => {
  // Call Supabase Edge Function to trigger evaluation
  const { data, error } = await supabase.functions.invoke('evaluate-team', {
    body: { team_id: teamId },
  });
  
  if (error) throw error;
  return data;
};
```

**Supabase Tables & Functions**:
- `teams` table
- `team_members` table
- `user_personality_stability` table
- `evaluate-team` Edge Function for evaluation logic

## Database Schema

### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT,
  survey TEXT,
  resume_url TEXT,
  profile_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### personality_stability
```sql
CREATE TABLE personality_stability (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  recommendation TEXT,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### teams
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  evaluation_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### team_members
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  added_at TIMESTAMP DEFAULT NOW()
);
```

### team_evaluations
```sql
CREATE TABLE team_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  stability_score INTEGER CHECK (stability_score >= 0 AND stability_score <= 100),
  overall_harmony INTEGER,
  recommendation TEXT,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Row Level Security (RLS)

Add these RLS policies to protect user data:

```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can see teams they created
CREATE POLICY "Users can view own teams"
  ON teams FOR SELECT
  USING (auth.uid() = created_by);

-- Users can see team members of their teams
CREATE POLICY "Users can view team members of own teams"
  ON team_members FOR SELECT
  USING (
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  );
```

## Environment Variables

Add these to your Vercel project environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Integration Checklist

- [ ] Create Supabase project
- [ ] Run database migrations to create tables
- [ ] Set up RLS policies
- [ ] Configure authentication methods
- [ ] Create storage buckets for resumes/audio
- [ ] Deploy Edge Functions for team evaluation
- [ ] Update Auth Context with Supabase auth calls
- [ ] Update Team Context with Supabase queries
- [ ] Test authentication flow
- [ ] Test team CRUD operations
- [ ] Test team evaluation trigger
- [ ] Set up monitoring and error handling

## Key Components Ready for Integration

1. **Auth Context** (`context/auth-context.tsx`)
   - Login/Register/Logout functions
   - Profile completion tracking
   - Custom hook: `useAuth()`

2. **Team Context** (`context/team-context.tsx`)
   - Team CRUD operations
   - Member management (add/remove/swap)
   - Evaluation triggering
   - Custom hook: `useTeams()`

3. **Type System** (`lib/types.ts`)
   - Fully typed User, Team, TeamMember, TeamEvaluation
   - Ready for direct Supabase integration

4. **Validation** (`lib/validation-schemas.ts`)
   - Zod schemas for all forms
   - Pre-validation before backend calls

## Mock Data Location

Mock data is currently defined in:
- `context/team-context.tsx` - mockTeams array
- `components/teams/member-selection-modal.tsx` - mockAvailableMembers array
- `components/profile/profile-form.tsx` - mockPersonalityData

Replace these with Supabase queries when ready.

## Testing with Mock Data

The frontend is fully functional with mock data. This allows you to:
1. Test the UI/UX workflow
2. Verify form validation
3. Test state management
4. Ensure responsive design works

Then gradually replace mock functions with real Supabase calls.

## Support

For questions about Supabase integration patterns, refer to:
- [Supabase JavaScript SDK](https://supabase.com/docs/reference/javascript)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
