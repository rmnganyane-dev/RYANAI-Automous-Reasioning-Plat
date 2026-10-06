// src/config/brains.ts
import { ChatOpenAI } from "@langchain/openai";

const apiKey = (providerKey?: string) =>
  providerKey || process.env.OPENAI_API_KEY || process.env.LM_STUDIO_API_KEY || 'local-runtime';

function createBrain(
  modelName: string,
  temperature: number,
  baseURL: string,
  key?: string,
) {
  return new ChatOpenAI({
    modelName,
    temperature,
    openAIApiKey: apiKey(key),
    configuration: { baseURL },
  });
}

export const primaryBrain = createBrain(
  process.env.PRIMARY_REASONING_MODEL || process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra',
  0.2,
  process.env.NVIDIA_API_ENDPOINT || process.env.LM_STUDIO_URL || 'https://integrate.api.nvidia.com/v1',
  process.env.NVIDIA_API_KEY,
);

export const secondaryBrain = createBrain(
  process.env.SECONDARY_REASONING_MODEL || process.env.QWEN_MODEL || 'Qwen/Qwen3-235B-A22B-Instruct-2507',
  0.4,
  process.env.QWEN_API_ENDPOINT || process.env.LM_STUDIO_URL || 'https://api.together.xyz/v1',
  process.env.QWEN_API_KEY,
);

export const logicBrain = createBrain(
  process.env.LOGIC_REASONING_MODEL || process.env.LM_STUDIO_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini',
  0.1,
  process.env.LOGIC_API_ENDPOINT || process.env.LM_STUDIO_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  process.env.LOGIC_API_KEY || process.env.LM_STUDIO_API_KEY || process.env.OPENAI_API_KEY,
);