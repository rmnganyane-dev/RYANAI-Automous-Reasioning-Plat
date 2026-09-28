import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { commsTools } from './tools/commsTools.js';

const llm = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0,
});

// Register the tool definitions inside the ReAct graph agent
export const reasoningAgent = createReactAgent({
  llm,
  tools: commsTools,
});