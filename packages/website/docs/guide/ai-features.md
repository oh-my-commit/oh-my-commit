# AI 功能

Oh My Commits 集成了强大的 AI 功能，帮助您更高效地管理代码提交。

## AI 提交消息生成

### 基本配置

```json
{
  "oh-my-commits.ai": {
    "enabled": true,
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 500
  }
}
```

### 自定义提示词

```json
{
  "oh-my-commits.ai.prompt": {
    "system": "你是一个专业的代码审查助手，擅长生成规范的提交信息。",
    "template": "请根据以下代码变更生成一个符合 Conventional Commits 规范的提交信息：\n\n${diff}",
    "language": "zh-CN"
  }
}
```

### 多语言支持

```json
{
  "oh-my-commits.ai.languages": {
    "default": "zh-CN",
    "supported": ["zh-CN", "en-US", "ja-JP"],
    "templates": {
      "zh-CN": "生成中文提交信息",
      "en-US": "Generate commit message in English",
      "ja-JP": "コミットメッセージを日本語で生成"
    }
  }
}
```

## 代码审查

### 自动审查

```json
{
  "oh-my-commits.ai.review": {
    "enabled": true,
    "mode": "auto",
    "focus": ["security", "performance", "style", "logic"],
    "threshold": 0.8
  }
}
```

### 审查建议

```json
{
  "oh-my-commits.ai.suggestions": {
    "enabled": true,
    "inline": true,
    "autoFix": true,
    "categories": ["naming", "formatting", "documentation", "optimization"]
  }
}
```

## 智能补全

### 提交信息补全

```json
{
  "oh-my-commits.ai.completion": {
    "enabled": true,
    "triggerChars": [":", "(", " "],
    "minChars": 3,
    "maxSuggestions": 5
  }
}
```

### 代码片段生成

```json
{
  "oh-my-commits.ai.snippets": {
    "enabled": true,
    "contexts": ["tests", "documentation", "examples"],
    "format": true
  }
}
```

## API 集成

### OpenAI

```json
{
  "oh-my-commits.ai.openai": {
    "apiKey": "${OPENAI_API_KEY}",
    "organization": "${OPENAI_ORG_ID}",
    "baseUrl": "https://api.openai.com/v1",
    "timeout": 30000
  }
}
```

### Azure OpenAI

```json
{
  "oh-my-commits.ai.azure": {
    "enabled": true,
    "endpoint": "${AZURE_OPENAI_ENDPOINT}",
    "apiKey": "${AZURE_OPENAI_KEY}",
    "deploymentName": "gpt-4",
    "apiVersion": "2023-05-15"
  }
}
```

### 自定义 AI 提供商

```json
{
  "oh-my-commits.ai.custom": {
    "enabled": true,
    "endpoint": "http://your-ai-service.com/api",
    "headers": {
      "Authorization": "Bearer ${API_KEY}",
      "Content-Type": "application/json"
    },
    "timeout": 60000
  }
}
```

## 最佳实践

### 1. 提交信息生成

- 使用适当的温度值（0.7-0.8）以平衡创造性和准确性
- 为不同类型的变更自定义提示词
- 定期更新和优化提示词模板

### 2. 代码审查

- 启用自动审查以提前发现潜在问题
- 配置重点关注的审查领域
- 利用 AI 建议改进代码质量

### 3. 安全性

- 使用环境变量存储 API 密钥
- 定期轮换 API 密钥
- 限制 AI 访问敏感代码区域

## 常见问题

### 1. API 限制

问题：遇到 API 调用限制
解决：

```json
{
  "oh-my-commits.ai.rateLimit": {
    "enabled": true,
    "maxRequests": 100,
    "interval": 3600,
    "retryDelay": 1000
  }
}
```

### 2. 响应超时

问题：AI 响应时间过长
解决：

```json
{
  "oh-my-commits.ai.timeout": {
    "request": 30000,
    "generation": 60000,
    "review": 120000
  }
}
```

### 3. 离线支持

问题：需要在离线环境使用
解决：

```json
{
  "oh-my-commits.ai.offline": {
    "enabled": true,
    "cachePath": ".oh-my-commits/ai-cache",
    "maxCacheAge": 604800
  }
}
```

::: tip 提示
AI 功能需要配置相应的 API 密钥才能使用。请参考[配置指南](/guide/configuration)了解详细信息。
:::

::: warning 注意
请确保在团队中统一 AI 配置，以保持提交信息的一致性。
:::
