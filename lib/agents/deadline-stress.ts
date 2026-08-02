// lib/agents/deadline-stress.ts (GROUNDED)
import { runGroundedTeamAgent } from './grounded'
import type { EnrichedMember, AgentSignal } from './signals'
import type { TeamAgentOutput } from '@/lib/types'

const SYSTEM_PROMPT = `You are a team deadline-stress evaluator. You are given DETERMINISTIC signals: each member's stability score (crisis-resilience proxy), self-rated organization (1-5), and stated deadline behavior. These are authoritative inputs.

Your job: assess stress resilience, time management, crisis response, procrastination risk, and support dynamics, then produce a score anchored to the baseline.

Output ONLY valid JSON:
{
  "score": <float 0-1, anchored to the deterministic baseline>,
  "recommendation": "Keep | Consider Adjustments | High Risk",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "explanation": "cite the stability scores, organization ratings, and deadline behaviors you were given"
}
Provide 2-4 strengths and 1-3 weaknesses.`

export async function runDeadlineStressAgent(
  members: EnrichedMember[],
  signal: AgentSignal
): Promise<TeamAgentOutput> {
  const block = members
    .map((m) => `Member: ${m.name}\nRole: ${m.role}\nProfile: ${m.canonicalProfile}`)
    .join('\n\n---\n\n')
  return runGroundedTeamAgent(SYSTEM_PROMPT, block, signal)
}
