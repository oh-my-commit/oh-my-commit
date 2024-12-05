import { GcopModelProvider } from './gcopConfig';

interface ProviderConfig {
  apiKeyName: string;
  apiBaseName: string;
  defaultBase: string;
  modelNameAdapter: (name: string) => string;
}

const PROVIDER_CONFIGS: Record<GcopModelProvider, ProviderConfig> = {
  openai: {
    apiKeyName: 'OPENAI_API_KEY',
    apiBaseName: 'OPENAI_API_BASE',
    defaultBase: 'https://api.openai.com/v1',
    modelNameAdapter: (name: string) => {
      // openai/gpt-4 -> gpt-4
      return name.replace('openai/', '');
    }
  },
  deepseek: {
    apiKeyName: 'DEEPSEEK_API_KEY',
    apiBaseName: 'DEEPSEEK_API_BASE',
    defaultBase: 'https://api.deepseek.com/v1',
    modelNameAdapter: (name: string) => {
      // deepseek/deepseek-chat -> deepseek-chat
      return name.replace('deepseek/', '');
    }
  },
  zhipu: {
    apiKeyName: 'ZHIPU_API_KEY',
    apiBaseName: 'ZHIPU_API_BASE',
    defaultBase: 'https://api.zhipu.ai/v1',
    modelNameAdapter: (name: string) => {
      // zhipu/glm-4 -> glm-4
      return name.replace('zhipu/', '');
    }
  },
  ollama: {
    apiKeyName: 'OLLAMA_API_KEY',
    apiBaseName: 'OLLAMA_API_BASE',
    defaultBase: 'http://localhost:11434',
    modelNameAdapter: (name: string) => {
      // ollama/llama2 -> llama2
      return name.replace('ollama/', '');
    }
  },
  groq: {
    apiKeyName: 'GROQ_API_KEY',
    apiBaseName: 'GROQ_API_BASE',
    defaultBase: 'https://api.groq.com/v1',
    modelNameAdapter: (name: string) => {
      // groq/llama-3.1-70b-versatile -> llama-3.1-70b-versatile
      return name.replace('groq/', '');
    }
  },
  anthropic: {
    apiKeyName: 'ANTHROPIC_API_KEY',
    apiBaseName: 'ANTHROPIC_API_BASE',
    defaultBase: 'https://api.anthropic.com/v1',
    modelNameAdapter: (name: string) => {
      // anthropic/claude-3-sonnet -> claude-3-sonnet
      return name.replace('anthropic/', '');
    }
  }
};

export class ModelAdapter {
  static getProviderFromModelName(modelName: string): GcopModelProvider {
    const provider = modelName.split('/')[0] as GcopModelProvider;
    if (!PROVIDER_CONFIGS[provider]) {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    return provider;
  }

  static getApiKeyName(provider: GcopModelProvider): string {
    return PROVIDER_CONFIGS[provider].apiKeyName;
  }

  static getApiBaseName(provider: GcopModelProvider): string {
    return PROVIDER_CONFIGS[provider].apiBaseName;
  }

  static getDefaultBase(provider: GcopModelProvider): string {
    return PROVIDER_CONFIGS[provider].defaultBase;
  }

  static adaptModelName(modelName: string): string {
    const provider = this.getProviderFromModelName(modelName);
    return PROVIDER_CONFIGS[provider].modelNameAdapter(modelName);
  }
}
