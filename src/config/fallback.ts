// src/config/fallback.ts
import { primaryBrain, secondaryBrain, logicBrain } from './brains';
import { BaseMessage } from '@langchain/core/messages';

export class BrainFallbackHandler {
  /**
   * Executes a model call with automatic fallback resilience
   */
  static async safeInvoke(
    brainType: 'primary' | 'secondary' | 'logic',
    messages: BaseMessage[]
  ) {
    const targetBrain = 
      brainType === 'primary' ? primaryBrain :
      brainType === 'secondary' ? secondaryBrain : logicBrain;

    const fallbackBrain = secondaryBrain; // Fallback to Qwen if primary fails

    try {
      const response = await targetBrain.invoke(messages);
      return response;
    } catch (error: any) {
      console.warn(`[Fallback Warning] ${brainType} brain failed: ${error.message}. Routing to fallback brain...`);
      
      try {
        const fallbackResponse = await fallbackBrain.invoke(messages);
        return fallbackResponse;
      } catch (fallbackError: any) {
        console.error(`[Critical Error] Fallback brain also failed: ${fallbackError.message}`);
        throw fallbackError;
      }
    }
  }
}