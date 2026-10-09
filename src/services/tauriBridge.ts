// src/services/tauriBridge.ts
import { invoke } from "@tauri-apps/api/core";

export interface AgentResponse {
  status: string;
  objective: string;
  result: string;
}

export class TauriBridge {
  /**
   * Invoke the desktop objective command and return its response.
   * IPC failures reject as Error instances with the supplied failure text.
   */
  public static async executeObjective(objective: string): Promise<AgentResponse> {
    try {
      const response = await invoke<AgentResponse>("trigger_agent_objective", { objective });
      return response;
    } catch (error: unknown) {
      console.error("[Tauri IPC Error]:", error);
      throw new Error(String(error || "Unknown Tauri IPC execution failure."));
    }
  }

  /** Return the desktop system-status response; IPC failures propagate. */
  public static async checkSystemHealth(): Promise<unknown> {
    return await invoke("get_system_status");
  }
}