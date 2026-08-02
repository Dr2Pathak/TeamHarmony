// lib/agents/skill-overlap.ts (GROUNDED)
import { runGroundedTeamAgent } from './grounded'
import type { EnrichedMember, AgentSignal } from './signals'
import type { TeamAgentOutput } from '@/lib/types'

const SYSTEM_PROMPT = `You are a team skill overlap evaluator. You are given DETERMINISTIC pairwise skill-diversity scores (via Jaccard) and the team's combined skill coverage. These numbers are authoritative — do NOT recompute them.

Your job: interpret complementarity vs redundancy, coverage breadth, and gaps from the provided signals plus each profile, then produce a score anchored to the baseline.

Output ONLY valid JSON:
{
  "score": <float 0-1, anchored to the deterministic baseline>,
  "recommendation": "Keep | Consider Adjustments | High Risk",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "explanation": "reference specific pairwise diversity scores and the coverage set"
}
Provide 2-4 strengths and 1-3 weaknesses.`

export async function runSkillOverlapAgent(
  members: EnrichedMember[],
  signal: AgentSignal
): Promise<TeamAgentOutput> {
  const block = members
    .map((m) => `Member: ${m.name}\nRole: ${m.role}\nSkills: ${m.skills.join(', ') || 'none listed'}\nProfile: ${m.canonicalProfile}`)
    .join('\n\n---\n\n')
  return runGroundedTeamAgent(SYSTEM_PROMPT, block, signal)
}
