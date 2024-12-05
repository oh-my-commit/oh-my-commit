import { SUPPORTED_MODELS } from './models';

export type GcopModelProvider = 
  | 'openai' 
  | 'deepseek' 
  | 'zhipu' 
  | 'ollama'
  | 'groq'
  | 'anthropic';

export class ModelAdapter {
  static getProviderFromModelName(modelName: string): GcopModelProvider {
    const provider = modelName.split('/')[0] as GcopModelProvider;
    if (!SUPPORTED_MODELS[modelName]) {
      throw new Error(`Unsupported model: ${modelName}`);
    }
    return provider;
  }

  static getApiKeyName(provider: GcopModelProvider): string {
    return `${provider.toUpperCase()}_API_KEY`;
  }

  static getApiBaseName(provider: GcopModelProvider): string {
    return `${provider.toUpperCase()}_API_BASE`;
  }

  static getDefaultBase(provider: GcopModelProvider): string {
    const model = Object.entries(SUPPORTED_MODELS).find(
      ([_, info]) => info.provider === provider
    );
    return model ? model[1].defaultBase : '';
  }

  static adaptModelName(modelName: string): string {
    const provider = this.getProviderFromModelName(modelName);
    return modelName.replace(`${provider}/`, '');
  }
}
