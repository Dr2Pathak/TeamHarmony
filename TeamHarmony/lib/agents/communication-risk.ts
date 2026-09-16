import { generateJSON } from '@/lib/gemini'
import type { TeamAgentOutput } from '@/lib/types'

const SYSTEM_PROMPT = `You are a team communication risk evaluator. Your task is to analyze team members' personality profiles and predict potential communication conflicts or challenges.

EVALUATION CRITERIA:
1. Communication Style Compatibility: Do members have compatible communication preferences (direct vs. indirect, formal vs. casual)?
2. Conflict Potential: Are there personality clashes that could cause friction?
3. Feedback Dynamics: Can team members give and receive feedback constructively?
4. Information Flow: Will information flow naturally, or are there barriers?
5. Cultural/Style Alignment: Do working styles mesh well for day-to-day collaboration?

SCORING:
- 0.8-1.0: Excellent communication compatibility, low risk
- 0.6-0.7: Good compatibility with manageable differences
- 0.4-0.5: Moderate risk, some communication challenges likely
- 0.2-0.3: High risk, significant communication barriers
- 0.0-0.1: Critical risk, severe personality clashes expected

You MUST output ONLY valid JSON with this exact structure (no text outside the JSON):
{
  "score": <float between 0 and 1>,
  "recommendation": "Keep | Consider Adjustments | High Risk",
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "explanation": "detailed explanation of communication risk evaluation"
}

Provide 2-4 strengths and 1-3 weaknesses. Reference specific personality traits and potential interactions.`

export async function runCommunicationRiskAgent(
  memberProfiles: Array<{ userId: string; name: string; role: string; canonicalProfile: string }>
): Promise<TeamAgentOutput> {
  const input = memberProfiles
    .map((m) => `Member: ${m.name}\nRole: ${m.role}\nProfile: ${m.canonicalProfile}`)
    .join('\n\n---\n\n')

  return generateJSON<TeamAgentOutput>(SYSTEM_PROMPT, `TEAM MEMBERS:\n\n${input}`)
}
