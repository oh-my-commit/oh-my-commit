import {Uri} from 'vscode';

export interface CommitChanges {
  files: Uri[];
  additions: number;
  deletions: number;
  summary: string;
}

export interface CommitMessage {
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  breaking?: boolean;
}

export interface SolutionMetrics {
  cost: number; // 1-10
  performance: number; // 1-10
  quality: number; // 1-10
}

export interface Solution {
  id: string;
  name: string;
  provider: string;
  description: string;
  metrics: SolutionMetrics
}

export interface CommitService {
  /**
   * 服务名称，用于在配置和UI中显示
   */
  readonly name: string;

  /**
   * 服务描述
   */
  readonly description: string;

  /**
   * 性能指标
   */
  readonly metrics: SolutionMetrics

  /**
   * 分析代码变更并生成提交信息
   * @param changes 代码变更信息
   * @returns 生成的提交信息
   * @throws {Error} 当服务调用失败时
   */
  generateCommitMessage(changes: CommitChanges): Promise<CommitMessage>;

  /**
   * 验证服务配置是否正确
   * @returns true 如果配置有效
   */
  validateConfig(): Promise<boolean>;
}

