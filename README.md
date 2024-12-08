<div align="center">

# YAAC - Your Artistic Aide for Commits

一款专注用户体验、重新定义 Git Commit 的 VSCode 插件，助力你的每一次提交，优雅而专业。

> YAAC 中文名读作"雅刻"，是优雅的雅，也是雅虎的雅 [Doge]。

</div>

## 产品亮点

- **极致用户体验**

  - 精心设计的现代化界面，支持亮暗主题
  - 流畅的动画过渡，零延迟响应
  - 智能的上下文感知，自动适应你的工作流
  - 键盘优先的操作设计，提升效率

- **高效工作流**
  - 一键式智能提交，告别繁琐操作
  - 实时预览和编辑，所见即所得
  - 快速切换提交方案，灵活应对不同场景
  - 团队配置共享，统一提交风格

## AI 能力

- **多模型支持**

  - 内置 YAAC 专业模型，为代码提交优化
  - 支持 OpenAI GPT-3.5/4，Claude 等主流模型
  - 可自定义 AI 服务端点，灵活扩展

- **智能分析**

  - 深度理解代码变更上下文
  - 自动识别重构、bugfix、feature 等类型
  - 生成符合团队风格的提交信息

- **持续优化**
  - 基于用户反馈不断改进
  - 定期更新模型能力
  - 支持自定义训练微调

## 使用方法

1. 在 VSCode 扩展商店安装 "YAAC"
2. 当你完成代码修改后，按 `cmd+shift+p` 打开命令面板，搜索 "YAAC: Quick Commit"
3. 插件会自动分析你的更改并生成合适的提交信息，你可以回车确认或者修改

## 用户配置

| 配置项                         | 类型    | 默认值      | 说明                                              | 可选值                                                                                                                                                |
| ------------------------------ | ------- | ----------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yaac.basic.enabled`           | boolean | true        | 是否启用 YAAC                                     | `true / false`                                                                                                                                        |
| `yaac.basic.uiLanguage`        | string  | "system"    | 界面显示语言                                      | • `system`: 跟随系统语言<br>• `zh_CN`: 中文<br>• `en_US`: English                                                                                     |
| `yaac.ac.model`                | string  | "yaac.test" | 选择自动提交（AC）服务的供应商与模型              | • `yaac.test`<br>• `yaac.balanced`<br>• `yaac.professional`<br>• `cgop.openai.chatgpt-3.5`<br>• `cgop.openai.chatgpt-4`                               |
| `yaac.git.emptyChangeBehavior` | string  | "skip"      | 当工作区没有文件变更时的行为                      | • `skip`: 跳过空更改，不执行任何操作<br>• `amend`: 修改最近一次提交（git commit --amend）                                                             |
| `yaac.git.autoStage`           | boolean | true        | 是否自动暂存所有更改                              | `true / false`                                                                                                                                        |
| `yaac.git.commitLanguage`      | string  | "system"    | Git 提交信息的语言                                | • `system`: 跟随系统语言<br>• `zh_CN`: 中文提交信息<br>• `en_US`: English commit messages                                                             |
| `yaac.ai.apiKeys`              | object  | -           | AI 服务提供商的 API 密钥配置                      |                                                                                                                                                       |
| `yaac.ui.mode`                 | string  | "webview"   | 提交界面模式选择                                  | • `quickInput`: Quick & Simple: Single-line input box for fast commits<br>• `webview`: Professional: Full-featured editor with preview and formatting |
| `yaac.telemetry.enabled`       | boolean | true        | 是否启用使用数据收集（匿名）                      | `true / false`                                                                                                                                        |
| `yaac.telemetry.shareLevel`    | string  | "basic"     | 数据收集级别                                      | • `minimal`: 仅收集基本错误信息<br>• `basic`: 包含功能使用统计和性能数据<br>• `full`: 额外包含 AI 生成结果的质量反馈                                  |
| `yaac.feedback.enabled`        | boolean | true        | 是否启用用户反馈功能（支持一键创建 GitHub Issue） | `true / false`                                                                                                                                        |

## 贡献指南

欢迎贡献代码！请查看我们的 [贡献指南](CONTRIBUTING.md) 了解详情。

## 支持

如果你遇到任何问题或有建议，请：

1. 查看 [常见问题](FAQ.md)
2. 提交 [Issue](https://github.com/cs-magic/yaac/issues)
3. 加入我们的 [Discord 社区](https://discord.gg/yaac)

## 许可证

YAAC 使用 [MIT + Commons Clause](./LICENSE) 许可证。这意味着：

- ✅ 你可以自由地使用、修改和分发本软件
- ✅ 你可以在个人或内部项目中使用本软件
- ✅ 你可以创建和分发本软件的修改版本
- ❌ 你不能将本软件作为付费服务或产品销售
- ❌ 你不能在未经授权的情况下商业化使用本软件

如果你想在商业环境中使用 YAAC，请联系我们获取商业授权。

详细条款请查看 [LICENSE](./LICENSE) 文件。
