import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { ChatOpenAI } from '@langchain/openai';
import { commsTools } from './tools/commsTools.js';
import { sendWhatsAppTool } from './tools/whatsappTool.js';

const llm = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0,
});

// Initialize PostgresSaver checkpointer using database connection string
const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/ryanai';

export const checkpointer = PostgresSaver.fromConnString(databaseUrl);

// Safe, non-blocking initialization function
let isInitialized = false;
export async function initializeAgentDatabase() {
  if (isInitialized) return;
  try {
    console.log('[DB] Connecting and setting up LangGraph PostgresSaver checkpointer...');
    await checkpointer.setup();
    isInitialized = true;
    console.log('[DB] PostgresSaver checkpointer successfully initialized.');
  } catch (error) {
    console.error('[CRITICAL] Failed to initialize PostgresSaver checkpointer:', error);
    throw error;
  }
}

// Register communication tools alongside WhatsApp integration
const agentTools = [...commsTools, sendWhatsAppTool];

export const humanInTheLoopAgent = createReactAgent({
  llm,
  tools: agentTools,
  checkpointSaver: checkpointer,
  interruptBefore: ['tools'],
});