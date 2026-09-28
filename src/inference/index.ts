// src/inference/index.ts

import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// TypeScript interface matching native C++ module exports in cuda_engine.cpp
interface NativeCudaEngine {
  executeInference(prompt: string): string;
  executeCUDAInference(payload: string): string;
  isCudaAvailable(): boolean;
}

let cudaEngine: NativeCudaEngine | null = null;

// Attempt to load compiled C++ native addon targets
try {
  cudaEngine = require('../../build/Release/ryan_cuda_engine.node') as NativeCudaEngine;
  console.log("[Hardware] Native CUDA Engine (ryan_cuda_engine) loaded successfully.");
} catch (_err1) {
  try {
    cudaEngine = require('../../build/Release/cuda_inference_bridge.node') as NativeCudaEngine;
    console.log("[Hardware] CUDA Inference Bridge (cuda_inference_bridge) loaded successfully.");
  } catch (_err2) {
    console.warn("[Hardware] Native CUDA bindings not loaded. Run 'npm run build:native'. Operating in CPU Fallback mode.");
  }
}

/**
 * Offloads compute-heavy task vectors to the native C++ module (JSON Payload mode)
 */
export const runHardwareInference = (payload: string): string => {
  if (cudaEngine && typeof cudaEngine.executeCUDAInference === 'function') {
    try {
      return cudaEngine.executeCUDAInference(payload);
    } catch (error) {
      console.error("[Hardware] Error during CUDA inference execution:", error);
    }
  }

  // CPU Fallback logic
  return JSON.stringify({
    cuda_status: "offline",
    fallback: "cpu_simulated",
    compute_time_ms: 0.1,
    processed_payload: payload
  });
};

/**
 * Executes tensor embedding inference via C++ CUDA binding
 */
export const runTensorInference = (prompt: string): string => {
  if (cudaEngine && typeof cudaEngine.executeInference === 'function') {
    try {
      return cudaEngine.executeInference(prompt);
    } catch (error) {
      console.error("[Hardware] Error during Tensor inference execution:", error);
    }
  }

  // CPU Fallback logic
  return `[CPU Engine] Simulated tensor embeddings for: "${prompt}". Hardware latency: 0.05ms (Fallback).`;
};

/**
 * Checks if native CUDA hardware acceleration is active and available
 */
export const isCudaHardwareAvailable = (): boolean => {
  if (cudaEngine && typeof cudaEngine.isCudaAvailable === 'function') {
    return cudaEngine.isCudaAvailable();
  }
  return false;
};