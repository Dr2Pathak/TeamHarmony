// ============================================================================
// lib/agents/signals.ts
// ----------------------------------------------------------------------------
// The deterministic grounding layer. Pure, in-memory, O(n²), zero network,
// zero AI calls. Runs ONCE before the parallel agent fan-out, so it adds no
// measurable latency (sub-millisecond for realistic team sizes).
//
// Each agent gets an AgentSignal: a deterministic baseline score it must anchor
// to, an allowed deviation band, and a pre-formatted "facts" block of real
// numbers to reason over instead of hallucinating them.
// ============================================================================

import { mbtiScore, skillDiversityScore, parseSkills } from '@/lib/teacher/scoringUtils'
import type { SurveyData } from '@/lib/types'

// Enriched member — carries the structured fields the confirm route already
// has in memory (estimated_mbti, stability, survey), so agents stop parsing
// them back out of the canonicalProfile string.
export interface EnrichedMember {
  userId: string
  memberId?: string
  name: string
  role: string
  canonicalProfile: string
  estimatedMbti: string | null
  stabilityScore: number // 0-100
  skills: string[]
  survey: SurveyData
}

export interface AgentSignal {
  baseline: number // deterministic team score in [0,1]
  band: number // max the LLM may deviate from baseline (tighter = more deterministic)
  facts: string // ground-truth block injected into the agent prompt
}

export interface TeamSignals {
  roleBalance: AgentSignal
  skillOverlap: AgentSignal
  communicationRisk: AgentSignal
  deadlineStress: AgentSignal
  mbtiCompatibility: AgentSignal
}

// ---- helpers ---------------------------------------------------------------

function pairs<T>(items: T[]): Array<[T, T]> {
  const out: Array<[T, T]> = []
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++) out.push([items[i], items[j]])
  return out
}

function avg(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x))
}

function num(s: string | undefined, fallback = 3): number {
  const n = parseInt((s ?? '').trim(), 10)
  return Number.isFinite(n) ? n : fallback
}

// ---- MBTI compatibility (strong determinism) -------------------------------

function mbtiSignal(members: EnrichedMember[]): AgentSignal {
  const ps = pairs(members)
  const pairScores = ps.map(([a, b]) => ({
    a,
    b,
    s: mbtiScore(a.estimatedMbti, b.estimatedMbti),
  }))
  const baseline = ps.length ? avg(pairScores.map((p) => p.s)) : 0.6

  // Axis distribution across the team (E/I, S/N, T/F, J/P).
  const axes = [
    ['E', 'I'],
    ['S', 'N'],
    ['T', 'F'],
    ['J', 'P'],
  ]
  const valid = members.filter((m) => m.estimatedMbti && m.estimatedMbti.length === 4)
  const dist = axes
    .map(([x, y], i) => {
      const cx = valid.filter((m) => m.estimatedMbti![i].toUpperCase() === x).length
      const cy = valid.filter((m) => m.estimatedMbti![i].toUpperCase() === y).length
      return `${x}/${y}=${cx}/${cy}`
    })
    .join(', ')

  const lines = pairScores
    .map((p) => `  ${p.a.name}(${p.a.estimatedMbti ?? '?'})–${p.b.name}(${p.b.estimatedMbti ?? '?'}): ${p.s.toFixed(2)}`)
    .join('\n')

  return {
    baseline,
    band: 0.12,
    facts:
      `DETERMINISTIC MBTI SIGNALS (computed, authoritative):\n` +
      `Pairwise complementarity (0.9 ideal complement, 0.75 = 3/4 differ, 0.6 identical, 0.5 unknown):\n${lines || '  (single member)'}\n` +
      `Team axis balance: ${dist || 'n/a'}\n` +
      `Deterministic baseline team score: ${baseline.toFixed(3)}`,
  }
}

// ---- Skill overlap (strong determinism) ------------------------------------

function skillSignal(members: EnrichedMember[]): AgentSignal {
  const ps = pairs(members)
  const pairScores = ps.map(([a, b]) => ({
    a,
    b,
    s: skillDiversityScore(a.skills, b.skills),
  }))
  const baseline = ps.length ? avg(pairScores.map((p) => p.s)) : 0.6

  const union = Array.from(new Set(members.flatMap((m) => m.skills)))
  const lines = pairScores
    .map((p) => `  ${p.a.name}–${p.b.name}: ${p.s.toFixed(2)} (${p.a.skills.length} vs ${p.b.skills.length} skills)`)
    .join('\n')

  return {
    baseline,
    band: 0.12,
    facts:
      `DETERMINISTIC SKILL SIGNALS (computed, authoritative):\n` +
      `Pairwise diversity (0.9 diverse, 0.7 moderate, 0.5 too similar):\n${lines || '  (single member)'}\n` +
      `Combined skill coverage (${union.length} distinct): ${union.join(', ') || 'none listed'}\n` +
      `Deterministic baseline team score: ${baseline.toFixed(3)}`,
  }
}

// ---- Communication risk (medium determinism) -------------------------------
// Deterministic core = stability-based communicationScore; enriched with the
// structured speaking-comfort / conflict / decision survey fields so the LLM
// reasons over real answers instead of guessing styles from prose.

function communicationSignal(members: EnrichedMember[]): AgentSignal {
  const ps = pairs(members)
  const commScore = (sa: number, sb: number) =>
    sa >= 65 && sb >= 65 ? 0.8 : sa < 65 && sb < 65 ? 0.6 : 0.5
  const pairScores = ps.map(([a, b]) => commScore(a.stabilityScore, b.stabilityScore))
  const baseline = ps.length ? avg(pairScores) : 0.6

  const perMember = members
    .map(
      (m) =>
        `  ${m.name}: speaking-comfort=${num(m.survey.speakingUp)}/5, ` +
        `conflict="${(m.survey.conflict ?? 'n/a').slice(0, 40)}", ` +
        `decision="${(m.survey.decisionMaking ?? 'n/a').slice(0, 40)}"`
    )
    .join('\n')

  return {
    baseline,
    band: 0.15,
    facts:
      `DETERMINISTIC COMMUNICATION SIGNALS (computed):\n` +
      `Stability-based pairwise comm scores avg: ${baseline.toFixed(3)}\n` +
      `Structured survey signals (authoritative — use these, don't infer style):\n${perMember}\n` +
      `Deterministic baseline team score: ${baseline.toFixed(3)}`,
  }
}

// ---- Deadline stress (medium determinism) ----------------------------------
// Baseline = blend of stability (crisis resilience proxy) and self-rated
// organization; enriched with the actual deadline-behavior survey text.

function deadlineSignal(members: EnrichedMember[]): AgentSignal {
  const stab = avg(members.map((m) => m.stabilityScore / 100))
  const org = avg(members.map((m) => num(m.survey.organized) / 5))
  const baseline = clamp01(0.6 * stab + 0.4 * org)

  const perMember = members
    .map(
      (m) =>
        `  ${m.name}: stability=${m.stabilityScore}/100, organized=${num(m.survey.organized)}/5, ` +
        `deadline-behavior="${(m.survey.deadline ?? 'n/a').slice(0, 50)}"`
    )
    .join('\n')

  return {
    baseline,
    band: 0.15,
    facts:
      `DETERMINISTIC DEADLINE/STRESS SIGNALS (computed):\n` +
      `Team avg stability=${(stab * 100).toFixed(0)}/100, avg self-organization=${(org * 5).toFixed(1)}/5\n` +
      `Per-member (authoritative):\n${perMember}\n` +
      `Deterministic baseline team score: ${baseline.toFixed(3)}`,
  }
}

// ---- Role balance (soft determinism → wider band) --------------------------
// No clean numeric target; baseline = coverage/variety index from the actual
// groupRole survey answers + assigned roles. Band is wide so the LLM leads.

function roleSignal(members: EnrichedMember[]): AgentSignal {
  const roleVariety = new Set(members.map((m) => (m.role || '').toLowerCase())).size
  const stanceVariety = new Set(
    members.map((m) => (m.survey.groupRole ?? '').toLowerCase().trim()).filter(Boolean)
  ).size
  const n = Math.max(members.length, 1)
  // Reward variety but saturate — all-identical is bad, some spread is good.
  const variety = (roleVariety / n + (stanceVariety || 1) / n) / 2
  const baseline = clamp01(0.45 + 0.4 * variety)

  const perMember = members
    .map((m) => `  ${m.name}: assigned-role="${m.role}", self-described-group-role="${m.survey.groupRole ?? 'n/a'}"`)
    .join('\n')

  return {
    baseline,
    band: 0.2,
    facts:
      `DETERMINISTIC ROLE SIGNALS (computed):\n` +
      `Distinct assigned roles: ${roleVariety}/${n}; distinct self-described group roles: ${stanceVariety}/${n}\n` +
      `Per-member (authoritative):\n${perMember}\n` +
      `Deterministic baseline team score: ${baseline.toFixed(3)} (soft — use profile judgment to adjust within band)`,
  }
}

export function computeTeamSignals(members: EnrichedMember[]): TeamSignals {
  return {
    roleBalance: roleSignal(members),
    skillOverlap: skillSignal(members),
    communicationRisk: communicationSignal(members),
    deadlineStress: deadlineSignal(members),
    mbtiCompatibility: mbtiSignal(members),
  }
}
