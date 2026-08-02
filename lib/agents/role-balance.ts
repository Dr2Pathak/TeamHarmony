// lib/agents/role-balance.ts (GROUNDED)
import { runGroundedTeamAgent } from './grounded'
import type { EnrichedMember, AgentSignal } from './signals'
import type { TeamAgentOutput } from '@/lib/types'

const SYSTEM_PROMPT = `You are a team role-balance evaluator. You are given DETERMINISTIC signals: the count of distinct assigned roles and distinct self-described group roles, plus each member's role data. The baseline here is SOFT — role balance needs human-style judgment, so you may lead with your reading of the profiles while staying within the allowed band.

Your job: assess role diversity, coverage of critical functions, redundancy, and gaps.

Output ONLY valid JSON:
{
  "score": <float 0-1, within the band around the baseline>,
  "recommendation": "Keep | Consider Adjustments | High Risk",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "explanation": "reference the role/stance variety and specific members"
}
Provide 2-4 strengths and 1-3 weaknesses.`

export async function runRoleBalanceAgent(
  members: EnrichedMember[],
  signal: AgentSignal
): Promise<TeamAgentOutput> {
  const block = members
    .map((m) => `Member: ${m.name}\nRole: ${m.role}\nProfile: ${m.canonicalProfile}`)
    .join('\n\n---\n\n')
  return runGroundedTeamAgent(SYSTEM_PROMPT, block, signal)
}
