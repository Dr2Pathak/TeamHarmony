// ===== GREEDY GROUP CONSTRUCTION =====
// Algorithm:
// 1. Find highest-compatibility pair from remaining students → start new group
// 2. Greedily add students that maximize average compatibility with current group
// 3. Lock group when full, repeat until all assigned
// Time complexity: O(n³) worst case

export interface GroupResult {
  memberIndices: number[]
  score: number
}

// Compute average pairwise compatibility within a group
export function groupScore(memberIndices: number[], matrix: number[][]): number {
  if (memberIndices.length < 2) return 0
  let total = 0
  let count = 0
  for (let i = 0; i < memberIndices.length; i++) {
    for (let j = i + 1; j < memberIndices.length; j++) {
      total += matrix[memberIndices[i]][memberIndices[j]]
      count++
    }
  }
  return count > 0 ? total / count : 0
}

// Determine group sizes: distribute n students into groups of targetSize.
// Some groups may differ by ±1 if n is not perfectly divisible.
function computeGroupSizes(totalStudents: number, targetSize: number): number[] {
  const numGroups = Math.round(totalStudents / targetSize)
  const actualGroups = Math.max(1, numGroups)
  const baseSize = Math.floor(totalStudents / actualGroups)
  const remainder = totalStudents - baseSize * actualGroups
  const sizes: number[] = []
  for (let i = 0; i < actualGroups; i++) {
    sizes.push(baseSize + (i < remainder ? 1 : 0))
  }
  return sizes
}

export function greedyCluster(matrix: number[][], targetGroupSize: number): GroupResult[] {
  const n = matrix.length
  const groupSizes = computeGroupSizes(n, targetGroupSize)
  const remaining = new Set<number>()
  for (let i = 0; i < n; i++) remaining.add(i)

  const groups: GroupResult[] = []

  for (const size of groupSizes) {
    if (remaining.size === 0) break

    // If only one student left, assign to last group
    if (remaining.size <= size) {
      const memberIndices = Array.from(remaining)
      groups.push({
        memberIndices,
        score: groupScore(memberIndices, matrix),
      })
      remaining.clear()
      break
    }

    // Step a: Find highest compatibility pair from remaining
    let bestI = -1
    let bestJ = -1
    let bestPairScore = -1
    const remainArr = Array.from(remaining)
    for (let a = 0; a < remainArr.length; a++) {
      for (let b = a + 1; b < remainArr.length; b++) {
        const s = matrix[remainArr[a]][remainArr[b]]
        if (s > bestPairScore) {
          bestPairScore = s
          bestI = remainArr[a]
          bestJ = remainArr[b]
        }
      }
    }

    // Step b: Start group with best pair
    const group: number[] = [bestI, bestJ]
    remaining.delete(bestI)
    remaining.delete(bestJ)

    // Step c: Greedily add members that maximize average compatibility
    while (group.length < size && remaining.size > 0) {
      let bestCandidate = -1
      let bestAvg = -1
      for (const candidate of remaining) {
        // Compute average compatibility of candidate with current group
        let sum = 0
        for (const member of group) {
          sum += matrix[candidate][member]
        }
        const avg = sum / group.length
        if (avg > bestAvg) {
          bestAvg = avg
          bestCandidate = candidate
        }
      }
      group.push(bestCandidate)
      remaining.delete(bestCandidate)
    }

    // Step d: Lock group
    groups.push({
      memberIndices: group,
      score: groupScore(group, matrix),
    })
  }

  return groups
}
