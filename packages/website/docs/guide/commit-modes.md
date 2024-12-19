# 提交模式

Oh My Commit 提供了多种提交模式，以适应不同的开发场景和团队需求。

## 快速模式

适用于简单的代码变更，自动生成提交信息。

```json
{
  "oh-my-commit.mode.quick": {
    "enabled": true,
    "useAI": true,
    "template": "<type>(<scope>): <subject>",
    "skipPrompts": true
  }
}
```

## 交互模式

提供交互式界面，引导用户完成提交。

```json
{
  "oh-my-commit.mode.interactive": {
    "enabled": true,
    "steps": ["type", "scope", "subject", "body", "breaking", "issues"],
    "validation": true
  }
}
```

## 团队模式

强制执行团队规范，确保提交信息一致性。

```json
{
  "oh-my-commit.mode.team": {
    "enabled": true,
    "configPath": ".oh-my-commit/team.json",
    "enforceRules": true,
    "requireReview": true
  }
}
```

## AI 模式

使用 AI 助手生成专业的提交信息。

```json
{
  "oh-my-commit.mode.ai": {
    "enabled": true,
    "model": "gpt-4",
    "language": "zh-CN",
    "style": "conventional",
    "detailed": true
  }
}
```

## 自定义模式

根据项目需求自定义提交流程。

```json
{
  "oh-my-commit.mode.custom": {
    "enabled": true,
    "hooks": {
      "pre-commit": ".oh-my-commit/hooks/pre-commit.js",
      "post-commit": ".oh-my-commit/hooks/post-commit.js"
    },
    "templates": {
      "feature": "feat(${scope}): ${subject}",
      "bugfix": "fix(${scope}): ${subject}"
    }
  }
}
```

## 模式切换

### 命令行切换

```bash
# 切换到快速模式
oh-my-commit mode quick

# 切换到交互模式
oh-my-commit mode interactive

# 切换到 AI 模式
oh-my-commit mode ai
```

### 配置文件切换

```json
{
  "oh-my-commit.mode": {
    "default": "interactive",
    "allowSwitch": true,
    "shortcuts": {
      "q": "quick",
      "i": "interactive",
      "a": "ai"
    }
  }
}
```

## 模式组合

### 快速 + AI

```json
{
  "oh-my-commit.mode.hybrid": {
    "primary": "quick",
    "secondary": "ai",
    "conditions": {
      "useAI": "git diff --staged | wc -l > 10",
      "useQuick": "git diff --staged | wc -l <= 10"
    }
  }
}
```

### 团队 + 交互

```json
{
  "oh-my-commit.mode.hybrid": {
    "primary": "team",
    "secondary": "interactive",
    "validation": true,
    "fallback": "interactive"
  }
}
```

## 最佳实践

### 1. 模式选择

- 小型变更：使用快速模式
- 重要特性：使用交互模式
- 团队项目：使用团队模式
- 复杂变更：使用 AI 模式

### 2. 配置优化

```json
{
  "oh-my-commit.mode.optimize": {
    "cacheEnabled": true,
    "historySize": 100,
    "suggestions": true,
    "autoSwitch": true
  }
}
```

### 3. 工作流集成

```json
{
  "oh-my-commit.mode.workflow": {
    "branch": {
      "feature/*": "interactive",
      "bugfix/*": "quick",
      "release/*": "team"
    },
    "path": {
      "src/**": "ai",
      "docs/**": "quick",
      "test/**": "interactive"
    }
  }
}
```

## 常见问题

### 1. 模式冲突

问题：多个模式配置冲突
解决：

```json
{
  "oh-my-commit.mode.conflict": {
    "priority": ["team", "ai", "interactive", "quick"],
    "resolution": "highest"
  }
}
```

### 2. 性能问题

问题：某些模式响应慢
解决：

```json
{
  "oh-my-commit.mode.performance": {
    "cache": true,
    "timeout": 5000,
    "parallel": true,
    "lightweight": true
  }
}
```

### 3. 离线支持

问题：离线环境使用受限
解决：

```json
{
  "oh-my-commit.mode.offline": {
    "fallback": "interactive",
    "cacheTemplates": true,
    "localValidation": true
  }
}
```

::: tip 提示
选择合适的提交模式可以显著提高开发效率。建议根据项目规模和团队需求选择适当的模式。
:::

::: warning 注意
某些模式（如 AI 模式）可能需要额外的配置和依赖。请确保相关服务可用。
:::
