export interface ModelMetrics {
  accuracy?: number;
  speed?: number;
  cost?: number;
  // 可以根据需要添加更多指标
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  // 如果验证失败，可能需要的配置项
  requiredConfig?: {
    key: string; // 配置项的键
    description: string; // 配置项的描述
    type: "string" | "boolean" | "number"; // 配置项的类型
    settingPath?: string; // VSCode 设置中的路径（如果适用）
  }[];
}

export interface Model {
  id: string; // 全局唯一的模型ID
  name: string; // 显示名称
  description: string; // 描述
  providerId: string; // 提供者ID
  metrics: ModelMetrics;

  aiProviderId?: string;
  // 目前通过 preset ai provider的 apikey 确定前置条件
  // todo: 验证 model 是否满足使用条件
  validate?: () => Promise<ValidationResult>;
}
