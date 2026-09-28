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

// Automatically set up checkpoint tables on module initialization
await checkpointer.setup();

// Register communication tools alongside WhatsApp integration
const agentTools = [...commsTools, sendWhatsAppTool];

export const humanInTheLoopAgent = createReactAgent({
  llm,
  tools: agentTools,
  checkpointSaver: checkpointer,
  interruptBefore: ['tools'],
});