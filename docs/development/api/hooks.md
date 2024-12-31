# 事件钩子

Oh My Commit 提供了一系列事件钩子，让你可以在特定时机执行自定义逻辑。

## 提交相关钩子

### `onBeforeCommit`

在执行提交前触发。

```typescript
interface BeforeCommitEvent {
  message: string // 提交消息
  files: string[] // 待提交的文件列表
  cancel(): void // 取消提交
  setMessage(msg: string) // 修改提交消息
}

oh -
  my -
  commits.hooks.onBeforeCommit((event) => {
    // 例：添加 JIRA 任务编号
    const taskId = "PROJ-123"
    event.setMessage(`[${taskId}] ${event.message}`)
  })
```

### `onAfterCommit`

在提交完成后触发。

```typescript
interface AfterCommitEvent {
  message: string // 提交消息
  hash: string // 提交哈希
  files: string[] // 已提交的文件列表
}

oh -
  my -
  commits.hooks.onAfterCommit((event) => {
    // 例：在提交后通知团队
    notifyTeam(`New commit: ${event.hash}`)
  })
```

## AI 相关钩子

### `onBeforeGenerate`

在生成提交消息前触发。

```typescript
interface BeforeGenerateEvent {
  files: string[] // 变更文件列表
  diff: string // 代码差异
  cancel(): void // 取消生成
  setPrompt(text: string) // 修改 AI 提示
}

oh -
  my -
  commits.hooks.onBeforeGenerate((event) => {
    // 例：根据文件类型调整提示
    if (event.files.some((f) => f.endsWith(".test.ts"))) {
      event.setPrompt("This commit includes test files...")
    }
  })
```

### `onAfterGenerate`

在生成提交消息后触发。

```typescript
interface AfterGenerateEvent {
  message: string // 生成的消息
  setMessage(msg: string) // 修改消息
}

oh -
  my -
  commits.hooks.onAfterGenerate((event) => {
    // 例：添加自定义前缀
    event.setMessage(`[AUTO] ${event.message}`)
  })
```

## 配置相关钩子

### `onConfigChange`

在配置变更时触发。

```typescript
interface ConfigChangeEvent {
  key: string // 变更的配置项
  value: any // 新值
  oldValue: any // 旧值
}

oh -
  my -
  commits.hooks.onConfigChange((event) => {
    // 例：在切换语言时刷新界面
    if (event.key === "oh-my-commit.language") {
      refreshUI()
    }
  })
```

## 团队协作钩子

::: warning 即将推出
以下钩子将在团队协作功能发布后可用。
:::

### `onTeamConfigSync`

在团队配置同步时触发。

```typescript
interface TeamConfigSyncEvent {
  config: object // 同步的配置
  source: string // 配置来源
}
```

### `onTeamActivity`

在检测到团队活动时触发。

```typescript
interface TeamActivityEvent {
  type: string // 活动类型
  user: string // 用户
  data: any // 活动数据
}
```

## 最佳实践

1. 错误处理：

   ```typescript
   oh -
     my -
     commits.hooks.onBeforeCommit((event) => {
       try {
         // 你的逻辑
       } catch (error) {
         console.error("Hook error:", error)
         event.cancel() // 出错时取消操作
       }
     })
   ```

2. 异步操作：

   ```typescript
   oh -
     my -
     commits.hooks.onAfterCommit(async (event) => {
       await updateExternalSystem(event.hash)
     })
   ```

3. 清理钩子：
   ```typescript
   const disposable = oh - my - commits.hooks.onConfigChange(() => {})
   // 当不再需要时
   disposable.dispose()
   ```

## 钩子配置

### 基础配置

```json
{
  "oh-my-commit.hooks": {
    "enabled": true,
    "timeout": 5000,
    "parallel": true,
    "strict": false
  }
}
```

### 钩子路径

```json
{
  "oh-my-commit.hooks.path": {
    "pre-commit": ".oh-my-commit/hooks/pre-commit.js",
    "post-commit": ".oh-my-commit/hooks/post-commit.js",
    "commit-msg": ".oh-my-commit/hooks/commit-msg.js"
  }
}
```

### 钩子顺序

```json
{
  "oh-my-commit.hooks.order": {
    "pre-commit": ["lint", "test", "validate"],
    "post-commit": ["notify", "docs", "deploy"]
  }
}
```

## 内置钩子

### 代码检查

```javascript
// .oh-my-commit/hooks/lint.js
module.exports = async (context) => {
  const { files } = context

  // ESLint 检查
  const results = await lint(files)

  if (results.errorCount > 0) {
    return {
      pass: false,
      message: "代码存在 ESLint 错误，请修复后重试",
    }
  }

  return { pass: true }
}
```

### 测试运行

```javascript
// .oh-my-commit/hooks/test.js
module.exports = async (context) => {
  const { files } = context

  // 运行测试
  const results = await runTests(files)

  if (results.failures > 0) {
    return {
      pass: false,
      message: "测试失败，请修复后重试",
    }
  }

  return { pass: true }
}
```

## 自定义钩子

### 示例：JIRA 集成

```javascript
// .oh-my-commit/hooks/jira.js
module.exports = async (context) => {
  const { message } = context
  const config = await getConfig("jira")

  // 从分支名获取 JIRA ID
  const issueId = getCurrentBranch().match(/\w+-\d+/)?.[0]

  if (issueId) {
    // 更新 JIRA 问题状态
    await updateJiraIssue(issueId, {
      status: "In Review",
      comment: `提交: ${message}`,
    })
  }

  return { pass: true }
}
```

### 示例：自动部署

```javascript
// .oh-my-commit/hooks/deploy.js
module.exports = async (context) => {
  const { branch, message } = context

  // 仅在主分支上部署
  if (branch === "main") {
    // 触发部署
    await deploy({
      env: "production",
      version: getVersion(),
      changelog: message,
    })
  }

  return { pass: true }
}
```

## 最佳实践

### 1. 错误处理

```javascript
module.exports = async (context) => {
  try {
    // 执行钩子逻辑
    const result = await someOperation()
    return { pass: true }
  } catch (error) {
    return {
      pass: false,
      message: `操作失败: ${error.message}`,
    }
  }
}
```

### 2. 异步操作

```javascript
module.exports = async (context) => {
  // 并行执行多个检查
  const [lintResult, testResult] = await Promise.all([lint(context.files), test(context.files)])

  if (!lintResult.pass || !testResult.pass) {
    return {
      pass: false,
      message: "检查失败，请查看详细信息",
    }
  }

  return { pass: true }
}
```

### 3. 配置管理

```javascript
module.exports = async (context) => {
  // 读取配置
  const config = await getConfig("hooks")

  // 根据配置执行操作
  if (config.strict) {
    // 严格模式下的检查
  } else {
    // 普通模式下的检查
  }

  return { pass: true }
}
```

## 常见问题

### 1. 钩子超时

问题：钩子执行时间过长
解决：

```json
{
  "oh-my-commit.hooks.timeout": {
    "pre-commit": 10000,
    "post-commit": 30000,
    "commit-msg": 5000
  }
}
```

### 2. 钩子错误

问题：钩子执行失败
解决：

```json
{
  "oh-my-commit.hooks.error": {
    "ignore": ["lint", "test"],
    "retry": 3,
    "delay": 1000
  }
}
```

### 3. 性能问题

问题：钩子影响性能
解决：

```json
{
  "oh-my-commit.hooks.performance": {
    "cache": true,
    "parallel": true,
    "lightweight": true
  }
}
```

::: tip 提示
钩子是扩展 Oh My Commit 功能的强大方式。建议根据项目需求合理使用钩子。
:::

::: warning 注意
请确保钩子代码的质量，避免影响提交性能。
:::
