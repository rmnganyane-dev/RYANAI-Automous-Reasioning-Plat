export interface CacheEntry<T = unknown> {
  value: T;
  expiry: number;
}

export interface VectorEntry {
  id: string;
  vector: number[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AirGapCacheOptions {
  ttl?: number;
  namespace?: string;
  fallbackValue?: unknown;
  [key: string]: unknown;
}

export declare function saveVector(entry: VectorEntry): Promise<void>;

export declare function loadVector(id: string): Promise<VectorEntry | null>;

export declare function deleteVector(id: string): Promise<void>;

export declare function clearVectorCache(): Promise<void>;

export declare function clearCache(): Promise<void>;

export declare class AirGapCache {
  constructor(options?: AirGapCacheOptions);
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  clear(): Promise<void>;
}

export declare const airGapCache: AirGapCache;