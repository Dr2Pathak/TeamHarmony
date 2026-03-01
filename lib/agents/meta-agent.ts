import { generateJSON } from '@/lib/gemini'
import type { TeamAgentOutput, MetaAgentOutput } from '@/lib/types'

const WEIGHTS = {
  role_balance: 0.25,
  skill_overlap: 0.20,
  communication_risk: 0.20,
  deadline_stress: 0.20,
  mbti_compatibility: 0.15,
}

export async function runMetaAgent(
  agentOutputs: {
    roleBalance: TeamAgentOutput
    skillOverlap: TeamAgentOutput
    communicationRisk: TeamAgentOutput
    deadlineStress: TeamAgentOutput
    mbtiCompatibility: TeamAgentOutput
  },
  memberProfiles: Array<{ userId: string; name: string; role: string; canonicalProfile: string }>
): Promise<MetaAgentOutput> {
  // 1. Compute weighted score
  const weightedScore =
    WEIGHTS.role_balance * agentOutputs.roleBalance.score +
    WEIGHTS.skill_overlap * agentOutputs.skillOverlap.score +
    WEIGHTS.communication_risk * agentOutputs.communicationRisk.score +
    WEIGHTS.deadline_stress * agentOutputs.deadlineStress.score +
    WEIGHTS.mbti_compatibility * agentOutputs.mbtiCompatibility.score

  // 2. Check if any agent scored below 0.3
  const allScores = [
    agentOutputs.roleBalance.score,
    agentOutputs.skillOverlap.score,
    agentOutputs.communicationRisk.score,
    agentOutputs.deadlineStress.score,
    agentOutputs.mbtiCompatibility.score,
  ]
  const anyBelowThreshold = allScores.some((s) => s < 0.3)

  // 3. Classify
  let classification: 'Stable' | 'Medium' | 'Needs Change'
  if (weightedScore >= 0.65 && !anyBelowThreshold) {
    classification = 'Stable'
  } else if (weightedScore < 0.65 || anyBelowThreshold) {
    classification = 'Needs Change'
  } else {
    classification = 'Medium'
  }

  // Refine: if score is borderline (0.55-0.65) and no agent is below 0.3, call it Medium
  if (weightedScore >= 0.55 && weightedScore < 0.65 && !anyBelowThreshold) {
    classification = 'Medium'
  }

  // 4. Use Gemini to generate overall recommendation and per-member recommendations
  const systemPrompt = `You are a meta-evaluation agent for team compatibility. You are given the results from 5 specialized evaluation agents and must produce a final team assessment.

AGENT RESULTS:
- Role Balance (weight 25%): Score ${agentOutputs.roleBalance.score.toFixed(2)} - ${agentOutputs.roleBalance.explanation}
- Skill Overlap (weight 20%): Score ${agentOutputs.skillOverlap.score.toFixed(2)} - ${agentOutputs.skillOverlap.explanation}
- Communication Risk (weight 20%): Score ${agentOutputs.communicationRisk.score.toFixed(2)} - ${agentOutputs.communicationRisk.explanation}
- Deadline Stress (weight 20%): Score ${agentOutputs.deadlineStress.score.toFixed(2)} - ${agentOutputs.deadlineStress.explanation}
- MBTI Compatibility (weight 15%): Score ${agentOutputs.mbtiCompatibility.score.toFixed(2)} - ${agentOutputs.mbtiCompatibility.explanation}

WEIGHTED SCORE: ${weightedScore.toFixed(3)}
CLASSIFICATION: ${classification}

TEAM MEMBERS:
${memberProfiles.map((m) => `- ${m.name} (${m.role}) [userId: ${m.userId}]`).join('\n')}

You MUST output ONLY valid JSON with this exact structure:
{
  "team_score": ${weightedScore.toFixed(3)},
  "classification": "${classification}",
  "recommendation": "A comprehensive recommendation for the team (2-3 sentences)",
  "strengths": ["team-level strength 1", "team-level strength 2", ...],
  "weaknesses": ["team-level weakness 1", "team-level weakness 2", ...],
  "member_recommendations": [
    {
      "user_id": "userId",
      "name": "member name",
      "recommendation": "specific recommendation for this member (1-2 sentences)",
      "strengths": ["member strength 1", ...],
      "weaknesses": ["member weakness 1", ...]
    }
  ]
}

RULES:
- Merge recurring strengths from all agents into team-level strengths (3-5 items)
- Merge recurring weaknesses from all agents into team-level weaknesses (2-4 items)
- Provide specific, actionable per-member recommendations
- Each member should have 1-3 strengths and 1-2 weaknesses
- The team_score and classification MUST match the values provided above`

  const memberInput = memberProfiles
    .map((m) => `Member: ${m.name} (${m.role})\nProfile: ${m.canonicalProfile}`)
    .join('\n\n')

  const result = await generateJSON<MetaAgentOutput>(systemPrompt, memberInput)

  // Ensure the score and classification match our computed values
  result.team_score = weightedScore
  result.classification = classification

  return result
}
