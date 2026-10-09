import {
  clearCache,
  VectorEntry,
  saveVector,
  loadVector,
  deleteVector,
} from './airGapCache';

export interface SearchResult {
  id: string;
  score: number;
  entry: VectorEntry;
}

export class AirGapVectorStore {
  private ids: Set<string> = new Set();

  async save(entry: VectorEntry): Promise<void> {
    await saveVector(entry);
    this.ids.add(entry.id);
  }

  async get(id: string): Promise<VectorEntry | null> {
    return loadVector(id);
  }

  async remove(id: string): Promise<void> {
    await deleteVector(id);
    this.ids.delete(id);
  }

  /**
   * Rank persisted vectors whose IDs were saved through this instance by cosine score.
   * Missing records are skipped; storage/decryption errors reject. Empty, mismatched,
   * or zero-norm vectors score zero. Results use slice(0, topK), including its
   * negative-index behavior when topK is negative.
   */
  async similaritySearch(
    queryVector: number[],
    topK = 5,
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const id of this.ids) {
      const entry = await loadVector(id);
      if (entry && entry.vector) {
        const score = this.cosineSimilarity(queryVector, entry.vector);
        results.push({ id, score, entry });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Clear all persisted vectors and the shared cache, then this instance's search IDs.
   * Rejects on persistence failure without clearing the search IDs.
   */
  async clear(): Promise<void> {
    await clearCache();
    this.ids.clear();
  }
}

export const vectorStore = new AirGapVectorStore();
