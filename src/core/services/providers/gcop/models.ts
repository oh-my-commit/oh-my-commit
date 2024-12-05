import {Solution} from "@/core/services";

export const SUPPORTED_MODELS: Record<string, Solution> = {
  'openai/gpt-4': {
    id: "openai/gpt-4",
    provider: 'openai',
    name: 'GPT-4',
    description: '最佳质量，适合重要提交',
    metrics: { performance: 3, cost: 5, quality: 5 }
  },
  'openai/gpt-4-turbo': {
    id: "openai/gpt-4-turbo",
    provider: 'openai',
    name: 'GPT-4 Turbo',
    description: '高性能，适合日常使用',
    metrics: { performance: 4, cost: 4, quality: 5 }
  },
  'deepseek/deepseek-chat': {
    id: "deepseek/deepseek-chat",
    provider: 'deepseek',
    name: 'Deepseek Chat',
    description: '性价比优秀，支持中英双语',
    metrics: { performance: 4, cost: 3, quality: 4 }
  },
  'zhipu/glm-4': {
    id: "zhipu/glm-4",
    provider: 'zhipu',
    name: 'GLM-4',
    description: '中文支持优秀，适合国内团队',
    metrics: { performance: 4, cost: 3, quality: 4 }
  },
  'ollama/llama2': {
    id: "ollama/llama2",
    provider: 'ollama',
    name: 'Llama 2 (本地)',
    description: '完全本地部署，无需API密钥',
    metrics: { performance: 5, cost: 1, quality: 3 }
  },
  'groq/llama-3.1-70b-versatile': {
    id: "groq/llama-3.1-70b-versatile",
    provider: 'groq',
    name: 'Llama 3.1 (Groq)',
    description: '高性能推理，适合频繁使用',
    metrics: { performance: 5, cost: 3, quality: 4 }
  },
  'anthropic/claude-3-sonnet': {
    id: "anthropic/claude-3-sonnet",
    provider: 'anthropic',
    name: 'Claude 3 Sonnet',
    description: '代码理解能力强，适合复杂变更',
    metrics: { performance: 4, cost: 4, quality: 5 }
  }
} as const;

export type SupportedModel = keyof typeof SUPPORTED_MODELS;
