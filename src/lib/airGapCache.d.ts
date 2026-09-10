export var MODELS = {
    'gemini-3.1-pro': {
        id: 'gemini-3.1-pro',
        label: 'Gemini 3.1 Pro',
        short: 'GEM',
        vendor: 'Google DeepMind',
        color: '#4285f4',
        accent: 'blue',
        description: 'Multimodal frontier model with 2M token context',
    },
    'claude-sonnet-4.6': {
        id: 'claude-sonnet-4.6',
        label: 'Claude Sonnet 4.6',
        short: 'CLD',
        vendor: 'Anthropic',
        color: '#d97706',
        accent: 'amber',
        description: 'Balanced reasoning and speed with strong tool use',
    },
    'gpt-5.4': {
        id: 'gpt-5.4',
        label: 'GPT-5.4',
        short: 'GPT',
        vendor: 'OpenAI',
        color: '#10a37f',
        accent: 'emerald',
        description: 'Advanced reasoning with adaptive compute allocation',
    },
};
export var MODEL_LIST = Object.values(MODELS);
export function modelMeta(id) {
    if (id && MODELS[id])
        return MODELS[id];
    return MODELS['claude-sonnet-4.6'];
}
