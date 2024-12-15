# 快速开始

## 安装

1. 在 VS Code 中安装插件：

   ```bash
   code --install-extension oh-my-commit
   ```

2. 或者从 VS Code 插件市场安装：
   - 打开 VS Code
   - 按下 `Cmd/Ctrl + Shift + X` 打开插件市场
   - 搜索 "Oh My Commit"
   - 点击 "安装"

## 配置

1. 配置 AI 服务：

   ```json
   {
     "omc.ai.provider": "openai",
     "omc.ai.apiKey": "your-api-key"
   }
   ```

2. 选择提交规范：

   ```json
   {
     "omc.commit.convention": "conventional",
     "omc.commit.scopes": ["feat", "fix", "docs"]
   }
   ```

3. 自定义快捷键（可选）：
   ```json
   {
     "key": "alt+g",
     "command": "omc.generateCommitMessage"
   },
   {
     "key": "alt+c",
     "command": "omc.commit"
   }
   ```

## 基本用法

1. **生成提交消息**：

   - 在 VS Code 中修改代码
   - 按下 `Alt + G` 或在命令面板中执行 `Oh My Commit: Generate Message`
   - AI 将分析你的代码变更并生成提交消息

2. **执行提交**：
   - 预览并编辑生成的提交消息
   - 按下 `Alt + C` 或在命令面板中执行 `Oh My Commit: Commit`
   - 代码将被提交到 Git 仓库

## 提交模式

Oh My Commit 提供了多种提交模式，适应不同的使用场景：

1. **面板模式**（默认）：

   ```json
   {
     "omc.commitMode": "panel"
   }
   ```

   在 VS Code 侧边栏显示提交面板，提供完整的编辑和预览功能。

2. **窗口模式**：

   ```json
   {
     "omc.commitMode": "window"
   }
   ```

   在独立窗口中显示提交界面，适合大屏幕用户。

3. **通知模式**：

   ```json
   {
     "omc.commitMode": "notification"
   }
   ```

   通过通知提示显示提交消息，适合快速提交。

4. **静默模式**：
   ```json
   {
     "omc.commitMode": "silent"
   }
   ```
   自动生成并提交，无需交互，适合自动化场景。

## 下一步

- 查看 [AI 能力](./ai-capabilities.md) 了解更多 AI 特性
- 了解 [提交模式](./commit-modes.md) 的详细用法
- 探索 [团队协作](./team-collaboration.md) 功能

::: tip 提示
首次使用时，建议先配置 AI 服务并选择合适的提交规范。
:::

::: warning 注意
请妥善保管你的 API 密钥，建议使用环境变量或 VS Code 的 settings.json 进行配置。
:::
