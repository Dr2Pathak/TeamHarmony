// lib/agents/communication-risk.ts (GROUNDED)
import { runGroundedTeamAgent } from './grounded'
import type { EnrichedMember, AgentSignal } from './signals'
import type { TeamAgentOutput } from '@/lib/types'

const SYSTEM_PROMPT = `You are a team communication risk evaluator. You are given DETERMINISTIC stability-based pairwise communication scores and each member's STRUCTURED survey answers (speaking comfort 1-5, conflict style, decision style). Use these authoritative signals — do NOT infer communication style from prose when a structured answer is provided.

Your job: assess style compatibility, conflict potential, feedback dynamics, and information-flow risk, then produce a score anchored to the baseline.

Output ONLY valid JSON:
{
  "score": <float 0-1, anchored to the deterministic baseline>,
  "recommendation": "Keep | Consider Adjustments | High Risk",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "explanation": "cite the speaking-comfort spread and conflict/decision styles you were given"
}
Provide 2-4 strengths and 1-3 weaknesses.`

export async function runCommunicationRiskAgent(
  members: EnrichedMember[],
  signal: AgentSignal
): Promise<TeamAgentOutput> {
  const block = members
    .map((m) => `Member: ${m.name}\nRole: ${m.role}\nProfile: ${m.canonicalProfile}`)
    .join('\n\n---\n\n')
  return runGroundedTeamAgent(SYSTEM_PROMPT, block, signal)
}
