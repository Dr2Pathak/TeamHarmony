import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export function getGeminiModel(modelName: string = 'gemini-2.5-flash') {
  return genAI.getGenerativeModel({ model: modelName })
}

export function getEmbeddingModel() {
  return genAI.getGenerativeModel({ model: 'text-embedding-004' })
}

export async function generateJSON<T>(systemPrompt: string, userInput: string): Promise<T> {
  const model = getGeminiModel()
  const result = await model.generateContent({
    contents: [
      { role: 'user', parts: [{ text: `${systemPrompt}\n\n---\n\nINPUT:\n${userInput}` }] },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
      // Disable thinking to reduce latency (~3x faster)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...({ thinkingConfig: { thinkingBudget: 0 } } as any),
    },
  })
  const text = result.response.text()
  return JSON.parse(text) as T
}

export async function getEmbedding(text: string): Promise<number[]> {
  const model = getEmbeddingModel()
  const result = await model.embedContent(text)
  return result.embedding.values
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export function computePairwiseSimilarities(embeddings: number[][]): number[] {
  const similarities: number[] = []
  for (let i = 0; i < embeddings.length; i++) {
    for (let j = i + 1; j < embeddings.length; j++) {
      similarities.push(cosineSimilarity(embeddings[i], embeddings[j]))
    }
  }
  return similarities
}

export function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}
