# YAAC (Yet Another Auto Commit)

🚀 一款基于 AI 的智能 Git 提交插件，让你的每一次提交都专业而优雅。YAAC（读作"雅刻"）致力于提供最流畅的 AI 辅助提交体验。

## 特性

- 🤖 智能分析代码变更，自动生成高质量的提交信息
- 🎨 优雅的用户界面，流畅的操作体验
- 🔧 高度可定制的提交模板和规则
- 🌍 支持多语言（中英文）
- ⚡ 快速响应，支持离线模式
- 🤝 团队协作友好

## 安装

请查看我们的 [详细安装指南](docs/INSTALLATION.md) 了解完整的安装和配置步骤。

简要步骤：

1. 安装 VSCode 扩展 "YAAC"
2. 安装 Python 依赖：`pip install gcop`
3. 配置所需的环境变量
4. 开始使用！

## 使用方法

1. 在 VSCode 中打开一个 Git 仓库
2. 当你完成代码修改后，点击源代码管理图标
3. 点击 "AI Commit" 按钮或使用快捷键 `cmd+shift+c`
4. 插件会自动分析你的更改并生成合适的提交信息
5. 你可以直接使用或编辑生成的信息
6. 确认后提交更改

## 配置项

| 配置项                         | 类型    | 默认值                   | 说明                         | 可选值                                                                                    |
| ------------------------------ | ------- | ------------------------ | ---------------------------- | ----------------------------------------------------------------------------------------- |
| `yaac.basic.enabled`           | boolean | true                     | 是否启用 YAAC                | `true` / `false`                                                                          |
| `yaac.basic.uiLanguage`        | string  | "system"                 | 界面显示语言                 | • `system`: 跟随系统语言<br>• `zh_CN`: 中文<br>• `en_US`: English                         |
| `yaac.ui.mode`                 | string  | "webview"                | 提交界面模式选择             | • `quickInput`: 快速提交，单行输入框<br>• `webview`: 专业模式，完整编辑器                 |
| `yaac.ui.webview.layout`       | string  | "horizontal"             | Webview 模式下的布局方式     | • `vertical`: 编辑器和预览上下排列<br>• `horizontal`: 编辑器和预览左右排列                |
| `yaac.ui.webview.editor`       | string  | "rich"                   | Webview 模式下的编辑器类型   | • `plain`: 纯文本编辑器<br>• `rich`: 富文本编辑器                                         |
| `yaac.git.emptyChangeBehavior` | string  | "skip"                   | 当工作区没有文件变更时的行为 | • `skip`: 跳过空更改<br>• `amend`: 修改最近一次提交                                       |
| `yaac.git.autoStage`           | boolean | true                     | 是否自动暂存所有更改         | `true` / `false`                                                                          |
| `yaac.git.commitLanguage`      | string  | "system"                 | Git 提交信息的语言           | • `system`: 跟随系统语言<br>• `zh_CN`: 中文提交信息<br>• `en_US`: English commit messages |
| `yaac.ai.provider`             | string  | "OpenAI / GPT 3.5 Turbo" | 选择 AI 提供商和模型         | • `OpenAI / GPT 4`: 高精度（需 API）<br>• `OpenAI / GPT 3.5 Turbo`: 快速高效（需 API）    |
| `yaac.ai.providers`            | object  | {}                       | AI 提供商的启用状态配置      | 键值对形式，提供商名称: 启用状态                                                          |
| `yaac.ai.apiKeys`              | object  | -                        | AI 服务提供商的 API 密钥配置 | • `openai`: OpenAI API 密钥<br>• `anthropic`: Anthropic API 密钥                          |
| `yaac.telemetry.enabled`       | boolean | true                     | 是否启用使用数据收集（匿名） | `true` / `false`                                                                          |
| `yaac.telemetry.shareLevel`    | string  | "basic"                  | 数据收集级别                 | • `minimal`: 仅基本错误信息<br>• `basic`: 包含使用统计<br>• `full`: 额外包含 AI 质量反馈  |
| `yaac.feedback.enabled`        | boolean | true                     | 是否启用用户反馈功能         | `true` / `false`                                                                          |

你可以通过以下方式配置：

1. VSCode 设置界面：搜索 "YAAC"
2. 直接编辑 settings.json：

```json
{
  "yaac.basic.enabled": true,
  "yaac.ui.mode": "webview",
  "yaac.git.commitLanguage": "zh_CN",
  "yaac.ai.provider": "OpenAI / GPT 4"
}
```

## 贡献指南

欢迎贡献代码！请查看我们的 [贡献指南](CONTRIBUTING.md) 了解详情。

## 许可证

MIT

## 支持

如果你遇到任何问题或有建议，请：

1. 查看 [常见问题](FAQ.md)
2. 提交 [Issue](https://github.com/cs-magic/yaac/issues)
3. 加入我们的 [Discord 社区](https://discord.gg/yaac)
