# TypeScript 中的 Result 模式错误处理最佳实践

## 1. 为什么需要 Result 模式

传统的 try-catch 错误处理存在以下问题：

- 异步操作的错误处理分散且难以追踪
- 多个 await 操作的错误都会进入同一个 catch 块，难以区分来源
- 错误类型不明确，需要额外的类型判断
- 容易遗漏错误处理

使用 Result 模式（比如 neverthrow 库）可以带来以下好处：

- 类型安全的错误处理
- 链式处理让代码更清晰
- 每一步的错误都可以独立处理
- 强制开发者处理错误情况

## 2. 错误类型定义

```typescript
// 定义具体的错误类型
type AppError =
  | { type: "VALIDATION_ERROR"; message: string }
  | { type: "API_ERROR"; message: string }
  | { type: "PROCESSING_ERROR"; message: string }
  | { type: "UNKNOWN_ERROR"; message: string; originalError?: unknown };

// 错误处理函数
const handleApiError = (e: unknown): AppError => ({
  type: "API_ERROR",
  message: `API call failed: ${formatError(e)}`,
  originalError: e,
});

// 错误格式化
const formatError = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  return String(e);
};
```

## 3. Result 模式的基本使用

```typescript
function processData(): ResultAsync<Data, AppError> {
  return ResultAsync.fromPromise(fetchData(), handleApiError).andThen(
    (rawData): Result<Data, AppError> => {
      if (!isValidData(rawData)) {
        return err({
          type: "VALIDATION_ERROR",
          message: "Invalid data format",
        });
      }
      return ok(rawData);
    }
  );
}
```

## 4. 链式错误处理

```typescript
function complexOperation(): ResultAsync<FinalData, AppError> {
  return ResultAsync.fromPromise(step1(), handleApiError)
    .andThen((data1) => ResultAsync.fromPromise(step2(data1), handleApiError))
    .andThen((data2) => {
      if (!isValid(data2)) {
        return err({
          type: "VALIDATION_ERROR",
          message: "Validation failed at step 2",
        });
      }
      return ok(data2);
    });
}
```

## 5. 最佳实践要点

### 5.1 错误类型设计

- 使用 discriminated union 定义错误类型
- 保留原始错误信息
- 错误类型要具有描述性
- 考虑错误的分类和层次

### 5.2 错误处理函数

- 为常见错误类型创建专门的处理函数
- 保持错误处理函数的纯函数特性
- 提供有意义的错误消息
- 考虑是否需要保留原始错误

### 5.3 代码组织

```typescript
// 集中定义错误类型
types / errors.ts; // 所有错误类型定义

utils / error - handlers.ts; // 错误处理函数

services / user - service.ts; // 业务逻辑，使用 Result
```

### 5.4 错误处理原则

- 在边界处理错误（如 API 层）
- 保持错误处理的一致性
- 避免吞没错误
- 提供足够的上下文信息

## 6. 使用建议

### 适合使用 Result 模式的场景：

- 复杂的业务逻辑链
- 需要精确错误处理的场景
- 对类型安全要求高的项目
- 团队熟悉函数式编程概念

### 不适合使用的场景：

- 简单的 CRUD 操作
- 原型或概念验证项目
- 团队不熟悉函数式编程
- 项目周期短，不需要复杂错误处理

## 7. 实际应用示例

```typescript
// 完整的业务逻辑示例
interface User {
  id: string;
  name: string;
  email: string;
}

type UserError =
  | { type: "VALIDATION_ERROR"; field: string; message: string }
  | { type: "API_ERROR"; message: string }
  | { type: "NOT_FOUND"; message: string };

class UserService {
  createUser(data: Partial<User>): ResultAsync<User, UserError> {
    return ResultAsync.fromPromise(this.validateUser(data), (e) => ({
      type: "VALIDATION_ERROR",
      field: "unknown",
      message: formatError(e),
    })).andThen((validData) =>
      ResultAsync.fromPromise(this.saveUser(validData), (e) => ({
        type: "API_ERROR",
        message: `Failed to save user: ${formatError(e)}`,
      }))
    );
  }

  private async validateUser(data: Partial<User>): Promise<User> {
    // 验证逻辑
  }

  private async saveUser(user: User): Promise<User> {
    // 保存逻辑
  }
}
```

## 8. 注意事项

1. 错误信息的完整性

```typescript
// 不好的做法
(e) => ({ type: 'API_ERROR', message: 'API call failed' })

// 好的做法
(e) => ({
  type: 'API_ERROR',
  message: `API call failed: ${formatError(e)}`,
  originalError: e
})
```

2. 错误处理的一致性

```typescript
// 保持错误处理风格一致
const errorHandlers = {
  api: (e: unknown): AppError => ({ ... }),
  validation: (field: string, message: string): AppError => ({ ... }),
  notFound: (resource: string): AppError => ({ ... })
};
```

3. 类型安全

```typescript
// 使用类型守卫确保类型安全
const isApiError = (error: AppError): error is ApiError =>
  error.type === "API_ERROR";
```

## 9. 结论

Result 模式提供了一种类型安全、可维护的错误处理方案，特别适合企业级应用。关键是要根据项目需求和团队情况来选择合适的错误处理策略，保持代码的一致性和可维护性。
