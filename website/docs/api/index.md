# API 参考

YAAC 提供了丰富的 API，让你可以通过编程方式集成和扩展 YAAC 的功能。

## 快速开始

```typescript
import * as yaac from 'yaac';

// 初始化 YAAC
const client = new yaac.Client({
  provider: 'openai',
  apiKey: 'your-api-key'
});

// 生成提交信息
const message = await client.generateCommitMessage({
  files: ['src/main.ts', 'src/utils.ts'],
  diff: '...'
});

// 创建提交
await client.commit({
  message,
  files: ['src/main.ts', 'src/utils.ts']
});
```

## API 结构

YAAC 的 API 分为以下几个主要模块：

- **Client**: 主客户端类，提供核心功能
- **Git**: Git 操作相关的 API
- **AI**: AI 服务相关的 API
- **UI**: 界面控制相关的 API
- **Config**: 配置管理相关的 API

## 详细文档

- [配置项](./configuration.md)
- [命令列表](./commands.md)
- [事件钩子](./hooks.md)

## 示例

### 自定义提交流程

```typescript
import { Client, CommitOptions } from 'yaac';

async function customCommit() {
  const client = new Client();
  
  // 获取修改的文件
  const changes = await client.git.getChanges();
  
  // 生成提交信息
  const message = await client.ai.generateMessage({
    files: changes.map(c => c.file),
    diff: await client.git.getDiff()
  });
  
  // 自定义提交选项
  const options: CommitOptions = {
    message,
    sign: true,
    push: true
  };
  
  // 执行提交
  await client.commit(options);
}
```

### 监听事件

```typescript
import { Client, CommitEvent } from 'yaac';

const client = new Client();

// 监听提交前事件
client.on('beforeCommit', (event: CommitEvent) => {
  console.log('即将提交:', event.message);
});

// 监听提交后事件
client.on('afterCommit', (event: CommitEvent) => {
  console.log('提交完成:', event.hash);
});
```

### 自定义 AI 提供商

```typescript
import { Client, AIProvider } from 'yaac';

class CustomAIProvider implements AIProvider {
  async generateMessage(options) {
    // 实现自定义的消息生成逻辑
    return {
      type: 'feat',
      scope: 'custom',
      subject: '自定义提交消息',
      body: '详细说明...'
    };
  }
}

const client = new Client({
  provider: new CustomAIProvider()
});
```

## 类型定义

完整的类型定义请参考 [GitHub 仓库](https://github.com/yourusername/YAAC/blob/main/types/index.d.ts)。

## 错误处理

YAAC 使用标准的错误处理机制：

```typescript
try {
  await client.commit({
    message: 'feat: new feature',
    files: ['src/main.ts']
  });
} catch (error) {
  if (error instanceof yaac.GitError) {
    console.error('Git 操作失败:', error.message);
  } else if (error instanceof yaac.AIError) {
    console.error('AI 服务失败:', error.message);
  } else {
    console.error('未知错误:', error);
  }
}
