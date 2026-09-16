// ===== DATABASE ROW TYPES =====

export interface DbUser {
  id: string
  auth_id: string
  name: string
  email: string
  role: string
  resume_text: string
  survey_data: SurveyData
  audio_transcript: string
  canonical_profile: CanonicalProfile | null
  personality_stability_score: number | null
  personality_confidence_level: string | null
  estimated_mbti: string | null
  personality_recommendation: string
  personality_strengths: string[]
  personality_weaknesses: string[]
  profile_complete: boolean
  created_at: string
  updated_at: string
}

export interface DbTeam {
  id: string
  owner_user_id: string
  name: string
  description: string
  confirmed: boolean
  team_stability_score: number | null
  team_classification: string | null
  team_recommendation: string
  team_strengths: string[]
  team_weaknesses: string[]
  created_at: string
  updated_at: string
}

export interface DbTeamMember {
  id: string
  team_id: string
  user_id: string
  member_recommendation: string
  member_strengths: string[]
  member_weaknesses: string[]
  created_at: string
}

export interface DbAgentScore {
  id: string
  team_id: string
  agent_name: string
  score: number
  strengths: string[]
  weaknesses: string[]
  explanation: string
  recommendation: string
  created_at: string
}

// ===== SURVEY DATA =====

export interface SurveyData {
  groupRole?: string
  decisionMaking?: string
  deadline?: string
  conflict?: string
  organized?: string
  speakingUp?: string
  skills?: string
  frustrations?: string
}

// ===== CANONICAL PROFILE =====

export interface CanonicalProfile {
  name: string
  resumeSummary: string
  audioTranscriptSummary: string
  surveyResponses: SurveyData
  combinedNarrative: string
}

// ===== AGENT OUTPUT TYPES =====

export interface TraitConsistencyOutput {
  score: number
  strengths: string[]
  weaknesses: string[]
  explanation: string
}

export interface MBTIEstimationOutput {
  estimated_mbti: string
  confidence: number
  strengths: string[]
  weaknesses: string[]
  explanation: string
}

export interface TeamAgentOutput {
  score: number
  recommendation: string
  strengths: string[]
  weaknesses: string[]
  explanation: string
}

export interface MetaAgentOutput {
  team_score: number
  classification: 'Stable' | 'Medium' | 'Needs Change'
  recommendation: string
  strengths: string[]
  weaknesses: string[]
  member_recommendations: Array<{
    user_id: string
    name: string
    recommendation: string
    strengths: string[]
    weaknesses: string[]
  }>
}

// ===== CLIENT-SIDE TYPES =====

export interface PersonalityStability {
  score: number
  confidenceLevel: string
  recommendation: string
  strengths: string[]
  weaknesses: string[]
}

export interface User {
  id: string
  authId: string
  email: string
  name: string
  role: string
  profileComplete: boolean
  personalityStability: PersonalityStability
  canonicalProfile: CanonicalProfile | null
  resumeText: string
  audioTranscript: string
  surveyData: SurveyData
  createdAt: string
}

export interface TeamMember {
  id: string
  userId: string
  name: string
  role: string
  personalityStability: PersonalityStability
  memberRecommendation: string
  memberStrengths: string[]
  memberWeaknesses: string[]
}

export interface AgentScore {
  agentName: string
  score: number
  recommendation: string
  strengths: string[]
  weaknesses: string[]
  explanation: string
}

export interface TeamEvaluation {
  stabilityScore: number
  classification: 'Stable' | 'Medium' | 'Needs Change'
  recommendation: string
  strengths: string[]
  weaknesses: string[]
  agentScores: AgentScore[]
}

export interface Team {
  id: string
  name: string
  description: string
  ownerId: string
  confirmed: boolean
  members: TeamMember[]
  teamEvaluation: TeamEvaluation | null
  createdAt: string
  updatedAt: string
}

// ===== FORM DATA TYPES =====

export interface ProfileFormData {
  name: string
  email: string
  surveyGroupRole?: string
  surveyDecisionMaking?: string
  surveyDeadline?: string
  surveyConflict?: string
  surveyOrganized?: string
  surveySpeakingUp?: string
  surveySkills?: string
  surveyFrustrations?: string
}

export interface TeamFormData {
  name: string
  description?: string
}

// ===== HELPER: Map DB row to client types =====

export function mapDbUserToUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    authId: dbUser.auth_id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    profileComplete: dbUser.profile_complete,
    personalityStability: {
      score: dbUser.personality_stability_score ?? 0,
      confidenceLevel: dbUser.personality_confidence_level ?? '',
      recommendation: dbUser.personality_recommendation,
      strengths: dbUser.personality_strengths ?? [],
      weaknesses: dbUser.personality_weaknesses ?? [],
    },
    canonicalProfile: dbUser.canonical_profile,
    resumeText: dbUser.resume_text,
    audioTranscript: dbUser.audio_transcript,
    surveyData: dbUser.survey_data ?? {},
    createdAt: dbUser.created_at,
  }
}

export function mapDbTeamToTeam(
  dbTeam: DbTeam,
  members: TeamMember[],
  agentScores: AgentScore[]
): Team {
  const hasEvaluation = dbTeam.confirmed && dbTeam.team_stability_score !== null

  return {
    id: dbTeam.id,
    name: dbTeam.name,
    description: dbTeam.description ?? '',
    ownerId: dbTeam.owner_user_id,
    confirmed: dbTeam.confirmed,
    members,
    teamEvaluation: hasEvaluation
      ? {
          stabilityScore: Number(dbTeam.team_stability_score),
          classification: (dbTeam.team_classification as TeamEvaluation['classification']) ?? 'Medium',
          recommendation: dbTeam.team_recommendation,
          strengths: dbTeam.team_strengths ?? [],
          weaknesses: dbTeam.team_weaknesses ?? [],
          agentScores,
        }
      : null,
    createdAt: dbTeam.created_at,
    updatedAt: dbTeam.updated_at,
  }
}

export function mapDbMemberToTeamMember(
  dbMember: DbTeamMember,
  dbUser: DbUser
): TeamMember {
  return {
    id: dbMember.id,
    userId: dbUser.id,
    name: dbUser.name,
    role: dbUser.role,
    personalityStability: {
      score: dbUser.personality_stability_score ?? 0,
      confidenceLevel: dbUser.personality_confidence_level ?? '',
      recommendation: dbUser.personality_recommendation,
      strengths: dbUser.personality_strengths ?? [],
      weaknesses: dbUser.personality_weaknesses ?? [],
    },
    memberRecommendation: dbMember.member_recommendation,
    memberStrengths: dbMember.member_strengths ?? [],
    memberWeaknesses: dbMember.member_weaknesses ?? [],
  }
}

export function mapDbAgentScore(dbScore: DbAgentScore): AgentScore {
  return {
    agentName: dbScore.agent_name,
    score: Number(dbScore.score),
    recommendation: dbScore.recommendation,
    strengths: dbScore.strengths ?? [],
    weaknesses: dbScore.weaknesses ?? [],
    explanation: dbScore.explanation,
  }
}
