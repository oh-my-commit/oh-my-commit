# 事件钩子

YAAC 提供了一系列事件钩子，让你可以在特定时机执行自定义逻辑。

## 提交相关钩子

### `onBeforeCommit`

在执行提交前触发。

```typescript
interface BeforeCommitEvent {
  message: string;          // 提交消息
  files: string[];         // 待提交的文件列表
  cancel(): void;          // 取消提交
  setMessage(msg: string); // 修改提交消息
}

yaac.hooks.onBeforeCommit((event) => {
  // 例：添加 JIRA 任务编号
  const taskId = 'PROJ-123';
  event.setMessage(`[${taskId}] ${event.message}`);
});
```

### `onAfterCommit`

在提交完成后触发。

```typescript
interface AfterCommitEvent {
  message: string;     // 提交消息
  hash: string;       // 提交哈希
  files: string[];    // 已提交的文件列表
}

yaac.hooks.onAfterCommit((event) => {
  // 例：在提交后通知团队
  notifyTeam(`New commit: ${event.hash}`);
});
```

## AI 相关钩子

### `onBeforeGenerate`

在生成提交消息前触发。

```typescript
interface BeforeGenerateEvent {
  files: string[];           // 变更文件列表
  diff: string;             // 代码差异
  cancel(): void;           // 取消生成
  setPrompt(text: string);  // 修改 AI 提示
}

yaac.hooks.onBeforeGenerate((event) => {
  // 例：根据文件类型调整提示
  if (event.files.some(f => f.endsWith('.test.ts'))) {
    event.setPrompt('This commit includes test files...');
  }
});
```

### `onAfterGenerate`

在生成提交消息后触发。

```typescript
interface AfterGenerateEvent {
  message: string;          // 生成的消息
  setMessage(msg: string);  // 修改消息
}

yaac.hooks.onAfterGenerate((event) => {
  // 例：添加自定义前缀
  event.setMessage(`[AUTO] ${event.message}`);
});
```

## 配置相关钩子

### `onConfigChange`

在配置变更时触发。

```typescript
interface ConfigChangeEvent {
  key: string;      // 变更的配置项
  value: any;       // 新值
  oldValue: any;    // 旧值
}

yaac.hooks.onConfigChange((event) => {
  // 例：在切换语言时刷新界面
  if (event.key === 'yaac.language') {
    refreshUI();
  }
});
```

## 团队协作钩子

::: warning 即将推出
以下钩子将在团队协作功能发布后可用。
:::

### `onTeamConfigSync`

在团队配置同步时触发。

```typescript
interface TeamConfigSyncEvent {
  config: object;    // 同步的配置
  source: string;    // 配置来源
}
```

### `onTeamActivity`

在检测到团队活动时触发。

```typescript
interface TeamActivityEvent {
  type: string;      // 活动类型
  user: string;      // 用户
  data: any;         // 活动数据
}
```

## 最佳实践

1. 错误处理：
   ```typescript
   yaac.hooks.onBeforeCommit((event) => {
     try {
       // 你的逻辑
     } catch (error) {
       console.error('Hook error:', error);
       event.cancel(); // 出错时取消操作
     }
   });
   ```

2. 异步操作：
   ```typescript
   yaac.hooks.onAfterCommit(async (event) => {
     await updateExternalSystem(event.hash);
   });
   ```

3. 清理钩子：
   ```typescript
   const disposable = yaac.hooks.onConfigChange(() => {});
   // 当不再需要时
   disposable.dispose();
   ```
