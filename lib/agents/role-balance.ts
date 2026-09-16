import { generateJSON } from '@/lib/gemini'
import type { TeamAgentOutput } from '@/lib/types'

const SYSTEM_PROMPT = `You are a team role balance evaluator. Your task is to analyze a team's composition and evaluate whether the roles are well-balanced for effective collaboration.

EVALUATION CRITERIA:
1. Role Diversity: Does the team have a good mix of different roles (e.g., technical, creative, management, analytical)?
2. Coverage: Are critical functions covered (leadership, execution, quality assurance, communication)?
3. Redundancy: Is there appropriate overlap for resilience without excessive duplication?
4. Gaps: Are there missing roles that could hurt the team's effectiveness?
5. Balance: Is the team skewed too heavily toward one type of role?

SCORING:
- 0.8-1.0: Excellent role balance, all critical functions covered
- 0.6-0.7: Good balance with minor gaps
- 0.4-0.5: Moderate imbalance, some important roles missing
- 0.2-0.3: Poor balance, significant gaps
- 0.0-0.1: Critical roles missing, team likely dysfunctional

You MUST output ONLY valid JSON with this exact structure (no text outside the JSON):
{
  "score": <float between 0 and 1>,
  "recommendation": "Keep | Consider Adjustments | High Risk",
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "explanation": "detailed explanation of role balance evaluation"
}

Provide 2-4 strengths and 1-3 weaknesses. Reference specific team members and their roles.`

export async function runRoleBalanceAgent(
  memberProfiles: Array<{ userId: string; name: string; role: string; canonicalProfile: string }>
): Promise<TeamAgentOutput> {
  const input = memberProfiles
    .map((m) => `Member: ${m.name}\nRole: ${m.role}\nProfile: ${m.canonicalProfile}`)
    .join('\n\n---\n\n')

  return generateJSON<TeamAgentOutput>(SYSTEM_PROMPT, `TEAM MEMBERS:\n\n${input}`)
}
