/**
 * Helper to safely extract environment variables across Vite (import.meta.env)
 * and Node.js (process.env) runtimes.
 */
function getEnv(key: string, defaultValue = ''): string {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) {
    return import.meta.env[key] as string;
  }
  if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
    return process.env[key] as string;
  }
  return defaultValue;
}

// ==========================================
// Types & Interfaces
// ==========================================

export type ModelProvider = 'nvidia' | 'qwen' | 'openrouter' | 'gateway' | 'together';

export interface ModelCapabilities {
  tools: boolean;
  vision: boolean;
  jsonMode: boolean;
  streaming: boolean;
}

export interface ModelDefinition {
  id: string;
  name: string;
  provider: ModelProvider;
  contextWindow: number;
  maxOutputTokens: number;
  capabilities: ModelCapabilities;
  defaultTemperature: number;
  role?: string;
}

export interface GatewayConfig {
  baseUrl: string;
  apiKeyEnvVar: string;
  timeoutMs: number;
}

export interface RoutingProfile {
  autonomousReasoning: string;
  codeGeneration: string;
  generalInference: string;
  fastInference: string;
  fallback: string;
}

export interface RyanBrain {
  id: string;
  name: string;
  role: string;
  contextWindow: number;
  temperature: number;
  endpoint: string;
  provider: ModelProvider;
}

// ==========================================
// Model Inventory & Gateways
// ==========================================

export const AVAILABLE_MODELS: Record<string, ModelDefinition> = {
  // --- NVIDIA Nemotron Series ---
  'nemotron-3-ultra': {
    id: 'nvidia/nemotron-3-ultra',
    name: 'Nvidia Nemotron 3 Ultra',
    provider: 'nvidia',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    role: 'Primary autonomous reasoning and code synthesis',
    capabilities: {
      tools: true,
      vision: false,
      jsonMode: true,
      streaming: true,
    },
    defaultTemperature: 0.2,
  },
  'nemotron-70b-instruct': {
    id: 'nvidia/llama-3.1-nemotron-70b-instruct',
    name: 'Nemotron 70B Instruct',
    provider: 'nvidia',
    contextWindow: 131072,
    maxOutputTokens: 4096,
    role: 'General autonomous reasoning',
    capabilities: {
      tools: true,
      vision: false,
      jsonMode: true,
      streaming: true,
    },
    defaultTemperature: 0.6,
  },

  // --- Qwen Series ---
  'qwen-3.6-27b': {
    id: 'qwen/qwen-3.6-27b',
    name: 'Qwen 3.6 27B',
    provider: 'together',
    contextWindow: 64000,
    maxOutputTokens: 8192,
    role: 'Secondary multi-agent validation and context caching',
    capabilities: {
      tools: true,
      vision: false,
      jsonMode: true,
      streaming: true,
    },
    defaultTemperature: 0.1,
  },
  'qwen-2.5-72b-instruct': {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B Instruct',
    provider: 'qwen',
    contextWindow: 131072,
    maxOutputTokens: 8192,
    role: 'General inference and orchestration',
    capabilities: {
      tools: true,
      vision: false,
      jsonMode: true,
      streaming: true,
    },
    defaultTemperature: 0.7,
  },
  'qwen-2.5-coder-32b': {
    id: 'qwen/qwen-2.5-coder-32b-instruct',
    name: 'Qwen 2.5 Coder 32B',
    provider: 'qwen',
    contextWindow: 131072,
    maxOutputTokens: 8192,
    role: 'Fast code generation and refactoring',
    capabilities: {
      tools: true,
      vision: false,
      jsonMode: true,
      streaming: true,
    },
    defaultTemperature: 0.2,
  },
};

export const PROVIDER_GATEWAYS: Record<ModelProvider, GatewayConfig> = {
  nvidia: {
    baseUrl: getEnv('VITE_NVIDIA_API_ENDPOINT') || getEnv('NVIDIA_NIM_GATEWAY_URL') || 'https://integrate.api.nvidia.com/v1',
    apiKeyEnvVar: 'NVIDIA_API_KEY',
    timeoutMs: 60000,
  },
  qwen: {
    baseUrl: getEnv('VITE_QWEN_API_ENDPOINT') || getEnv('QWEN_GATEWAY_URL') || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKeyEnvVar: 'DASHSCOPE_API_KEY',
    timeoutMs: 60000,
  },
  together: {
    baseUrl: getEnv('VITE_TOGETHER_API_ENDPOINT') || getEnv('TOGETHER_GATEWAY_URL') || 'https://api.together.xyz/v1',
    apiKeyEnvVar: 'TOGETHER_API_KEY',
    timeoutMs: 60000,
  },
  openrouter: {
    baseUrl: getEnv('VITE_OPENROUTER_API_ENDPOINT') || getEnv('OPENROUTER_GATEWAY_URL') || 'https://openrouter.ai/api/v1',
    apiKeyEnvVar: 'OPENROUTER_API_KEY',
    timeoutMs: 60000,
  },
  gateway: {
    baseUrl: getEnv('VITE_MODEL_GATEWAY_URL') || getEnv('MODEL_GATEWAY_URL') || 'http://localhost:8000/v1',
    apiKeyEnvVar: 'MODEL_GATEWAY_API_KEY',
    timeoutMs: 30000,
  },
};

export const DEFAULT_ROUTING_PROFILE: RoutingProfile = {
  autonomousReasoning: 'nemotron-3-ultra',
  codeGeneration: 'qwen-2.5-coder-32b',
  generalInference: 'qwen-2.5-72b-instruct',
  fastInference: 'qwen-3.6-27b',
  fallback: 'qwen-2.5-72b-instruct',
};

// ==========================================
// RyanBrain High-Level Abstraction
// ==========================================

export const RYANAI_BRAINS = {
  nemotronUltra: {
    id: AVAILABLE_MODELS['nemotron-3-ultra'].id,
    name: AVAILABLE_MODELS['nemotron-3-ultra'].name,
    role: AVAILABLE_MODELS['nemotron-3-ultra'].role!,
    contextWindow: AVAILABLE_MODELS['nemotron-3-ultra'].contextWindow,
    temperature: AVAILABLE_MODELS['nemotron-3-ultra'].defaultTemperature,
    endpoint: PROVIDER_GATEWAYS.nvidia.baseUrl,
    provider: 'nvidia',
  },
  qwen27b: {
    id: AVAILABLE_MODELS['qwen-3.6-27b'].id,
    name: AVAILABLE_MODELS['qwen-3.6-27b'].name,
    role: AVAILABLE_MODELS['qwen-3.6-27b'].role!,
    contextWindow: AVAILABLE_MODELS['qwen-3.6-27b'].contextWindow,
    temperature: AVAILABLE_MODELS['qwen-3.6-27b'].defaultTemperature,
    endpoint: PROVIDER_GATEWAYS.together.baseUrl,
    provider: 'together',
  },
} satisfies Record<string, RyanBrain>;

const configuredPrimary = getEnv('VITE_PRIMARY_REASONING_MODEL');
const configuredSecondary = getEnv('VITE_SECONDARY_REASONING_MODEL');

export function getPrimaryBrain(): RyanBrain {
  return configuredPrimary === RYANAI_BRAINS.qwen27b.id
    ? RYANAI_BRAINS.qwen27b
    : RYANAI_BRAINS.nemotronUltra;
}

export function getSecondaryBrain(): RyanBrain {
  return configuredSecondary === RYANAI_BRAINS.nemotronUltra.id
    ? RYANAI_BRAINS.nemotronUltra
    : RYANAI_BRAINS.qwen27b;
}

// ==========================================
// Task & Gateway Resolvers
// ==========================================

export function getModelForTask(
  task: keyof RoutingProfile,
  profileOverride?: Partial<RoutingProfile>
): ModelDefinition {
  const profile = { ...DEFAULT_ROUTING_PROFILE, ...profileOverride };
  const modelKey = profile[task] || profile.fallback;
  const model = AVAILABLE_MODELS[modelKey];

  if (!model) {
    throw new Error(`Model key '${modelKey}' mapped to task '${task}' is not defined in AVAILABLE_MODELS.`);
  }

  return model;
}

export function getGatewayForModel(model: ModelDefinition): {
  baseUrl: string;
  apiKey: string | undefined;
  timeoutMs: number;
} {
  const gateway = PROVIDER_GATEWAYS[model.provider];
  return {
    baseUrl: gateway.baseUrl,
    apiKey: getEnv(gateway.apiKeyEnvVar) || getEnv(`VITE_${gateway.apiKeyEnvVar}`),
    timeoutMs: gateway.timeoutMs,
  };
}