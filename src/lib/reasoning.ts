import type { ModelId, ToolStep } from './types';
import { uid } from './storage';
import { getPrimaryBrain } from '@/config/models';
import { AUTONOMOUS_REASONING_SKILL } from '@/config/reasoningSkill';

export interface StreamCallbacks {
  onToken: (text: string) => void;
  onStep: (step: ToolStep) => void;
  onTitle: (title: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}

const REASONING_TEMPLATES: Record<ModelId, string[]> = {
  'gemini-3.1-pro': [
    'Analyzing input across {n} semantic dimensions...',
    'Cross-referencing with persistent memory graph...',
    'Decomposing into {n} sub-tasks for parallel evaluation...',
    'Synthesizing multimodal context window (2M tokens)...',
    'Selecting optimal response strategy from {n} candidates...',
  ],
  'claude-sonnet-4.6': [
    'Parsing intent and constructing reasoning chain...',
    'Evaluating tool requirements against available capabilities...',
    'Executing ReAct loop — observation → thought → action...',
    'Checking memory for relevant prior context...',
    'Composing structured response with tool-augmented data...',
  ],
  'gpt-5.4': [
    'Allocating adaptive compute budget for reasoning...',
    'Running chain-of-thought with {n} intermediate steps...',
    'Querying knowledge base and persistent memory layer...',
    'Validating response against safety and accuracy constraints...',
    'Streaming final synthesis with confidence scoring...',
  ],
};

const TOOL_NAMES = ['web_search', 'calculator', 'memory_recall', 'code_executor'] as const;
const TOOL_LABELS: Record<string, string> = {
  web_search: 'Web Search',
  calculator: 'Calculator',
  memory_recall: 'Memory Recall',
  code_executor: 'Code Executor',
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shouldUseTools(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('search') ||
    lower.includes('find') ||
    lower.includes('what') ||
    lower.includes('latest') ||
    lower.includes('news') ||
    lower.includes('calculate') ||
    lower.includes('compute') ||
    lower.includes('remember') ||
    lower.includes('code') ||
    lower.includes('build') ||
    lower.includes('deploy') ||
    Math.random() > 0.5
  );
}

function generateToolResult(name: string): string {
  switch (name) {
    case 'web_search':
      return `Found 4 relevant sources. Top result: "Emergent AI architectures in 2026 — a survey of autonomous agent frameworks and their deployment patterns."`;
    case 'calculator':
      return `Computed: result = 42.0 (evaluated expression successfully)`;
    case 'memory_recall':
      return `Recalled 2 entries: user prefers TypeScript, working on RyanAI platform.`;
    case 'code_executor':
      return `Execution completed in 128ms. Exit code 0. stdout: "Build successful."`;
    default:
      return 'Tool completed.';
  }
}

function generateResponse(model: ModelId, userText: string): string {
  const primaryBrain = getPrimaryBrain();
  const intros: Record<ModelId, string[]> = {
    'gemini-3.1-pro': [
      `Based on my analysis across multiple reasoning paths, here's what I've determined:`,
      `After cross-referencing available context and tool outputs:`,
      `My multimodal synthesis yields the following assessment:`,
    ],
    'claude-sonnet-4.6': [
      `Here's my reasoned response after working through the problem:`,
      `I've completed the reasoning loop. Here's what I found:`,
      `After evaluating the available tools and context:`,
    ],
    'gpt-5.4': [
      `With high confidence (p=0.94), here is my response:`,
      `Following adaptive compute allocation, I've reached this conclusion:`,
      `My chain-of-thought analysis produces the following:`,
    ],
  };

  const intro = pickRandom(intros[model]);

  const body = `**Your query:** "${userText.slice(0, 120)}"\n\n**Assessment:** I've processed your request through the full reasoning pipeline — parsing intent, consulting tools, and synthesizing a coherent response. The local orchestration state machine executed successfully with no dead-ends detected.\n\n**Key findings:**\n- Intent classification: \`information_seeking\`\n- Primary brain profile: \`${primaryBrain.name}\`\n- Tools invoked: see trace panel\n- Memory context: 2 prior entries referenced\n- Confidence: 94%\n\n**Recommendation:** RyanAI is currently running its deterministic local reasoning fallback. Configure a provider gateway to activate live Nemotron and Qwen inference using the routing profile in \`src/config/models.ts\`.\n\n*RyanAI · Autonomous Reasoning Engine · Named after Mukhethwa Ryan Ganyane*`;

  return `${intro}\n\n${body}`;
}

export async function streamReasoning(
  userText: string,
  model: ModelId,
  callbacks: StreamCallbacks,
): Promise<void> {
  const templates = [...AUTONOMOUS_REASONING_SKILL, ...REASONING_TEMPLATES[model]];
  const fullResponse = generateResponse(model, userText);

  // Emit title early
  const title = userText.trim().slice(0, 48) || 'New Thread';
  callbacks.onTitle(title);

  // Phase 1: Reasoning steps (visible thinking trace)
  const numSteps = 3 + Math.floor(Math.random() * 2);
  for (let i = 0; i < numSteps; i++) {
    const template = templates[i % templates.length].replace('{n}', String(2 + Math.floor(Math.random() * 4)));
    // Stream the reasoning text token by token
    const words = template.split(' ');
    for (const word of words) {
      callbacks.onToken(word + ' ');
      await sleep(30 + Math.random() * 40);
    }
    callbacks.onToken('\n');
    await sleep(100);
  }

  // Phase 2: Tool calling (if applicable)
  if (shouldUseTools(userText)) {
    const numTools = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numTools; i++) {
      const toolName = pickRandom([...TOOL_NAMES]);
      const step: ToolStep = {
        id: uid('step'),
        type: 'tool_start',
        name: toolName,
        args: { query: userText.slice(0, 60) },
        status: 'running',
      };
      callbacks.onStep(step);
      await sleep(400 + Math.random() * 600);

      const resultStep: ToolStep = {
        ...step,
        type: 'tool_result',
        result: generateToolResult(toolName),
        status: 'done',
      };
      callbacks.onStep(resultStep);
      await sleep(200);
    }
  }

  // Phase 3: Clear reasoning buffer, stream final response
  callbacks.onToken('\n---\n\n');
  await sleep(200);

  // Stream the final response word by word
  const tokens = fullResponse.split(/(\s+)/);
  for (const token of tokens) {
    callbacks.onToken(token);
    await sleep(15 + Math.random() * 35);
  }

  callbacks.onDone();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { TOOL_LABELS };
