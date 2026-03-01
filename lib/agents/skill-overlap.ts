import { generateJSON } from '@/lib/gemini'
import type { TeamAgentOutput } from '@/lib/types'

const SYSTEM_PROMPT = `You are a team skill overlap evaluator. Your task is to analyze a team's collective skillset and evaluate whether skills complement each other effectively.

EVALUATION CRITERIA:
1. Complementarity: Do team members' skills fill different niches?
2. Coverage: Does the team collectively have the breadth of skills needed?
3. Depth: Are there areas of deep expertise where needed?
4. Overlap: Is overlap strategic (for collaboration) or wasteful (redundant)?
5. Synergy: Can team members learn from each other and amplify each other's abilities?

SCORING:
- 0.8-1.0: Excellent skill distribution, strong complementarity
- 0.6-0.7: Good skill mix with minor redundancies or gaps
- 0.4-0.5: Moderate issues — too much overlap or significant skill gaps
- 0.2-0.3: Poor skill distribution, critical gaps or excessive redundancy
- 0.0-0.1: Skills are nearly identical or completely mismatched

You MUST output ONLY valid JSON with this exact structure (no text outside the JSON):
{
  "score": <float between 0 and 1>,
  "recommendation": "Keep | Consider Adjustments | High Risk",
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "explanation": "detailed explanation of skill overlap evaluation"
}

Provide 2-4 strengths and 1-3 weaknesses. Reference specific skills and team members.`

export async function runSkillOverlapAgent(
  memberProfiles: Array<{ userId: string; name: string; role: string; canonicalProfile: string }>
): Promise<TeamAgentOutput> {
  const input = memberProfiles
    .map((m) => `Member: ${m.name}\nRole: ${m.role}\nProfile: ${m.canonicalProfile}`)
    .join('\n\n---\n\n')

  return generateJSON<TeamAgentOutput>(SYSTEM_PROMPT, `TEAM MEMBERS:\n\n${input}`)
}
