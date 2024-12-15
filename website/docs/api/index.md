# API 参考

YAAC 提供了丰富的 API，让你可以通过编程方式集成和扩展 YAAC 的功能。

## 快速开始

```typescript
import * as yaac from 'yaac';

// 初始化 YAAC
const client = new yaac.Client({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY  // 使用环境变量
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

- [配置项](./configuration.md)：了解如何配置 YAAC
- [命令列表](./commands.md)：查看所有可用的 VSCode 命令
- [事件钩子](./hooks.md)：学习如何使用事件钩子扩展功能

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
    diff: await client.git.getDiff(),
    template: '<type>(<scope>): <subject>',  // 自定义模板
    language: 'zh-CN'  // 指定语言
  });
  
  // 自定义提交选项
  const options: CommitOptions = {
    message,
    sign: true,     // 签名提交
    push: true,     // 自动推送
    verify: true    // 验证提交消息
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
  // 添加 JIRA 任务编号
  const taskId = getJiraTaskId();
  if (taskId) {
    event.setMessage(`[${taskId}] ${event.message}`);
  }
  
  // 验证提交消息
  if (!event.message.match(/^(feat|fix|docs|style|refactor)/)) {
    event.cancel();
    throw new Error('提交消息不符合规范');
  }
});

// 监听提交后事件
client.on('afterCommit', async (event: CommitEvent) => {
  // 更新 JIRA 状态
  await updateJiraStatus(event.hash);
  
  // 发送团队通知
  await sendTeamNotification({
    type: 'commit',
    hash: event.hash,
    message: event.message
  });
});
```

### 自定义 AI 提供商

```typescript
import { Client, AIProvider, GenerateOptions } from 'yaac';

class CustomAIProvider implements AIProvider {
  async generateMessage(options: GenerateOptions) {
    // 实现自定义的消息生成逻辑
    const { files, diff, template } = options;
    
    // 调用自定义 AI 服务
    const response = await this.callCustomAI({
      prompt: this.buildPrompt(files, diff),
      template: template || '<type>: <subject>'
    });
    
    return response.message;
  }
  
  private buildPrompt(files: string[], diff: string) {
    return `分析以下代码变更并生成提交消息：\n\n文件：${files.join(', ')}\n\n差异：\n${diff}`;
  }
}

// 使用自定义提供商
const client = new Client({
  provider: new CustomAIProvider()
});
```

### 团队协作集成

::: warning 即将推出
以下示例代码将在团队协作功能发布后可用。
:::

```typescript
import { Client, TeamConfig } from 'yaac';

async function setupTeam() {
  const client = new Client();
  
  // 配置团队设置
  const teamConfig: TeamConfig = {
    convention: 'conventional',
    scopes: ['feat', 'fix', 'docs'],
    reviewers: ['alice', 'bob'],
    autoAssign: true
  };
  
  // 同步团队配置
  await client.team.syncConfig(teamConfig);
  
  // 监听团队活动
  client.on('teamActivity', (event) => {
    console.log(`${event.user} ${event.type}: ${event.data}`);
  });
}
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
