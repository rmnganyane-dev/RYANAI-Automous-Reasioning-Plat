#!/usr/bin/env node
// File path: ./cli.ts

import { Command } from "commander";
import { executeAgentReasoning } from "./src/services/api";

const program = new Command();

program
  .name("ryanai")
  .description("RyanAI Sovereign Autonomous Reasoning Engine CLI")
  .version("2.4.0");

program
  .command("reason")
  .description("Execute an autonomous reasoning objective")
  .argument("<prompt>", "Objective prompt for the LangGraph ReAct engine")
  .action(async (prompt: string) => {
    console.log(`[RyanAI CLI] Dispatching objective: "${prompt}"...`);
    try {
      const result = await executeAgentReasoning(prompt);
      console.log("\n--- Reasoning Output ---");
      console.log(result.output);
      console.log("\n--- Reasoning Trace ---");
      result.reasoningTrace.forEach((step: string, idx: number) => console.log(`${idx + 1}. ${step}`));
      console.log(`\nTimestamp: ${result.timestamp}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`[Error] Failed to execute reasoning pipeline: ${err.message}`);
      } else {
        console.error(`[Error] An unknown error occurred during reasoning execution.`);
      }
      process.exit(1);
    }
  });

program.parse(process.argv);