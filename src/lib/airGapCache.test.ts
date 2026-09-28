import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { airGapCache, saveVector, loadVector, clearVectorCache, VectorEntry } from './airGapCache';

describe('AirGapCache and Vector Operations', () => {
  beforeEach(async () => {
    await clearVectorCache();
  });

  afterEach(() => {
    vi.useRealTimers();
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

    await airGapCache.set(entry.id, entry, 1000);

    // Verify initial entry existence
    const cachedBefore = await airGapCache.get(entry.id);
    expect(cachedBefore).toEqual(entry);

    // Fast-forward time beyond the TTL
    vi.advanceTimersByTime(1050);

    // Await the expired lookup
    const cachedAfter = await airGapCache.get(entry.id);
    expect(cachedAfter).toBeNull();
  });

  it('should clear all cache entries', async () => {
    await saveVector({ id: 'vec-1', vector: [1] });
    await saveVector({ id: 'vec-2', vector: [2] });

    await clearVectorCache();

    expect(await loadVector('vec-1')).toBeNull();
    expect(await loadVector('vec-2')).toBeNull();
  });
});