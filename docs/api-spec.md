# YAAC API 规范 v1

## 概述

YAAC 提供标准化的模型接口，允许不同的提交方案提供商接入系统。重点关注提交效果、性能和成本，而不是具体的技术实现细节。

## 模型接口

### 1. 提交方案注册

POST `/solutions/register`

注册新的提交方案。

```typescript
interface Solution {
  id: string; // 方案唯一标识
  name: string; // 显示名称（可由用户自定义）
  provider: string; // 提供商标识
  description: string; // 方案描述
  metrics: {
    cost: number; // 成本指标 (1-10)
    performance: number; // 性能指标 (1-10)
    quality: number; // 质量指标 (1-10)
  };
  config?: {
    // 方案特定配置
    [key: string]: any;
  };
}
```

### 2. 生成提交信息

POST `/commit/generate`

```typescript
interface CommitRequest {
  // 核心参数
  diff: string; // Git diff 内容
  solutionId: string; // 使用的方案 ID

  // 可选上下文
  context?: {
    recentCommits?: string[]; // 最近的提交记录
    branch?: string; // 当前分支
    projectInfo?: object; // 项目信息
  };
}

interface CommitResponse {
  message: {
    title: string; // 提交标题
    body?: string; // 提交正文
    footer?: string; // 提交脚注
  };
  metrics: {
    latency: number; // 响应时间 (ms)
    cost: number; // 实际成本
  };
}
```

## 配置管理接口

### 1. API 配置

POST `/config/api`

```typescript
interface ApiConfig {
  provider: string; // 服务提供商
  credentials: {
    [key: string]: string; // API 密钥等凭证
  };
  settings?: {
    [key: string]: any; // 其他设置
  };
}
```

### 2. 方案配置

POST `/config/solution`

```typescript
interface SolutionConfig {
  solutionId: string;
  name?: string; // 自定义名称
  settings?: {
    [key: string]: any;
  };
}
```

## 集成指南

### 1. 提供商接入步骤

1. 实现标准提交方案接口
2. 提供性能/成本/质量指标
3. 定义配置项（如果需要）
4. 提交集成申请

### 2. 本地工具集成

命令行工具需要提供以下基本功能：

```bash
# 注册方案
$ [tool-name] register

# 生成提交
$ [tool-name] generate --diff "git diff content"
```

## 错误处理

### 错误类型

- `CONFIG_ERROR`: 配置错误
- `SOLUTION_ERROR`: 方案执行错误
- `RATE_LIMIT`: 频率限制
- `COST_LIMIT`: 成本限制
- `SYSTEM_ERROR`: 系统错误

### 错误响应

```typescript
interface ErrorResponse {
  code: string;
  message: string;
  solution?: string; // 建议的模型
  details?: any;
}
```

## 最佳实践

### 1. 性能优化

- 实现本地缓存
- 支持批量处理
- 异步处理长任务

### 2. 成本控制

- 提供成本预估
- 支持成本限制
- 优化 API 调用

### 3. 质量保证

- 提供结果预览
- 支持手动修改
- 记录用户反馈

### 4. 用户体验

- 清晰的错误提示
- 进度反馈
- 简单的配置流程
