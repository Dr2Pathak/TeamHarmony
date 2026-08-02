// lib/agents/team-evaluation-pipeline.ts (GROUNDED)
import { runRoleBalanceAgent } from './role-balance'
import { runSkillOverlapAgent } from './skill-overlap'
import { runCommunicationRiskAgent } from './communication-risk'
import { runDeadlineStressAgent } from './deadline-stress'
import { runMBTICompatibilityAgent } from './mbti-compatibility'
import { runMetaAgent } from './meta-agent'
import { computeTeamSignals, type EnrichedMember } from './signals'
import type { AgentScore } from '@/lib/types'

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
  members: EnrichedMember[]
): Promise<TeamEvaluationResult> {
  // 0. Deterministic grounding layer — pure, in-memory, ~0ms, no network/AI.
  //    Runs ONCE, before the fan-out, so it adds no latency to the parallel calls.
  const signals = computeTeamSignals(members)

  // 1. Five grounded agents in parallel — same call count & latency profile as before.
  const [roleBalance, skillOverlap, communicationRisk, deadlineStress, mbtiCompatibility] =
    await Promise.all([
      runRoleBalanceAgent(members, signals.roleBalance),
      runSkillOverlapAgent(members, signals.skillOverlap),
      runCommunicationRiskAgent(members, signals.communicationRisk),
      runDeadlineStressAgent(members, signals.deadlineStress),
      runMBTICompatibilityAgent(members, signals.mbtiCompatibility),
    ])

  // 2. Meta-agent synthesis (unchanged).
  const metaResult = await runMetaAgent(
    { roleBalance, skillOverlap, communicationRisk, deadlineStress, mbtiCompatibility },
    members
  )

  // 3. Build agent scores for DB storage.
  const agentScores: AgentScore[] = [
    { agentName: 'role_balance', ...pick(roleBalance) },
    { agentName: 'skill_overlap', ...pick(skillOverlap) },
    { agentName: 'communication_risk', ...pick(communicationRisk) },
    { agentName: 'deadline_stress', ...pick(deadlineStress) },
    { agentName: 'mbti_compatibility', ...pick(mbtiCompatibility) },
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

function pick(o: { score: number; recommendation: string; strengths: string[]; weaknesses: string[]; explanation: string }) {
  return {
    score: o.score,
    recommendation: o.recommendation,
    strengths: o.strengths,
    weaknesses: o.weaknesses,
    explanation: o.explanation,
  }
}
