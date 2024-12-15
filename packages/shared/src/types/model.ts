export interface Model {
  providerId: string;
  id: string;
  name: string;
  description: string;

  /**
   * 如果固定地使用了主流的底层大模型，可以在这指定，例如：`openai`,`anthropic`, ...
   */
  aiProviderId?: string;

  /**
   * 一些供用户明确准确度、性能、成本的指标
   */
  metrics?: {
    accuracy: number;
    speed: number;
    cost: number;
  };
}
