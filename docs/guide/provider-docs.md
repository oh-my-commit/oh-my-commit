# AI Commit Provider 实现指南

本文档将指导你如何实现一个 AI Commit Provider。Provider 是一个抽象类，用于生成 AI 辅助的提交信息。

> 如果你需要自定义 prompt 模板，请参考 [自定义 Prompt 模板指南](./custom-prompt-template.md)

## 基本示例

```typescript
import { ResultAsync } from "neverthrow"

import {
  BaseProvider,
  GenerateCommitError,
  type GenerateCommitInput,
  type GenerateCommitResult,
  type IModel,
  type IProvider,
  type ProviderContext,
  formatError,
} from "@shared/common"

export class MyProvider extends BaseProvider implements IProvider {
  id = "my-provider"
  displayName = "My Commit Provider"
  description = "AI-powered commit message generator"

  // you should declare your models, so can be found in our system
  models: IModel[] = [
    {
      providerId: this.id,
      id: "fast",
      name: "Fast Mode",
      description: "Quick commit generation with good accuracy",
      metrics: {
        accuracy: 0.85,
        speed: 0.95,
        cost: 0.3,
      },
    },
  ]

  // you can access the environment-specific logger and config ...
  constructor(context: ProviderContext) {
    super(context)
    // logger is inherited
    this.logger.info("Initializing MyProvider...")
  }

  // you should implement the generateCommit method
  // and consider about the api_key, proxy, timeout ... by yourself
  // we use ResultAsync to handle errors better
  // it's recommended but not required
  generateCommit(input: GenerateCommitInput): ResultAsync<GenerateCommitResult, GenerateCommitError> {
    try {
      this.logger.info("Generating commit", {
        model: input.model.id,
        lang: input.options?.lang,
      })

      const { diff } = input

      // 实现生成逻辑
      const commit = {
        title: `feat: implement new feature`,
        body: `Detailed changes:\n${diff.files.join("\n")}`,
      }

      return { ok: true, data: commit }
    } catch (error) {
      const message = formatError(error, "Failed to generate commit")
      this.logger.error(message)
      return {
        ok: false,
        code: 500,
        message,
      }
    }
  }
}

// you should export **default** your provider
export default MyProvider
```

## 接口详解

### Provider 抽象类

#### 必选属性和方法

| 属性/方法      | 类型                                                 | 说明                   | 示例                             |
| -------------- | ---------------------------------------------------- | ---------------------- | -------------------------------- |
| id             | string                                               | 供应商唯一标识         | 'openai-provider'                |
| displayName    | string                                               | 显示名称               | 'OpenAI Provider'                |
| description    | string                                               | 供应商描述             | 'Use OpenAI to generate commits' |
| models         | Model[]                                              | 支持的模型列表         | 见下方 Models 表格               |
| generateCommit | (input: GenerateCommitInput) => GenerateCommitResult | 生成提交信息的核心方法 | 见下方示例                       |

#### 可选属性

| 属性   | 类型       | 默认值        | 说明       |
| ------ | ---------- | ------------- | ---------- |
| logger | BaseLogger | ConsoleLogger | 日志记录器 |

### Models 接口

| 字段             | 类型   | 必选 | 说明         |
| ---------------- | ------ | ---- | ------------ |
| providerId       | string | 是   | 供应商 ID    |
| id               | string | 是   | 模型 ID      |
| name             | string | 是   | 模型名称     |
| description      | string | 是   | 模型描述     |
| metrics          | Object | 否   | 模型性能指标 |
| metrics.accuracy | number | 否   | 准确度 (0-1) |
| metrics.speed    | number | 否   | 速度 (0-1)   |
| metrics.cost     | number | 否   | 成本 (0-1)   |

### GenerateCommitInput

| 字段         | 类型       | 必选 | 说明         |
| ------------ | ---------- | ---- | ------------ |
| diff         | DiffResult | 是   | Git 差异信息 |
| model        | Model      | 是   | 选择的模型   |
| options      | Object     | 否   | 配置选项     |
| options.lang | string     | 否   | 生成语言     |

### GenerateCommitResult

成功响应：

```typescript
{
  ok: true,
  data: {
    title: string,    // commit 标题
    body?: string,    // commit 详细内容
    extra?: any       // 额外信息
  }
}
```

错误响应：

```typescript
{
  ok: false,
  code: number,    // 错误码
  msg: string      // 错误信息
}
```

常见错误码：

| 错误码 | 说明                   |
| ------ | ---------------------- |
| 400    | 参数错误或不支持的模型 |
| 401    | 认证失败               |
| 403    | 权限不足               |
| 500    | 服务器错误             |

## 最佳实践

1. **模型切换**

```typescript
generateCommit(input: GenerateCommitInput): GenerateCommitResult {
  switch (input.model.id) {
    case 'model-1':
      return this.generateWithModel1(input)
    case 'model-2':
      return this.generateWithModel2(input)
    default:
      return {
        ok: false,
        code: 400,
        msg: `Unsupported model: ${input.model.id}`
      }
  }
}
```

2. **日志使用**

```typescript
// directly use the inherited logger
// supporting structured logging in the vscode outputChannel
this.logger.info("Generating commit", {
  model: input.model.id,
  lang: input.options?.lang,
})
```

3. **错误处理**

```typescript
// from official example
  generateCommit(
    input: GenerateCommitInput,
  ): ResultAsync<GenerateCommitResult, GenerateCommitError> {
    this.logger.debug("Generating commit message using OMC Provider...")
    const diff = JSON.stringify(input.diff, null, 2)
    const lang = input.options?.lang || "en"

    return ResultAsync.fromPromise(
      // async action 1
      Promise.resolve().then(() => this.templateProcessor.fill({ diff, lang })),
      // error 1
      error =>
        new GenerateCommitError(-10085, formatError(error, "failed to load prompt")),
    )
      .andThen(prompt =>
        ResultAsync.fromPromise(
          // async action 2
          this.callApi(prompt),
          // error 2
          error =>
            new GenerateCommitError(-10086, formatError(error, "failed to call api")),
        ),
      )
      .andThen(response =>
        ResultAsync.fromPromise(
          // async action 3
          this.handleApiResult(response),
          // error 3
          error =>
            new GenerateCommitError(
              -10087,
              formatError(error, "failed to handle api result"),
            ),
        ),
      )
      .map(result => {
        // metadata
        merge(result.meta, {
          generatedAt: new Date().toISOString(),
          modelId: input.model,
          providerId: this.id,
        })
        return result
      })
  }
```

## 注意事项

1. 确保 `id` 在所有供应商中唯一
2. `models` 数组中的每个模型都应该有对应的实现
3. 适当使用 logger 记录关键信息
4. 合理设置模型的 metrics 指标，帮助用户选择
5. 正确处理并返回错误信息
