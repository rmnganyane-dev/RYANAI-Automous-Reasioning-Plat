export interface RyanBrain {
  id: string;
  name: string;
  role: string;
  contextWindow: number;
  temperature: number;
  endpoint: string;
}

export const RYANAI_BRAINS = {
  nemotronUltra: {
    id: 'nvidia/nemotron-3-ultra',
    name: 'Nvidia Nemotron 3 Ultra',
    role: 'Primary autonomous reasoning and code synthesis',
    contextWindow: 128000,
    temperature: 0.2,
    endpoint: import.meta.env.VITE_NVIDIA_API_ENDPOINT || 'https://integrate.api.nvidia.com/v1',
  },
  qwen27b: {
    id: 'qwen/qwen-3.6-27b',
    name: 'Qwen 3.6 27B',
    role: 'Secondary multi-agent validation and context caching',
    contextWindow: 64000,
    temperature: 0.1,
    endpoint: import.meta.env.VITE_QWEN_API_ENDPOINT || 'https://api.together.xyz/v1',
  },
} satisfies Record<string, RyanBrain>;

const configuredPrimary = import.meta.env.VITE_PRIMARY_REASONING_MODEL;
const configuredSecondary = import.meta.env.VITE_SECONDARY_REASONING_MODEL;

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