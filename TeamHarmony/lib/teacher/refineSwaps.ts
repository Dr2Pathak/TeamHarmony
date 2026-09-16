// ===== LOCAL SWAP REFINEMENT =====
// After greedy construction, attempt pairwise swaps between groups.
// If swapping two students from different groups improves total score, keep the swap.
// Repeat until a full pass yields no improvement.

import { groupScore, type GroupResult } from './greedyCluster'

function totalScore(groups: GroupResult[]): number {
  if (groups.length === 0) return 0
  return groups.reduce((sum, g) => sum + g.score, 0) / groups.length
}

export function refineSwaps(groups: GroupResult[], matrix: number[][]): GroupResult[] {
  // Deep copy groups
  const refined: GroupResult[] = groups.map((g) => ({
    memberIndices: [...g.memberIndices],
    score: g.score,
  }))

  let improved = true
  let iterations = 0
  const maxIterations = 100 // safety cap

  while (improved && iterations < maxIterations) {
    improved = false
    iterations++

    // Try all pairs of students from different groups
    for (let gi = 0; gi < refined.length; gi++) {
      for (let gj = gi + 1; gj < refined.length; gj++) {
        for (let mi = 0; mi < refined[gi].memberIndices.length; mi++) {
          for (let mj = 0; mj < refined[gj].memberIndices.length; mj++) {
            const currentTotal = totalScore(refined)

            // Swap
            const tmp = refined[gi].memberIndices[mi]
            refined[gi].memberIndices[mi] = refined[gj].memberIndices[mj]
            refined[gj].memberIndices[mj] = tmp

            // Recompute scores for affected groups
            const newScoreI = groupScore(refined[gi].memberIndices, matrix)
            const newScoreJ = groupScore(refined[gj].memberIndices, matrix)

            const oldScoreI = refined[gi].score
            const oldScoreJ = refined[gj].score

            refined[gi].score = newScoreI
            refined[gj].score = newScoreJ

            const newTotal = totalScore(refined)

            if (newTotal > currentTotal + 1e-9) {
              // Keep swap
              improved = true
            } else {
              // Revert swap
              refined[gj].memberIndices[mj] = refined[gi].memberIndices[mi]
              refined[gi].memberIndices[mi] = tmp
              refined[gi].score = oldScoreI
              refined[gj].score = oldScoreJ
            }
          }
        }
      }
    }
  }

  return refined
}
