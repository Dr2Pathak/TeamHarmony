// ===== PAIRWISE COMPATIBILITY SCORING UTILITIES =====
// All functions are deterministic — no AI calls, no randomness.

export interface StudentData {
  id: string
  email: string
  name: string
  estimatedMbti: string | null
  stabilityScore: number // 0-100
  skills: string[] // parsed from survey_data.skills
}

// ===== MBTI COMPLEMENTARITY (weight: 0.30) =====

// Statically defined ideal complement pairs
const MBTI_COMPLEMENTS: Record<string, string> = {
  INTJ: 'ENFP',
  ENFP: 'INTJ',
  INTP: 'ENTJ',
  ENTJ: 'INTP',
  INFJ: 'ENTP',
  ENTP: 'INFJ',
  INFP: 'ENFJ',
  ENFJ: 'INFP',
  ISTJ: 'ESFP',
  ESFP: 'ISTJ',
  ISFJ: 'ESTP',
  ESTP: 'ISFJ',
  ISTP: 'ESFJ',
  ESFJ: 'ISTP',
  ISFP: 'ESTJ',
  ESTJ: 'ISFP',
}

function countMatchingLetters(a: string, b: string): number {
  let count = 0
  for (let i = 0; i < Math.min(a.length, b.length, 4); i++) {
    if (a[i] === b[i]) count++
  }
  return count
}

export function mbtiScore(mbtiA: string | null, mbtiB: string | null): number {
  if (!mbtiA || !mbtiB || mbtiA.length !== 4 || mbtiB.length !== 4) {
    return 0.5 // default when MBTI is unavailable
  }

  const a = mbtiA.toUpperCase()
  const b = mbtiB.toUpperCase()

  if (a === b) return 0.6
  if (MBTI_COMPLEMENTS[a] === b) return 0.9
  const matching = countMatchingLetters(a, b)
  if (matching === 3) return 0.75
  return 0.5
}

// ===== COMMUNICATION RISK SIMILARITY (weight: 0.25) =====

export function communicationScore(stabilityA: number, stabilityB: number): number {
  // High stability = stability score >= 65
  const highA = stabilityA >= 65
  const highB = stabilityB >= 65

  if (highA && highB) return 0.8
  if (!highA && !highB) return 0.6
  return 0.5 // one high, one low
}

// ===== STABILITY PROXIMITY (weight: 0.25) =====

export function stabilityProximity(stabilityA: number, stabilityB: number): number {
  // Normalize scores to 0-1 range, compute proximity
  const normA = stabilityA / 100
  const normB = stabilityB / 100
  return Math.max(0, Math.min(1, 1 - Math.abs(normA - normB)))
}

// ===== SKILL DIVERSITY (weight: 0.20) =====

function jaccardSimilarity(setA: string[], setB: string[]): number {
  if (setA.length === 0 && setB.length === 0) return 0
  const a = new Set(setA)
  const b = new Set(setB)
  let intersection = 0
  for (const item of a) {
    if (b.has(item)) intersection++
  }
  const union = a.size + b.size - intersection
  return union === 0 ? 0 : intersection / union
}

export function skillDiversityScore(skillsA: string[], skillsB: string[]): number {
  const overlap = jaccardSimilarity(skillsA, skillsB)
  if (overlap > 0.6) return 0.5 // too similar
  if (overlap >= 0.3) return 0.7 // moderate overlap
  return 0.9 // good diversity
}

// ===== COMBINED PAIRWISE COMPATIBILITY =====

export function pairwiseCompatibility(a: StudentData, b: StudentData): number {
  return (
    0.30 * mbtiScore(a.estimatedMbti, b.estimatedMbti) +
    0.25 * communicationScore(a.stabilityScore, b.stabilityScore) +
    0.25 * stabilityProximity(a.stabilityScore, b.stabilityScore) +
    0.20 * skillDiversityScore(a.skills, b.skills)
  )
}

// ===== SKILLS PARSER =====

export function parseSkills(skillsString: string | undefined): string[] {
  if (!skillsString || skillsString.trim().length === 0) return []
  return skillsString
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0)
}
