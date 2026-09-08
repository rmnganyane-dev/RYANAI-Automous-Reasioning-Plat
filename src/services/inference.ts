// src/services/inference.ts
import { invoke } from '@tauri-apps/api/core';

export async function dispatchInference(prompt: string): Promise<string> {
  try {
    const response = await invoke<string>('dispatch_inference', { prompt });
    return response;
  } catch (error) {
    console.error('Failed to dispatch inference via Tauri IPC:', error);
    throw new Error(typeof error === 'string' ? error : 'Inference dispatch failed');
  }
}