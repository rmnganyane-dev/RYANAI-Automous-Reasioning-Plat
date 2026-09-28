import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { loadPolicy, LoadedPolicy } from '@open-policy-agent/opa-wasm';
import fs from 'node:fs/promises';

export interface TranscendPluginOptions {
  wasmFilePath: string;
  enforceRoutes?: string[];
}

export interface TranscendEvaluationResult {
  allow: boolean;
  requires_human_approval: boolean;
  violations: string[];
}

const transcendGovernancePlugin: FastifyPluginAsync<TranscendPluginOptions> = async (
  fastify,
  opts
) => {
  // Read policy WASM buffer from disk and initialize engine in memory
  const wasmBuffer = await fs.readFile(opts.wasmFilePath);
  const policy: LoadedPolicy = await loadPolicy(wasmBuffer);

  /**
   * Synchronous WASM policy evaluation against the loaded entrypoint
   */
  const evaluateInput = (input: Record<string, any>): TranscendEvaluationResult => {
    const results = policy.evaluate(input);

    if (!results || results.length === 0) {
      return {
        allow: false,
        requires_human_approval: false,
        violations: ['TRANSCEND_POLICY_ERR: Empty result set returned by WASM evaluator.'],
      };
    }

    const evaluation = results[0].result as TranscendEvaluationResult;

    return {
      allow: Boolean(evaluation?.allow),
      requires_human_approval: Boolean(evaluation?.requires_human_approval),
      violations: evaluation?.violations || [],
    };
  };

  // Decorate Fastify instance for programmatic access across services
  fastify.decorate('transcend', {
    evaluate: evaluateInput,
  });

  // Pre-handler hook to automatically audit marked execution routes
  if (opts.enforceRoutes && opts.enforceRoutes.length > 0) {
    fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
      const isMonitored = opts.enforceRoutes?.some((route) =>
        request.url.startsWith(route)
      );

      if (isMonitored && request.body) {
        const evaluation = evaluateInput(request.body as Record<string, any>);

        if (!evaluation.allow) {
          fastify.log.warn(
            { violations: evaluation.violations, url: request.url },
            'Transcend Policy Violation Intercepted'
          );

          return reply.status(403).send({
            error: 'TRANSCEND_POLICY_BLOCKED',
            message: 'Action denied by Transcend Policy Engine.',
            requires_human_approval: evaluation.requires_human_approval,
            violations: evaluation.violations,
          });
        }
      }
    });
  }
};

export default fp(transcendGovernancePlugin, {
  name: 'transcend-governance',
  fastify: '>=4.0.0',
});