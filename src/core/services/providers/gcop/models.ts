export interface ModelInfo {
  provider: string;
  defaultBase: string;
  displayName: string;
  description: string;
  metrics: {
    speed: number;    // 1-5
    cost: number;     // 1-5
    quality: number;  // 1-5
  };
}

export const SUPPORTED_MODELS: Record<string, ModelInfo> = {
  'openai/gpt-4': {
    provider: 'openai',
    defaultBase: 'https://api.openai.com/v1',
    displayName: 'GPT-4',
    description: '最佳质量，适合重要提交',
    metrics: { speed: 3, cost: 5, quality: 5 }
  },
  'openai/gpt-4-turbo': {
    provider: 'openai',
    defaultBase: 'https://api.openai.com/v1',
    displayName: 'GPT-4 Turbo',
    description: '高性能，适合日常使用',
    metrics: { speed: 4, cost: 4, quality: 5 }
  },
  'deepseek/deepseek-chat': {
    provider: 'deepseek',
    defaultBase: 'https://api.deepseek.com/v1',
    displayName: 'Deepseek Chat',
    description: '性价比优秀，支持中英双语',
    metrics: { speed: 4, cost: 3, quality: 4 }
  },
  'zhipu/glm-4': {
    provider: 'zhipu',
    defaultBase: 'https://api.zhipu.ai/v1',
    displayName: 'GLM-4',
    description: '中文支持优秀，适合国内团队',
    metrics: { speed: 4, cost: 3, quality: 4 }
  },
  'ollama/llama2': {
    provider: 'ollama',
    defaultBase: 'http://localhost:11434',
    displayName: 'Llama 2 (本地)',
    description: '完全本地部署，无需API密钥',
    metrics: { speed: 5, cost: 1, quality: 3 }
  },
  'groq/llama-3.1-70b-versatile': {
    provider: 'groq',
    defaultBase: 'https://api.groq.com/v1',
    displayName: 'Llama 3.1 (Groq)',
    description: '高性能推理，适合频繁使用',
    metrics: { speed: 5, cost: 3, quality: 4 }
  },
  'anthropic/claude-3-sonnet': {
    provider: 'anthropic',
    defaultBase: 'https://api.anthropic.com/v1',
    displayName: 'Claude 3 Sonnet',
    description: '代码理解能力强，适合复杂变更',
    metrics: { speed: 4, cost: 4, quality: 5 }
  }
} as const;

export type SupportedModel = keyof typeof SUPPORTED_MODELS;
