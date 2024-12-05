import { CommitService } from './types';
import { GcopService, SUPPORTED_MODELS, SupportedModel } from './providers/gcop';
import { workspace } from 'vscode';

export class ServiceFactory {
  private static instance: ServiceFactory;
  private services: Map<string, CommitService>;

  private constructor() {
    this.services = new Map();
    this.registerDefaultServices();
  }

  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  public registerDefaultServices() {
    // 获取配置的模型
    const config = workspace.getConfiguration('yaac.gcop');
    const modelName = config.get<SupportedModel>('model') || 'openai/gpt-4';

    // 为每个支持的模型创建一个服务实例
    Object.entries(SUPPORTED_MODELS).forEach(([name, info]) => {
      const serviceId = `gcop_${info.provider}_${name.split('/')[1]}`;
      this.services.set(serviceId, new GcopService(name as SupportedModel));
    });

    // 设置默认服务
    const defaultServiceId = `gcop_${modelName.split('/')[0]}_${modelName.split('/')[1]}`;
    this.services.set('default', this.services.get(defaultServiceId)!);
  }

  public getService(solutionId: string): CommitService | undefined {
    return this.services.get(solutionId);
  }

  public getAllServices(): CommitService[] {
    return Array.from(this.services.values());
  }

  public getServicesByProvider(provider: string): CommitService[] {
    return Array.from(this.services.entries())
      .filter(([id]) => id.startsWith(`gcop_${provider}_`))
      .map(([_, service]) => service);
  }

  public getDefaultService(): CommitService {
    return this.services.get('default')!;
  }
}
