// src/lib/models.ts
// LLM model definitions and metadata

import type { ModelId } from './types.js';

export interface ModelMeta {
  id: ModelId;
  label: string;
  provider: string;
  maxTokens: number;
  costPer1kTokens: number;
  description: string;
}

export const MODELS: Record<ModelId, ModelMeta> = {
  'claude-sonnet-4.6': {
    id: 'claude-sonnet-4.6',
    label: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    maxTokens: 200000,
    costPer1kTokens: 0.003,
    description: 'Fast and capable model by Anthropic',
  },
  'gpt-5.4': {
    id: 'gpt-5.4',
    label: 'GPT-5.4',
    provider: 'OpenAI',
    maxTokens: 128000,
    costPer1kTokens: 0.002,
    description: 'Advanced reasoning model by OpenAI',
  },
  'gemini-3.1-pro': {
    id: 'gemini-3.1-pro',
    label: 'Gemini 3.1 Pro',
    provider: 'Google',
    maxTokens: 2000000,
    costPer1kTokens: 0.001,
    description: 'Large context model by Google',
  },
};

export const MODEL_LIST: ModelId[] = Object.keys(MODELS) as ModelId[];

export function modelMeta(modelId?: ModelId): ModelMeta {
  if (!modelId || !MODELS[modelId]) {
    return MODELS['claude-sonnet-4.6'];
  }
  return MODELS[modelId];
}

export function getAvailableModels(): ModelMeta[] {
  return MODEL_LIST.map((id) => MODELS[id]);
}