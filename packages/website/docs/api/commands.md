# 命令列表

Oh My Commit 提供了一系列 VSCode 命令，你可以通过命令面板（`Cmd/Ctrl + Shift + P`）调用它们。

## 核心命令

### `omc.generateCommitMessage`

生成提交消息。分析当前的代码变更，使用 AI 生成符合规范的提交消息。

**快捷键**：`Alt + G`

### `omc.commit`

执行 Git 提交。使用生成的提交消息或自定义消息进行提交。

**快捷键**：`Alt + C`

### `omc.regenerate`

重新生成提交消息。如果当前的提交消息不满意，可以使用此命令重新生成。

**快捷键**：`Alt + R`

## 配置命令

### `omc.openSettings`

打开 Oh My Commit 设置面板。快速配置插件的各项参数。

### `omc.resetSettings`

重置所有设置为默认值。

### `omc.importSettings`

从文件导入设置。

### `omc.exportSettings`

导出当前设置到文件。

## AI 相关命令

### `omc.switchAIProvider`

切换 AI 服务提供商。

### `omc.configureAI`

配置 AI 相关参数，如模型、温度等。

### `omc.testAIConnection`

测试与 AI 服务的连接。

## 团队协作命令

::: warning 即将推出
以下命令将在团队协作功能发布后可用。
:::

### `omc.syncTeamConfig`

同步团队配置。

### `omc.showTeamActivity`

显示团队活动面板。

## 使用示例

1. 生成提交消息：

   ```
   1. 在 VSCode 中进行代码修改
   2. 按下 Alt + G 或在命令面板中执行 omc.generateCommitMessage
   3. 在弹出的面板中预览生成的提交消息
   4. 按下 Alt + C 或执行 omc.commit 完成提交
   ```

2. 切换 AI 提供商：
   ```
   1. 打开命令面板 (Cmd/Ctrl + Shift + P)
   2. 执行 omc.switchAIProvider
   3. 在下拉菜单中选择目标提供商
   4. 根据提示配置相关参数
   ```
