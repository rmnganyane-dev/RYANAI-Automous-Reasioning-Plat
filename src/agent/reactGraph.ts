// File path: ./src/agent/reactGraph.ts

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";
import { AUTONOMOUS_REASONING_SKILL } from "../skills/autonomousReasoning.js";

// Define the execution output structure expected by the Fastify gateway
export interface AgentState {
  input: string;
  steps: string[];
  context: Record<string, any>;
  output: string;
  confidence: number;
}

// 1. Configure the primary LLM model (e.g., Nemotron / OpenAI compatible endpoint)
const primaryLLM = new ChatOpenAI({
  modelName: process.env.PRIMARY_REASONING_MODEL || "nvidia/nemotron-3-ultra",
  temperature: 0.2,
  configuration: {
    baseURL: process.env.NVIDIA_API_ENDPOINT || "https://integrate.api.nvidia.com/v1",
    apiKey: process.env.NVIDIA_API_KEY || "dummy-key",
  },
});

// 2. Bind tools array (add your custom tool definitions here)
const agentTools: any[] = [];

// 3. Instantiate the LangGraph ReAct Agent
const reactAgentGraph = createReactAgent({
  llm: primaryLLM,
  tools: agentTools,
  // Use standard stateModifier to inject the system prompt (replaces deprecated 'prompt')
  stateModifier: new SystemMessage(
    AUTONOMOUS_REASONING_SKILL?.systemPrompt || "You are an autonomous reasoning agent."
  ),
});

// 4. Wrap execution logic into the engine class
export class RyanReActEngine {
  private cudaEnabled: boolean;

  constructor(cudaEnabled = true) {
    this.cudaEnabled = cudaEnabled;
  }

  /**
   * Executes an objective prompt through the LangGraph ReAct loop.
   * 
   * @param prompt - Objective passed from Fastify /api/reason endpoint
   * @returns Formatted steps and final synthesis payload
   */
  public async execute(prompt: string): Promise<AgentState> {
    const startTime = Date.now();

    // System prompt is handled by stateModifier, so we only need to pass the HumanMessage
    const inputs = {
      messages: [new HumanMessage(prompt)],
    };

    try {
      // Invoke the LangGraph execution pipeline
      const graphState = await reactAgentGraph.invoke(inputs, {
        recursionLimit: AUTONOMOUS_REASONING_SKILL?.maxIterations || 10,
      });

      const messages: BaseMessage[] = graphState.messages || [];
      const finalMessage = messages[messages.length - 1];

      // Extract intermediate Thought/Action steps for tracing (skip human input and final output)
      const reasoningTrace = messages
        .slice(1, -1)
        .map((msg) => {
          if (msg._getType() === "ai" && msg.additional_kwargs?.tool_calls) {
             const tools = msg.additional_kwargs.tool_calls.map((t: any) => t.function.name).join(", ");
             return `[Action] Invoking tool(s): ${tools}`;
          }
          if (msg._getType() === "tool") {
             return `[Observation] Tool returned execution data.`;
          }
          const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
          return content ? `[Thought] ${content}` : "";
        })
        .filter((step) => step.length > 0);

      // Extract final text output
      const outputText = typeof finalMessage?.content === "string" 
        ? finalMessage.content 
        : JSON.stringify(finalMessage?.content || "No output generated.");

      // Calculate latency
      const latencyMs = Date.now() - startTime;

      return {
        input: prompt,
        steps: reasoningTrace.length ? reasoningTrace : ["[Dispatcher] Direct response synthesized without intermediate tool steps."],
        context: {
          engine: "RyanAI-LangGraph",
          model: (primaryLLM as any).modelName || (primaryLLM as any).model || "gpt-4o",
          latencyMs,
          cudaEnabled: this.cudaEnabled,
        },
        output: outputText,
        confidence: 0.95,
      };

    } catch (error) {
      console.error("[RyanReActEngine] Execution failed:", error);
      throw error;
    }
  }
}

// Default instance consumed by server.ts
export const defaultEngine = new RyanReActEngine();