// lib/agents/mbti-compatibility.ts (GROUNDED)
import { runGroundedTeamAgent } from './grounded'
import type { EnrichedMember, AgentSignal } from './signals'
import type { TeamAgentOutput } from '@/lib/types'

const SYSTEM_PROMPT = `You are an MBTI team compatibility evaluator. You are given DETERMINISTIC, pre-computed pairwise complementarity scores and the team's axis balance. These numbers are authoritative — do NOT recompute or second-guess them.

Your job: interpret the deterministic signals, add qualitative insight from each member's profile, and produce a score anchored to the provided baseline.

EVALUATION LENS: type diversity, T/F and S/N and E/I and J/P balance, and any clashing pairings visible in the pairwise scores.

Output ONLY valid JSON (no text outside it):
{
  "score": <float 0-1, anchored to the deterministic baseline>,
  "recommendation": "Keep | Consider Adjustments | High Risk",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "explanation": "cite the specific pairwise scores and axis balance you were given"
}
Provide 2-4 strengths and 1-3 weaknesses.`

export async function runMBTICompatibilityAgent(
  members: EnrichedMember[],
  signal: AgentSignal
): Promise<TeamAgentOutput> {
  const block = members
    .map((m) => `Member: ${m.name}\nRole: ${m.role}\nMBTI: ${m.estimatedMbti ?? 'unknown'}\nProfile: ${m.canonicalProfile}`)
    .join('\n\n---\n\n')
  return runGroundedTeamAgent(SYSTEM_PROMPT, block, signal)
}
