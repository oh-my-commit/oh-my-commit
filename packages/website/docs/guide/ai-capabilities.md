# AI 能力

Oh My Commits 的核心特色是强大的 AI 能力，它能深入理解你的代码变更，生成专业的提交信息。

## 支持的模型

### OpenAI

- **GPT-4**（推荐）

  - 最强大的理解能力
  - 支持多语言生成
  - 更准确的代码分析

- **GPT-3.5-Turbo**
  - 更快的响应速度
  - 较好的性价比
  - 适合简单变更

### Anthropic

- **Claude 2**
  - 优秀的代码理解
  - 详细的变更分析
  - 支持长文本输入

### Oh My Commits 专业模型

基于大量真实代码提交数据训练的专业模型：

- 更好的提交规范理解
- 更快的响应速度
- 更低的资源消耗

## 语言支持

Oh My Commits 支持生成多种语言的提交消息：

- 中文（简体）
- English
- 日本語
- 한국어
- Español
- Français
- Deutsch

配置示例：

```json
{
  "omc.language": "zh-CN",
  "omc.ai.multilingual": true
}
```

## 提交规范

支持多种主流的提交规范：

### Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Gitmoji

```
<emoji> <type>(<scope>): <subject>

<body>

<footer>
```

### 自定义模板

你可以定义自己的提交模板：

```json
{
  "omc.commit.template": "[<type>] <scope>: <subject>",
  "omc.commit.types": ["Feature", "Fix", "Docs", "Style", "Refactor"]
}
```

## 代码分析

Oh My Commits 会深入分析你的代码变更：

1. **语法理解**

   - 识别代码结构
   - 理解语言特性
   - 分析函数调用

2. **变更分类**

   - 新增功能
   - Bug 修复
   - 重构优化
   - 文档更新

3. **影响评估**
   - API 变更
   - 破坏性改动
   - 性能影响

## 最佳实践

1. **选择合适的模型**

   ```json
   {
     "omc.ai.provider": "openai",
     "omc.ai.model": "gpt-4",
     "omc.ai.temperature": 0.7
   }
   ```

2. **优化提示词**

   ```json
   {
     "omc.ai.customPrompt": {
       "prefix": "分析以下代码变更：\n",
       "suffix": "\n请生成符合规范的提交消息。"
     }
   }
   ```

3. **配置审查规则**
   ```json
   {
     "omc.ai.review": {
       "checkBreakingChanges": true,
       "checkSecurity": true,
       "checkPerformance": true
     }
   }
   ```

## 使用场景

### 1. 个人开发

```bash
# 示例：快速提交
git add .
oh-my-commits commit
```

AI 将自动：

1. 分析你的代码变更
2. 生成符合规范的提交信息
3. 提供详细的变更说明

### 2. 团队协作

```bash
# 示例：团队规范提交
oh-my-commits commit --template team
```

特点：

- 统一的提交格式
- 自动应用团队规范
- 多语言本地化

### 3. 代码审查

```bash
# 示例：审查辅助
oh-my-commits review PR-123
```

功能：

- 自动分析 PR 内容
- 生成审查建议
- 标注潜在问题

## 配置与优化

### 1. 模型选择

```json
{
  "omc.ai.provider": "openai",
  "omc.ai.model": "gpt-4",
  "omc.ai.temperature": 0.7
}
```

### 2. 提示词优化

```json
{
  "omc.ai.prompt": {
    "template": "作为一个经验丰富的开发者，请分析以下代码变更并生成提交信息：\n{diff}",
    "language": "zh-CN",
    "style": "professional"
  }
}
```

### 3. 性能调优

```json
{
  "omc.ai.cache": true,
  "omc.ai.timeout": 10000,
  "omc.ai.retries": 3
}
```

## 常见问题

1. **如何处理 API 限流？**

   ```json
   {
     "omc.ai.rateLimit": {
       "maxRequests": 100,
       "perMinute": 60,
       "retryDelay": 1000
     }
   }
   ```

2. **如何使用代理？**

   ```json
   {
     "omc.ai.proxy": {
       "host": "127.0.0.1",
       "port": 7890,
       "protocol": "http"
     }
   }
   ```

3. **如何处理超时？**
   ```json
   {
     "omc.ai.timeout": {
       "request": 10000,
       "generation": 30000
     }
   }
   ```

::: warning 注意
使用 AI 功能需要配置相应的 API 密钥。请确保密钥安全，不要将其提交到代码仓库。
:::

::: tip 提示
如果你的团队有特殊的提交规范，可以通过自定义模板和提示词来满足需求。
:::
