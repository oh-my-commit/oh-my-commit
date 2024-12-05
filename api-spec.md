# YAAC API 规范

## 概述

YAAC 提供标准化的 API 接口，允许第三方 AI Commit 服务提供商接入系统。支持 RESTful API 和本地命令行工具两种集成方式。

## API 版本

- 当前版本：v1
- Base URL：`https://api.yaac.dev/v1`

## 通用规范

### 请求格式

- Content-Type: application/json
- Authorization: Bearer {token}

### 响应格式

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## 核心接口

### 1. 生成提交信息

POST `/commit/generate`

#### 请求参数

```typescript
interface GenerateCommitRequest {
  // 必需参数
  diff: string; // Git diff 内容

  // 可选参数
  model?: string; // AI 模型选择
  provider?: string; // AI 提供商
  language?: string; // 响应语言 (en/zh)
  style?: string; // 提交风格 (conventional/angular/free)

  // 上下文参数（可选）
  gitHistory?: {
    // Git 历史信息
    recentCommits?: string[]; // 最近的提交记录
    branch?: string; // 当前分支
  };
  projectContext?: {
    // 项目上下文
    language?: string[]; // 项目语言
    framework?: string[]; // 使用的框架
    packageJson?: object; // package.json 内容
  };
}
```

#### 响应格式

```typescript
interface GenerateCommitResponse {
  message: {
    title: string; // 提交标题
    body?: string; // 提交正文
    footer?: string; // 提交脚注
  };
  alternatives?: Array<{
    // 可选的其他提交信息
    message: string;
    confidence: number;
  }>;
  metadata?: {
    // 元数据
    model: string; // 使用的模型
    provider: string; // 服务提供商
    latency: number; // 响应延迟
  };
}
```

### 2. 健康检查

GET `/health`

用于检查服务是否正常运行。

#### 响应格式

```typescript
interface HealthResponse {
  status: "ok" | "degraded" | "error";
  version: string;
  provider: string;
}
```

## 本地集成协议

### 命令行工具规范

支持本地命令行工具（如 gcop）的集成：

```bash
# 基本用法
$ [tool-name] generate --diff "git diff content"

# 完整参数
$ [tool-name] generate \
  --diff "git diff content" \
  --model "gpt-4" \
  --style "conventional" \
  --language "en" \
  --history "recent commits" \
  --context "project context"
```

### 标准输出格式

命令行工具需要以 JSON 格式输出，格式与 RESTful API 响应一致：

```json
{
  "success": true,
  "data": {
    "message": {
      "title": "feat: add user authentication",
      "body": "Implement JWT-based authentication system\n\n- Add login endpoint\n- Add token validation"
    }
  }
}
```

## 错误处理

### 错误码

- `AUTH_ERROR`: 认证错误
- `INVALID_REQUEST`: 请求参数错误
- `PROVIDER_ERROR`: 提供商服务错误
- `RATE_LIMIT`: 请求频率限制
- `INTERNAL_ERROR`: 内部服务错误

### 错误响应示例

```json
{
  "success": false,
  "error": {
    "code": "PROVIDER_ERROR",
    "message": "AI service provider is currently unavailable",
    "details": {
      "provider": "openai",
      "statusCode": 503
    }
  }
}
```

## 集成指南

### RESTful API 集成

1. 注册开发者账号获取 API Key
2. 实现 API 规范中定义的接口
3. 提交集成申请进行测试验证

### 命令行工具集成

1. 实现标准命令行接口
2. 确保输出格式符合规范
3. 提供安装和配置文档

## 最佳实践

1. 实现错误重试机制
2. 提供详细的错误信息
3. 支持请求超时设置
4. 实现速率限制
5. 提供详细的集成文档
