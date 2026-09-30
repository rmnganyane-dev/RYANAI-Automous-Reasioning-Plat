// src/shared/types.ts - Unified type definitions across app
export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'staging';
  port: number;
  host: string;
  database: {
    url: string;
    maxConnections: number;
    timeoutMs: number;
  };
  redis: {
    url: string;
    timeout: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  mcp: {
    enabled: boolean;
    serverPort: number;
  };
  openai: {
    apiKey: string;
    model: string;
  };
  sentry: {
    enabled: boolean;
    dsn: string;
  };
  tauri: {
    enabled: boolean;
    allowedOrigins: string[];
  };
}

export interface AuthContext {
  userId: string;
  email: string;
  name: string;
  roles: string[];
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
}

export interface APIRequest<T = any> {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: T;
  headers?: Record<string, string>;
  auth?: AuthContext;
  timestamp: number;
}

export interface APIResponse<T = any> {
  id: string;
  status: number;
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: number;
  duration: number;
}

export interface WebSocketMessage<T = any> {
  id: string;
  type: 'request' | 'response' | 'event' | 'stream' | 'error';
  channel: string;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: number;
}

export interface ReasoningRequest {
  prompt: string;
  sessionId: string;
  context?: Record<string, any>;
  maxTokens?: number;
  temperature?: number;
}

export interface ReasoningResponse {
  result: string;
  reasoning: string[];
  confidence: number;
  toolCalls: ToolCall[];
  sessionId: string;
  duration: number;
}

export interface ToolCall {
  toolName: string;
  arguments: Record<string, any>;
  result?: any;
  error?: string;
}

export interface AgentState {
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
  }>;
  context: Record<string, any>;
  status: 'idle' | 'processing' | 'paused' | 'completed' | 'error';
  lastUpdate: number;
}

export interface StreamEvent<T = any> {
  type: 'start' | 'chunk' | 'progress' | 'complete' | 'error';
  data?: T;
  metadata?: Record<string, any>;
  timestamp: number;
}

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super('AUTH_ERROR', message, 401);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}
