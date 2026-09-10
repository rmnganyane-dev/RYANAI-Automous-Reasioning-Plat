/**
 * Safely extracts environment variables across Vite (import.meta.env)
 * and Node.js (process.env) runtimes, auto-prefixing VITE_ where needed.
 */
export declare function getEnv(key: string, defaultValue?: string): string;

export type ModelProvider = 'nvidia' | 'qwen' | 'together' | 'openrouter' | 'gateway' | 'local';

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

export interface ModelProfile {
  id: string;
  name: string;
  provider: ModelProvider;
  role: string;
  endpoint: string;
  contextWindow: number;
  temperature: number;
  apiKey?: string;
}

export type RyanBrain = ModelProfile;

export declare const PROVIDER_GATEWAYS: Record<ModelProvider, GatewayConfig>;
export declare const AVAILABLE_MODELS: Record<string, ModelDefinition>;
export declare const DEFAULT_ROUTING_PROFILE: RoutingProfile;
export declare const RYANAI_BRAINS: Record<string, ModelProfile>;

export declare class ProviderGateway {
  /**
   * Retrieves the primary reasoning engine.
   * Route to Nemotron Ultra if API key is present; falls back to local deterministic execution otherwise.
   */
  static getPrimaryBrain(): ModelProfile;
  /**
   * Retrieves the secondary validation engine.
   */
  static getSecondaryBrain(): ModelProfile;
  /**
   * Constructs request headers for API calls.
   */
  static buildHeaders(profile: ModelProfile): HeadersInit;
}

export declare function getPrimaryBrain(): ModelProfile;
export declare function getSecondaryBrain(): ModelProfile;
export declare function getModelForTask(
  task: keyof RoutingProfile,
  profileOverride?: Partial<RoutingProfile>
): ModelDefinition;
export declare function getGatewayForModel(model: ModelDefinition): {
  baseUrl: string;
  apiKey: string | undefined;
  timeoutMs: number;
};