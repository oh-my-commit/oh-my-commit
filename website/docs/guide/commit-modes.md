# 提交模式

YAAC 提供多种提交模式，满足不同场景的需求。

## 界面模式

### 1. 面板模式（Panel Mode）

最完整的功能体验：

- **特点**
  - 集成在 VSCode 面板中
  - 完整的文件树视图
  - 实时 diff 预览
  - 详细的提交选项

- **适用场景**
  - 复杂的代码提交
  - 需要仔细审查的变更
  - 团队协作项目

- **快捷键**
  - 打开面板：`Ctrl+Alt+C` / `⌘+Option+C`
  - 提交：`Ctrl+Enter` / `⌘+Enter`
  - 切换文件：`Tab` / `Shift+Tab`

### 2. 窗口模式（Window Mode）

浮动窗口，不影响编辑区：

- **特点**
  - 可拖动的浮动窗口
  - 简洁的界面布局
  - 基础的 diff 预览
  - 快速编辑提交信息

- **适用场景**
  - 中等规模的提交
  - 需要同时查看代码
  - 多显示器工作环境

### 3. 通知模式（Notification Mode）

最小化干扰的提交方式：

- **特点**
  - 轻量级通知界面
  - 快速确认和修改
  - 自动消失
  - 低干扰

- **适用场景**
  - 小型代码修改
  - 频繁的提交
  - 专注编码时

### 4. 静默模式（Silent Mode）

完全不干扰的自动提交：

- **特点**
  - 仅状态栏显示
  - 完全自动化
  - 可配置规则
  - 最小化交互

- **适用场景**
  - 自动化工作流
  - 简单的文档更新
  - 配置文件修改

## 提交工作流

### 1. 标准工作流

```mermaid
graph LR
    A[代码修改] --> B[打开 YAAC]
    B --> C[AI 分析]
    C --> D[预览提交]
    D --> E[确认提交]
```

### 2. 快速工作流

```mermaid
graph LR
    A[代码修改] --> B[快速提交]
    B --> C[AI 自动处理]
    C --> D[完成提交]
```

### 3. 团队工作流

```mermaid
graph LR
    A[代码修改] --> B[YAAC 分析]
    B --> C[应用团队规范]
    C --> D[审查提交]
    D --> E[确认提交]
```

## 配置示例

### 1. 面板模式配置

```json
{
  "yaac.ui.mode": "panel",
  "yaac.ui.panel": {
    "position": "right",
    "width": 40,
    "showDiff": true,
    "showTree": true
  }
}
```

### 2. 窗口模式配置

```json
{
  "yaac.ui.mode": "window",
  "yaac.ui.window": {
    "width": 600,
    "height": 400,
    "remember": true,
    "alwaysOnTop": false
  }
}
```

### 3. 通知模式配置

```json
{
  "yaac.ui.mode": "notification",
  "yaac.ui.notification": {
    "duration": 5000,
    "position": "top-right",
    "interactive": true
  }
}
```

### 4. 静默模式配置

```json
{
  "yaac.ui.mode": "silent",
  "yaac.ui.silent": {
    "autoCommit": true,
    "rules": [
      {
        "files": ["*.md", "*.txt"],
        "message": "docs: update documentation"
      }
    ]
  }
}
```

## 模式切换

### 快捷键设置

```json
{
  "keybindings": [
    {
      "key": "ctrl+alt+1",
      "command": "yaac.switchMode",
      "args": "panel"
    },
    {
      "key": "ctrl+alt+2",
      "command": "yaac.switchMode",
      "args": "window"
    },
    {
      "key": "ctrl+alt+3",
      "command": "yaac.switchMode",
      "args": "notification"
    },
    {
      "key": "ctrl+alt+4",
      "command": "yaac.switchMode",
      "args": "silent"
    }
  ]
}
```

### 命令面板

1. 打开命令面板（`Ctrl+Shift+P` / `⌘+Shift+P`）
2. 输入 "YAAC: 切换模式"
3. 选择目标模式

## 最佳实践

1. **根据项目选择模式**
   - 大型项目：面板模式
   - 中型项目：窗口模式
   - 小型项目：通知模式
   - 自动化任务：静默模式

2. **配置快捷键**
   - 为常用操作设置快捷键
   - 根据使用频率调整
   - 避免冲突

3. **优化工作流**
   - 使用 Git 暂存区
   - 合理分割提交
   - 保持提交原子性
