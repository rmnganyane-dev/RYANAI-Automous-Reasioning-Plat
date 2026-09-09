const brains = {
  nemotron: {
    id: 'nvidia/nemotron-3-ultra',
    endpoint: process.env.NVIDIA_API_ENDPOINT || 'https://integrate.api.nvidia.com/v1',
    key: process.env.NVIDIA_API_KEY,
  },
  qwen: {
    id: 'qwen/qwen-3.6-27b',
    endpoint: process.env.QWEN_API_ENDPOINT || 'https://api.together.xyz/v1',
    key: process.env.QWEN_API_KEY,
  },
};

export function resolveBrain(name = 'nemotron') {
  return brains[name] || brains.nemotron;
}

export async function routeReasoning(prompt, name = 'nemotron') {
  const brain = resolveBrain(name);
  if (!brain.key) {
    return {
      mode: 'local-fallback',
      brain: brain.id,
      message: 'No provider key configured; use RyanAI local reasoning fallback.',
    };
  }

  const response = await fetch(`${brain.endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${brain.key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: brain.id,
      temperature: name === 'qwen' ? 0.1 : 0.2,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`${brain.id} provider returned HTTP ${response.status}`);
  const payload = await response.json();
  return { mode: 'provider', brain: brain.id, response: payload.choices?.[0]?.message?.content || '' };
}