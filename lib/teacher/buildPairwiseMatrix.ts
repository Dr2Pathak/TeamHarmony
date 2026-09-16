import { pairwiseCompatibility, type StudentData } from './scoringUtils'

// Build a symmetric pairwise compatibility matrix.
// matrix[i][j] = compatibility score between student i and student j.
// Diagonal is 0 (no self-compatibility).
// Time complexity: O(n²)
export function buildPairwiseMatrix(students: StudentData[]): number[][] {
  const n = students.length
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const score = pairwiseCompatibility(students[i], students[j])
      matrix[i][j] = score
      matrix[j][i] = score
    }
  }

  return matrix
}
