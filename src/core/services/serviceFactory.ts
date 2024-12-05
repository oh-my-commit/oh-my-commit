import { CommitService } from './types';
import { GcopService } from './gcopService';

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

  private registerDefaultServices() {
    // 注册 gcop 服务
    this.services.set('gcop_fast', new GcopService());
    // TODO: 注册其他服务
  }

  public getService(solutionId: string): CommitService | undefined {
    return this.services.get(solutionId);
  }

  public getAllServices(): CommitService[] {
    return Array.from(this.services.values());
  }
}
