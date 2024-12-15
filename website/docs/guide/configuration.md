# 用户配置

YAAC 提供了丰富的配置选项，让你可以根据个人或团队需求自定义使用体验。

## 基础配置

### AI 服务配置

```json
{
  "yaac.ai.provider": "openai",  // 可选：openai, claude, custom
  "yaac.ai.apiKey": "your-api-key",
  "yaac.ai.model": "gpt-4",  // 根据 provider 选择合适的模型
  "yaac.ai.temperature": 0.7,  // 控制创造性，范围 0-1
  "yaac.ai.maxTokens": 500  // 单次生成的最大 token 数
}
```

### 界面设置

```json
{
  "yaac.ui.mode": "panel",  // panel, window, notification, silent
  "yaac.ui.theme": "auto",  // auto, light, dark
  "yaac.ui.language": "zh-CN",  // 界面语言
  "yaac.ui.showIcon": true,  // 是否在状态栏显示图标
  "yaac.ui.autoOpen": true  // 是否自动打开提交界面
}
```

### 快捷键设置

默认快捷键：

- Windows/Linux：
  - 打开提交界面：`Ctrl+Alt+C`
  - 快速提交：`Ctrl+Alt+Enter`
  - 打开设置：`Ctrl+Alt+,`

- macOS：
  - 打开提交界面：`⌘+Option+C`
  - 快速提交：`⌘+Option+Enter`
  - 打开设置：`⌘+Option+,`

## 高级配置

### 提交模板

```json
{
  "yaac.commit.template": {
    "type": ["feat", "fix", "docs", "style", "refactor", "test", "chore"],
    "scope": ["core", "ui", "api", "docs"],
    "format": "${type}(${scope}): ${subject}\n\n${body}"
  }
}
```

### Git 集成

```json
{
  "yaac.git.signCommit": false,  // 是否签名提交
  "yaac.git.autoStage": true,  // 是否自动暂存修改
  "yaac.git.pushOnCommit": false  // 是否在提交后自动推送
}
```

### 团队配置

```json
{
  "yaac.team.configPath": ".yaac/config.json",  // 团队配置文件路径
  "yaac.team.enforceConfig": true,  // 是否强制使用团队配置
  "yaac.team.allowOverride": ["ui.theme", "ui.language"]  // 允许个人覆盖的配置项
}
```

## 配置文件位置

- 用户配置：
  - Windows: `%APPDATA%\Code\User\settings.json`
  - macOS: `~/Library/Application Support/Code/User/settings.json`
  - Linux: `~/.config/Code/User/settings.json`

- 工作区配置：
  - 项目根目录下的 `.vscode/settings.json`

- 团队配置：
  - 项目根目录下的 `.yaac/config.json`

## 配置优先级

配置项的优先级从高到低：

1. 命令行参数
2. 工作区配置
3. 团队配置
4. 用户配置
5. 默认配置

## 导入/导出配置

YAAC 提供了配置导入/导出功能，方便在多个环境间同步配置：

1. 导出配置：
   - 命令面板中输入 "YAAC: 导出配置"
   - 选择导出位置
   - 配置将被保存为 JSON 文件

2. 导入配置：
   - 命令面板中输入 "YAAC: 导入配置"
   - 选择配置文件
   - 确认是否覆盖现有配置
