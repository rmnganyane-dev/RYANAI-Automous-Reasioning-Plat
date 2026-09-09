import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import process from 'node:process';
import { routeReasoning } from './provider-router.js';

const execFileAsync = promisify(execFile);
const projectRoot = path.resolve(process.env.RYANAI_PROJECT_ROOT || path.join(import.meta.dirname, '..'));
const isWindows = process.platform === 'win32';

const server = new Server(
  { name: 'ryanai-mcp-manager', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

const tools = [
  {
    name: 'diagnose_and_patch',
    description: 'Run RyanAI diagnostics and optionally deploy the validated web service. Patch means diagnose and verify; source edits remain explicit repository changes.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['check', 'patch', 'deploy'], description: 'Run checks, repeat checks for patch verification, or build/start Docker.' },
      },
      required: ['action'],
    },
  },
  {
    name: 'repository_status',
    description: 'Return Git status and whitespace diagnostics without changing files.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'sync_repository',
    description: 'Stage intentional updates, create a commit, and push main. This is an explicit release action.',
    inputSchema: {
      type: 'object',
      properties: {
        commitMessage: { type: 'string', description: 'Commit summary message.' },
      },
      required: ['commitMessage'],
    },
  },
  {
    name: 'reasoning_route',
    description: 'Route a prompt to the configured Nemotron or Qwen OpenAI-compatible provider, or return the local fallback status when no key is configured.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Prompt to process.' },
        brain: { type: 'string', enum: ['nemotron', 'qwen'], description: 'Provider brain.' },
      },
      required: ['prompt'],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = request.params.arguments ?? {};

  try {
    if (request.params.name === 'diagnose_and_patch') {
      const action = String(args.action || 'check');
      if (!['check', 'patch', 'deploy'].includes(action)) throw new Error(`Unsupported action: ${action}`);

      const results = [];
      results.push(await run('npm', ['run', 'check']));
      results.push(await run('npm', ['run', 'rust:check']));
      results.push(await run('docker', ['compose', 'config']));

      if (action === 'deploy') {
        results.push(await run('npm', ['run', 'docker:up']));
        results.push(await run('docker', ['compose', 'ps']));
      }

      return textResult(`${action} completed successfully.\n\n${results.join('\n\n')}`);
    }

    if (request.params.name === 'repository_status') {
      const status = await run('git', ['status', '--short']);
      const diffCheck = await run('git', ['diff', '--check']);
      return textResult(`Repository status:\n${status || '(clean)'}\n\nWhitespace check:\n${diffCheck || 'clean'}`);
    }

    if (request.params.name === 'sync_repository') {
      const commitMessage = String(args.commitMessage || '').trim();
      if (!commitMessage) throw new Error('commitMessage is required.');
      if (commitMessage.length > 120) throw new Error('commitMessage must be 120 characters or fewer.');

      await run('git', ['add', '-A']);
      const staged = await run('git', ['diff', '--cached', '--name-only']);
      if (!staged.trim()) return textResult('No changes to commit.');
      const commit = await run('git', ['commit', '-m', commitMessage]);
      const push = await run('git', ['push', 'origin', 'main']);
      return textResult(`Repository synchronized.\n\n${commit}\n${push}`);
    }

    if (request.params.name === 'reasoning_route') {
      const prompt = String(args.prompt || '').trim();
      if (!prompt) throw new Error('prompt is required.');
      const result = await routeReasoning(prompt, String(args.brain || 'nemotron'));
      return textResult(JSON.stringify(result, null, 2));
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
  } catch (error) {
    return textResult(`RyanAI MCP operation failed:\n${error instanceof Error ? error.message : String(error)}`, true);
  }
});

async function run(command, args) {
  const executable = isWindows && command === 'npm' ? 'npm.cmd' : command;
  const result = await execFileAsync(executable, args, {
    cwd: projectRoot,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 8,
  });
  return `${command} ${args.join(' ')}\n${result.stdout.trim()}${result.stderr.trim() ? `\n[stderr]\n${result.stderr.trim()}` : ''}`;
}

function textResult(text, isError = false) {
  return { isError, content: [{ type: 'text', text }] };
}

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('RyanAI MCP Manager Server running on stdio');
