# 配置项

Oh My Commits 提供了丰富的配置选项，让你可以根据需要自定义插件行为。

## 基础配置

### `oh-my-commits.commitMode`

- 类型: `'panel' | 'window' | 'notification' | 'silent'`
- 默认值: `'panel'`
- 说明: 设置提交消息的显示模式

### `oh-my-commits.language`

- 类型: `'zh-CN' | 'en-US'`
- 默认值: `'zh-CN'`
- 说明: 设置界面语言

### `oh-my-commits.autoCommit`

- 类型: `boolean`
- 默认值: `false`
- 说明: 是否在生成提交消息后自动执行提交

## AI 配置

### `oh-my-commits.ai.provider`

- 类型: `'openai' | 'anthropic' | 'custom'`
- 默认值: `'openai'`
- 说明: 选择 AI 服务提供商

### `oh-my-commits.ai.model`

- 类型: `string`
- 默认值: `'gpt-4'`
- 说明: 指定使用的 AI 模型

### `oh-my-commits.ai.temperature`

- 类型: `number`
- 默认值: `0.7`
- 范围: `0.0 - 1.0`
- 说明: 控制 AI 输出的创造性程度

### `oh-my-commits.ai.apiKey`

- 类型: `string`
- 默认值: `''`
- 说明: AI 服务的 API 密钥

::: warning 安全提示
建议通过环境变量或 VSCode 的 settings.json 配置 API 密钥，避免直接在代码中硬编码。
:::

## 提交规范

### `oh-my-commits.commit.convention`

- 类型: `'conventional' | 'gitmoji' | 'custom'`
- 默认值: `'conventional'`
- 说明: 选择提交消息的规范格式

### `oh-my-commits.commit.scopes`

- 类型: `string[]`
- 默认值: `[]`
- 说明: 预设的提交范围列表

### `oh-my-commits.commit.template`

- 类型: `string`
- 默认值: `'<type>(<scope>): <subject>'`
- 说明: 自定义提交消息模板

## 团队配置

::: warning 即将推出
以下配置项将在团队协作功能发布后可用。
:::

### `oh-my-commits.team.configPath`

- 类型: `string`
- 默认值: `'.oh-my-commits/team.json'`
- 说明: 团队配置文件路径

### `oh-my-commits.team.syncEnabled`

- 类型: `boolean`
- 默认值: `false`
- 说明: 是否启用团队配置同步

## 示例配置

```json
{
  "oh-my-commits.commitMode": "panel",
  "oh-my-commits.language": "zh-CN",
  "oh-my-commits.autoCommit": false,
  "oh-my-commits.ai": {
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.7
  },
  "oh-my-commits.commit": {
    "convention": "conventional",
    "scopes": ["feat", "fix", "docs", "style", "refactor"],
    "template": "<type>(<scope>): <subject>"
  }
}
```
