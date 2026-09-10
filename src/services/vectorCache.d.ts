export declare class VectorCacheManager {
    private redisClient;
    private pgPool;
    constructor(redisUrl: string, connectionString: string);
    getCachedResponse(embedding: number[]): Promise<string | null>;
}
