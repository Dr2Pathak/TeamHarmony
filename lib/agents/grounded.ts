// ============================================================================
// lib/agents/grounded.ts
// ----------------------------------------------------------------------------
// Wraps a single Gemini call (no extra round-trips — latency identical to the
// old generateJSON path) with two guarantees the old agents lacked:
//
//   1. ANCHORING — the LLM's score is clamped to [baseline-band, baseline+band].
//      The deterministic layer owns the numeric backbone; the LLM supplies
//      qualitative nuance and may nudge within the band. This directly fixes
//      the README's own limitation ("scoring sensitive to prompt variations").
//
//   2. FALLBACK — if Gemini returns malformed JSON, we degrade to the
//      deterministic baseline instead of throwing and killing the whole
//      evaluation. Robustness at no latency cost.
// ============================================================================

import { generateJSON } from '@/lib/gemini'
import type { TeamAgentOutput } from '@/lib/types'
import type { AgentSignal } from './signals'

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x))
}

function anchor(score: number, signal: AgentSignal): number {
  const lo = clamp01(signal.baseline - signal.band)
  const hi = clamp01(signal.baseline + signal.band)
  return Math.max(lo, Math.min(hi, clamp01(score)))
}

/**
 * Run one grounded team agent. Single LLM call. The signal's facts + baseline
 * are injected; the returned score is anchored to the deterministic baseline.
 */
export async function runGroundedTeamAgent(
  systemPrompt: string,
  memberBlock: string,
  signal: AgentSignal
): Promise<TeamAgentOutput> {
  const userInput =
    `${signal.facts}\n\n` +
    `Anchor your score to the deterministic baseline above. You MAY deviate up to ` +
    `±${signal.band.toFixed(2)} based on qualitative profile evidence, but not beyond it.\n\n` +
    `TEAM MEMBERS:\n\n${memberBlock}`

  try {
    const raw = await generateJSON<TeamAgentOutput>(systemPrompt, userInput)
    return {
      score: anchor(typeof raw.score === 'number' ? raw.score : signal.baseline, signal),
      recommendation: raw.recommendation ?? recommendationFor(signal.baseline),
      strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
      weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses : [],
      explanation: raw.explanation ?? 'Derived from deterministic signals.',
    }
  } catch {
    // Graceful degrade to the deterministic baseline.
    return {
      score: clamp01(signal.baseline),
      recommendation: recommendationFor(signal.baseline),
      strengths: [],
      weaknesses: [],
      explanation:
        'LLM synthesis unavailable; score reflects the deterministic baseline computed from stored profile signals.',
    }
  }
}

function recommendationFor(baseline: number): 'Keep' | 'Consider Adjustments' | 'High Risk' {
  if (baseline >= 0.65) return 'Keep'
  if (baseline >= 0.45) return 'Consider Adjustments'
  return 'High Risk'
}
