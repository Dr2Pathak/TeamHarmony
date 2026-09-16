import { runRoleBalanceAgent } from './role-balance'
import { runSkillOverlapAgent } from './skill-overlap'
import { runCommunicationRiskAgent } from './communication-risk'
import { runDeadlineStressAgent } from './deadline-stress'
import { runMBTICompatibilityAgent } from './mbti-compatibility'
import { runMetaAgent } from './meta-agent'
import type { AgentScore } from '@/lib/types'

interface MemberProfile {
  userId: string
  name: string
  role: string
  canonicalProfile: string
}

interface TeamEvaluationResult {
  weightedScore: number
  classification: 'Stable' | 'Medium' | 'Needs Change'
  recommendation: string
  strengths: string[]
  weaknesses: string[]
  agentScores: AgentScore[]
  memberRecommendations: Array<{
    user_id: string
    name: string
    recommendation: string
    strengths: string[]
    weaknesses: string[]
  }>
}

export async function runTeamEvaluationPipeline(
  memberProfiles: MemberProfile[]
): Promise<TeamEvaluationResult> {
  // 1. Run all 5 agents in parallel
  const [roleBalance, skillOverlap, communicationRisk, deadlineStress, mbtiCompatibility] =
    await Promise.all([
      runRoleBalanceAgent(memberProfiles),
      runSkillOverlapAgent(memberProfiles),
      runCommunicationRiskAgent(memberProfiles),
      runDeadlineStressAgent(memberProfiles),
      runMBTICompatibilityAgent(memberProfiles),
    ])

  // 2. Run meta-agent
  const metaResult = await runMetaAgent(
    { roleBalance, skillOverlap, communicationRisk, deadlineStress, mbtiCompatibility },
    memberProfiles
  )

  // 3. Build agent scores for DB storage
  const agentScores: AgentScore[] = [
    {
      agentName: 'role_balance',
      score: roleBalance.score,
      recommendation: roleBalance.recommendation,
      strengths: roleBalance.strengths,
      weaknesses: roleBalance.weaknesses,
      explanation: roleBalance.explanation,
    },
    {
      agentName: 'skill_overlap',
      score: skillOverlap.score,
      recommendation: skillOverlap.recommendation,
      strengths: skillOverlap.strengths,
      weaknesses: skillOverlap.weaknesses,
      explanation: skillOverlap.explanation,
    },
    {
      agentName: 'communication_risk',
      score: communicationRisk.score,
      recommendation: communicationRisk.recommendation,
      strengths: communicationRisk.strengths,
      weaknesses: communicationRisk.weaknesses,
      explanation: communicationRisk.explanation,
    },
    {
      agentName: 'deadline_stress',
      score: deadlineStress.score,
      recommendation: deadlineStress.recommendation,
      strengths: deadlineStress.strengths,
      weaknesses: deadlineStress.weaknesses,
      explanation: deadlineStress.explanation,
    },
    {
      agentName: 'mbti_compatibility',
      score: mbtiCompatibility.score,
      recommendation: mbtiCompatibility.recommendation,
      strengths: mbtiCompatibility.strengths,
      weaknesses: mbtiCompatibility.weaknesses,
      explanation: mbtiCompatibility.explanation,
    },
  ]

  return {
    weightedScore: metaResult.team_score,
    classification: metaResult.classification,
    recommendation: metaResult.recommendation,
    strengths: metaResult.strengths,
    weaknesses: metaResult.weaknesses,
    agentScores,
    memberRecommendations: metaResult.member_recommendations,
  }
}
