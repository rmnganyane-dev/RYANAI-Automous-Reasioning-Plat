import { describe, it, expect, beforeEach, vi } from 'vitest';
import { airGapCache, saveVector, loadVector, clearVectorCache, VectorEntry } from './airGapCache';

describe('AirGapCache and Vector Operations', () => {
  beforeEach(() => {
    clearVectorCache();
  });

  it('should save and load a vector entry correctly', async () => {
    const entry: VectorEntry = {
      id: 'vec-1',
      vector: [0.1, 0.2, 0.3],
      metadata: { source: 'test' }
    };

    await saveVector(entry);
    const loaded = await loadVector('vec-1');

    expect(loaded).toEqual(entry);
  });

  it('should return null for non-existent keys', async () => {
    const loaded = await loadVector('non-existent');
    expect(loaded).toBeNull();
  });

  it('should expire entries based on TTL', async () => {
    vi.useFakeTimers();
    
    const entry: VectorEntry = {
      id: 'vec-ttl',
      vector: [0.5, 0.6]
    };

    airGapCache.set(entry.id, entry, 1000);
    
    expect(airGapCache.get(entry.id)).toEqual(entry);

    vi.advanceTimersByTime(1050);

    expect(airGapCache.get(entry.id)).toBeNull();

    vi.useRealTimers();
  });

  it('should clear all cache entries', async () => {
    await saveVector({ id: 'vec-1', vector: [1] });
    await saveVector({ id: 'vec-2', vector: [2] });

    clearVectorCache();

    expect(await loadVector('vec-1')).toBeNull();
    expect(await loadVector('vec-2')).toBeNull();
  });
});