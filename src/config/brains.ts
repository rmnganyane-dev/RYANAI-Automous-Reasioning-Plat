// src/config/brains.ts
import { ChatOpenAI } from "@langchain/openai";

// Define the local LM Studio server endpoint
const LM_STUDIO_URL = process.env.LM_STUDIO_URL || "http://localhost:1234/v1";

/**
 * Primary Brain: ./models/nvidia
 * Role: Core synthesis, heavy reasoning, and primary context handling.
 */
export const primaryBrain = new ChatOpenAI({
  modelName: "./models/nvidia",
  temperature: 0.2,
  openAIApiKey: "not-needed-for-local", 
  configuration: {
    baseURL: LM_STUDIO_URL,
  },
});

/**
 * Secondary Brain: ./models/qwen
 * Role: Parallel reasoning, cross-checking, and fallback context.
 */
export const secondaryBrain = new ChatOpenAI({
  modelName: "./models/qwen",
  temperature: 0.4,
  openAIApiKey: "not-needed-for-local",
  configuration: {
    baseURL: LM_STUDIO_URL,
  },
});

/**
 * Logic & Processing Brain: ./lmstudio-community
 * Role: Structural parsing, systemic execution pipelines, and ReAct routing.
 */
export const logicBrain = new ChatOpenAI({
  modelName: "./lmstudio-community",
  temperature: 0.1, // Low temp for deterministic structural logic
  openAIApiKey: "not-needed-for-local",
  configuration: {
    baseURL: LM_STUDIO_URL,
  },
});