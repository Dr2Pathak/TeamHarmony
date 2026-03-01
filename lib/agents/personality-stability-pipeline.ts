import { runTraitConsistencyAgent } from './trait-consistency'
import { runMBTIEstimationAgent } from './mbti-estimation'
import { generateJSON } from '@/lib/gemini'

interface PersonalityStabilityResult {
  score: number
  confidenceLevel: string
  recommendation: string
  strengths: string[]
  weaknesses: string[]
  estimatedMbti: string
}

function scoreVariance(scores: number[]): number {
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length
  return variance
}

export async function runPersonalityStabilityPipeline(
  canonicalProfile: string
): Promise<PersonalityStabilityResult> {
  // 1. Run ALL 6 agent calls in parallel (3 trait + 3 MBTI)
  const [trait1, trait2, trait3, mbti1, mbti2, mbti3] = await Promise.all([
    runTraitConsistencyAgent(canonicalProfile),
    runTraitConsistencyAgent(canonicalProfile),
    runTraitConsistencyAgent(canonicalProfile),
    runMBTIEstimationAgent(canonicalProfile),
    runMBTIEstimationAgent(canonicalProfile),
    runMBTIEstimationAgent(canonicalProfile),
  ])
  const traitRuns = [trait1, trait2, trait3]
  const mbtiRuns = [mbti1, mbti2, mbti3]

  // 3. Compute trait score consistency (low variance = high consistency)
  const traitScores = traitRuns.map((r) => r.score)
  const traitVariance = scoreVariance(traitScores)
  const traitConsistency = Math.max(0, 1 - traitVariance * 4) // variance of 0.25 = 0 consistency

  // 4. Compute MBTI agreement
  const mbtiTypes = mbtiRuns.map((r) => r.estimated_mbti)
  const mbtiCounts = mbtiTypes.reduce(
    (acc, type) => {
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  const mostCommonMBTI = Object.entries(mbtiCounts).sort((a, b) => b[1] - a[1])[0]
  const mbtiAgreement = mostCommonMBTI[1] / 3 // 1.0 if all agree, 0.67 if 2/3, 0.33 if none

  // 5. Average trait scores and MBTI confidence
  const avgTraitScore = traitScores.reduce((a, b) => a + b, 0) / traitScores.length
  const avgMbtiConfidence = mbtiRuns.reduce((a, r) => a + r.confidence, 0) / mbtiRuns.length

  // 6. Compute final stability score (0-100)
  // Weighted: 35% avg trait score, 25% trait consistency, 25% MBTI agreement, 15% MBTI confidence
  const rawScore = avgTraitScore * 0.35 + traitConsistency * 0.25 + mbtiAgreement * 0.25 + avgMbtiConfidence * 0.15
  const stabilityScore = Math.round(Math.min(1, rawScore) * 100)

  // 7. Determine confidence level
  let confidenceLevel: string
  if (stabilityScore >= 75) {
    confidenceLevel = 'High'
  } else if (stabilityScore >= 50) {
    confidenceLevel = 'Medium'
  } else {
    confidenceLevel = 'Low'
  }

  // 8. Aggregate into final recommendation using Gemini
  const aggregationPrompt = `You are a personality stability summarizer. Given multiple runs of personality analysis, produce a final summary.

TRAIT CONSISTENCY RESULTS (3 runs):
${traitRuns.map((r, i) => `Run ${i + 1}: Score=${r.score.toFixed(2)}, Strengths=${JSON.stringify(r.strengths)}, Weaknesses=${JSON.stringify(r.weaknesses)}`).join('\n')}

MBTI ESTIMATION RESULTS (3 runs):
${mbtiRuns.map((r, i) => `Run ${i + 1}: Type=${r.estimated_mbti}, Confidence=${r.confidence.toFixed(2)}, Strengths=${JSON.stringify(r.strengths)}, Weaknesses=${JSON.stringify(r.weaknesses)}`).join('\n')}

STABILITY SCORE: ${stabilityScore}/100
CONFIDENCE LEVEL: ${confidenceLevel}
MOST COMMON MBTI: ${mostCommonMBTI[0]} (${mostCommonMBTI[1]}/3 agreement)

You MUST output ONLY valid JSON:
{
  "recommendation": "A comprehensive recommendation about this person's personality stability (2-3 sentences)",
  "strengths": ["merged strength 1", "merged strength 2", ...],
  "weaknesses": ["merged weakness 1", "merged weakness 2", ...]
}

RULES:
- Merge recurring strengths across all runs (3-5 final strengths)
- Merge recurring weaknesses across all runs (2-4 final weaknesses)
- The recommendation should reference the stability score and MBTI type
- Be specific and actionable`

  const aggregation = await generateJSON<{
    recommendation: string
    strengths: string[]
    weaknesses: string[]
  }>(aggregationPrompt, canonicalProfile)

  return {
    score: stabilityScore,
    confidenceLevel,
    recommendation: aggregation.recommendation,
    strengths: aggregation.strengths,
    weaknesses: aggregation.weaknesses,
    estimatedMbti: mostCommonMBTI[0],
  }
}
