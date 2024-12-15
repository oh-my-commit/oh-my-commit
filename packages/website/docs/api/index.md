# API 参考

Oh My Commits 提供了丰富的 API，让您可以根据需求自定义和扩展功能。

## 命令行接口

### 主命令

```bash
# 直接执行提交（最常用操作）
omc
```

### 子命令

```bash
# 基础操作
omc-init              # 初始化配置
omc-gen               # 生成提交信息
omc-check             # 检查提交信息

# 模式选择
omc-conventional      # 使用 conventional 模式
omc-simple           # 使用简单模式

# 语言选择
omc-en               # 使用英文
omc-zh               # 使用中文

# 团队相关
omc-team             # 团队模式
omc-team-init        # 团队配置初始化
omc-team-check       # 团队规范检查

# 其他功能
omc-debug            # 调试模式
```

### 选项参数

每个命令都支持以下选项：

```bash
# 使用特定模式
--mode <mode>

# 指定语言
--lang <language>

# 应用团队配置
--team

# 启用调试模式
--debug
```

## Node.js API

### 基本用法

```javascript
const { OhMyCommits } = require("oh-my-commits");

// 创建实例
const omc = new OhMyCommits({
  language: "zh-CN",
  convention: "conventional",
});

// 生成提交信息
const message = await omc.generate({
  files: ["src/index.js"],
  diff: "git diff content",
});

// 执行提交
await omc.commit({
  message,
  files: ["src/index.js"],
});
```

### 事件监听

```javascript
// 监听事件
omc.on("commit", (data) => {
  console.log("提交完成:", data);
});

omc.on("error", (error) => {
  console.error("发生错误:", error);
});
```

## 配置 API

### 读取配置

```javascript
const { getConfig } = require("oh-my-commits");

// 获取全局配置
const config = await getConfig();

// 获取特定配置
const aiConfig = await getConfig("ai");
```

### 更新配置

```javascript
const { updateConfig } = require("oh-my-commits");

// 更新配置
await updateConfig({
  language: "en-US",
  ai: {
    enabled: true,
  },
});
```

## 钩子 API

### 注册钩子

```javascript
const { registerHook } = require("oh-my-commits");

// 注册提交前钩子
registerHook("pre-commit", async (context) => {
  const { files, message } = context;
  // 执行检查
  return { pass: true };
});
```

### 移除钩子

```javascript
const { removeHook } = require("oh-my-commits");

// 移除钩子
removeHook("pre-commit", hookId);
```

## AI API

### 生成提交信息

```javascript
const { generateMessage } = require("oh-my-commits");

// 生成提交信息
const message = await generateMessage({
  diff: "git diff content",
  language: "zh-CN",
  type: "feat",
});
```

### 代码分析

```javascript
const { analyzeCode } = require("oh-my-commits");

// 分析代码变更
const analysis = await analyzeCode({
  files: ["src/index.js"],
  diff: "git diff content",
});
```

## Git API

### 获取变更

```javascript
const { getChanges } = require("oh-my-commits");

// 获取暂存区变更
const changes = await getChanges({
  staged: true,
});
```

### 执行提交

```javascript
const { commit } = require("oh-my-commits");

// 执行提交
await commit({
  message: "feat: add new feature",
  files: ["src/index.js"],
});
```

## 插件 API

### 创建插件

```javascript
const { createPlugin } = require("oh-my-commits");

// 创建插件
const plugin = createPlugin({
  name: "my-plugin",
  version: "1.0.0",
  hooks: {
    "pre-commit": async (context) => {
      // 插件逻辑
      return { pass: true };
    },
  },
});
```

### 注册插件

```javascript
const { registerPlugin } = require("oh-my-commits");

// 注册插件
registerPlugin(plugin);
```

## 工具 API

### 文件操作

```javascript
const { readFile, writeFile } = require("oh-my-commits");

// 读取文件
const content = await readFile("path/to/file");

// 写入文件
await writeFile("path/to/file", content);
```

### 配置验证

```javascript
const { validateConfig } = require("oh-my-commits");

// 验证配置
const result = await validateConfig(config);
```

## 类型定义

### 配置类型

```typescript
interface Config {
  language: string;
  convention: string;
  ai: {
    enabled: boolean;
    provider: string;
    model: string;
  };
  hooks: {
    enabled: boolean;
    timeout: number;
  };
}
```

### 上下文类型

```typescript
interface Context {
  files: string[];
  message: string;
  branch: string;
  author: string;
  timestamp: number;
}
```

## 错误处理

### 错误类型

```javascript
const { CommitError, ConfigError, HookError } = require("oh-my-commits/errors");

try {
  await omc.commit(message);
} catch (error) {
  if (error instanceof CommitError) {
    // 处理提交错误
  }
}
```

### 错误码

```javascript
const { ErrorCodes } = require("oh-my-commits/errors");

switch (error.code) {
  case ErrorCodes.INVALID_CONFIG:
    // 处理配置错误
    break;
  case ErrorCodes.HOOK_TIMEOUT:
    // 处理钩子超时
    break;
}
```

::: tip 提示
更多 API 详情请参考各个功能模块的文档。
:::

::: warning 注意
某些 API 可能需要额外的配置或权限才能使用。
:::
