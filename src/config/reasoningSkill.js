/**
 * Steps executed during the autonomous reasoning and tool dispatch loop.
 */
export const AUTONOMOUS_REASONING_SKILL = Object.freeze([
  'Parsing intent and constructing reasoning chain...',
  'Evaluating tool requirements against available capabilities...',
  'Executing ReAct loop — observation → thought → action...',
  'Synthesizing and validating the final response...',
]);