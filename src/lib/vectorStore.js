import { airGapCache, saveVector, loadVector, deleteVector } from './airGapCache';
export class AirGapVectorStore {
    ids = new Set();
    async save(entry) {
        await saveVector(entry);
        this.ids.add(entry.id);
    }
    async get(id) {
        return loadVector(id);
    }
    async remove(id) {
        await deleteVector(id);
        this.ids.delete(id);
    }
    async similaritySearch(queryVector, topK = 5) {
        const results = [];
        for (const id of this.ids) {
            const entry = await loadVector(id);
            if (entry && entry.vector) {
                const score = this.cosineSimilarity(queryVector, entry.vector);
                results.push({ id, score, entry });
            }
        }
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }
    cosineSimilarity(a, b) {
        if (a.length !== b.length || a.length === 0)
            return 0;
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
    clear() {
        airGapCache.clear();
        this.ids.clear();
    }
}
export const vectorStore = new AirGapVectorStore();
