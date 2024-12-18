# TypeScript Result 模式错误处理高级实践

## 1. 日志系统集成

### 1.1 日志装饰器
```typescript
// 日志装饰器
function logError() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      if (result instanceof ResultAsync) {
        return result.map(
          (data) => {
            logger.debug(`${propertyKey} completed successfully`, { data });
            return data;
          },
          (error) => {
            logger.error(`${propertyKey} failed`, { error, args });
            return error;
          }
        );
      }
      
      return result;
    };
  };
}

// 使用示例
class UserService {
  @logError()
  async createUser(data: UserInput): ResultAsync<User, UserError> {
    // 实现
  }
}
```

### 1.2 结构化日志
```typescript
type LogContext = {
  operation: string;
  traceId: string;
  userId?: string;
  error?: AppError;
  metadata?: Record<string, unknown>;
}

const createLogger = (defaultContext: Partial<LogContext>) => ({
  error: (error: AppError, context: Partial<LogContext>) => {
    const logEntry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      ...defaultContext,
      ...context,
      error: {
        type: error.type,
        message: error.message,
        originalError: error.originalError
      }
    };
    // 发送到日志系统
  }
});
```

## 2. 监控和报警集成

### 2.1 错误追踪
```typescript
interface ErrorTracker {
  capture(error: AppError, context?: Record<string, unknown>): void;
  startSpan(operation: string): Span;
}

class Span {
  constructor(private operation: string, private startTime: number) {}
  
  finish(result: Result<unknown, AppError>) {
    const duration = Date.now() - this.startTime;
    metrics.recordOperation(this.operation, {
      duration,
      success: result.isOk()
    });
  }
}

// 使用示例
function complexOperation(): ResultAsync<Data, AppError> {
  const span = errorTracker.startSpan('complexOperation');
  
  return ResultAsync.fromPromise(/* ... */)
    .map(
      (data) => {
        span.finish(ok(data));
        return data;
      },
      (error) => {
        span.finish(err(error));
        errorTracker.capture(error);
        return error;
      }
    );
}
```

### 2.2 指标收集
```typescript
type MetricTags = {
  operation: string;
  errorType?: string;
  success: boolean;
}

class Metrics {
  recordOperation(name: string, tags: MetricTags) {
    // 记录操作指标
    metrics.increment(`app.operation.${name}`, tags);
  }
  
  recordDuration(name: string, duration: number, tags: MetricTags) {
    // 记录操作耗时
    metrics.histogram(`app.duration.${name}`, duration, tags);
  }
}
```

## 3. 国际化错误消息

### 3.1 错误消息模板
```typescript
type MessageTemplates = {
  [K in AppError['type']]: string;
}

const errorTemplates: MessageTemplates = {
  VALIDATION_ERROR: '{field} is invalid: {message}',
  API_ERROR: 'Operation failed: {message}',
  NOT_FOUND: '{resource} not found',
  UNKNOWN_ERROR: 'An unexpected error occurred: {message}'
};

// i18n 集成
const i18n = {
  translate(key: string, params: Record<string, string>): string {
    const template = errorTemplates[key];
    return template.replace(
      /{(\w+)}/g,
      (_, key) => params[key] || `{${key}}`
    );
  }
};

// 使用示例
const formatErrorMessage = (error: AppError): string => {
  switch (error.type) {
    case 'VALIDATION_ERROR':
      return i18n.translate('VALIDATION_ERROR', {
        field: error.field,
        message: error.message
      });
    // ... 其他类型
  }
};
```

### 3.2 错误本地化
```typescript
class LocalizedError implements AppError {
  constructor(
    public type: AppError['type'],
    private messageKey: string,
    private params: Record<string, string>
  ) {}

  getLocalizedMessage(locale: string): string {
    return i18n.translate(this.messageKey, this.params, locale);
  }
}

// 使用
const error = new LocalizedError(
  'VALIDATION_ERROR',
  'validation.required',
  { field: 'email' }
);

console.log(error.getLocalizedMessage('en')); // "Email is required"
console.log(error.getLocalizedMessage('zh')); // "邮箱是必填项"
```

## 4. 实际业务场景示例

### 4.1 复杂的订单处理流程
```typescript
type OrderError = 
  | { type: 'INVENTORY_ERROR'; message: string }
  | { type: 'PAYMENT_ERROR'; message: string }
  | { type: 'VALIDATION_ERROR'; message: string }

class OrderService {
  @logError()
  createOrder(orderData: OrderInput): ResultAsync<Order, OrderError> {
    const span = errorTracker.startSpan('createOrder');
    
    return this.validateOrder(orderData)
      .andThen((validOrder) => 
        this.checkInventory(validOrder)
      )
      .andThen((checkedOrder) =>
        this.processPayment(checkedOrder)
      )
      .andThen((paidOrder) =>
        this.finalizeOrder(paidOrder)
      )
      .map(
        (order) => {
          span.finish(ok(order));
          return order;
        },
        (error) => {
          span.finish(err(error));
          errorTracker.capture(error);
          return error;
        }
      );
  }
}
```

### 4.2 文件处理流程
```typescript
type FileError = 
  | { type: 'UPLOAD_ERROR'; message: string }
  | { type: 'PROCESSING_ERROR'; message: string }
  | { type: 'VALIDATION_ERROR'; message: string }

class FileProcessor {
  @logError()
  processFile(file: File): ResultAsync<ProcessedFile, FileError> {
    return ResultAsync.fromPromise(
      this.uploadFile(file),
      (e) => ({
        type: 'UPLOAD_ERROR',
        message: formatError(e)
      })
    )
    .andThen((uploadedFile) => 
      this.validateFile(uploadedFile)
    )
    .andThen((validFile) =>
      this.processContent(validFile)
    )
    .map(
      (processedFile) => {
        metrics.recordOperation('fileProcess', {
          success: true,
          fileType: file.type
        });
        return processedFile;
      },
      (error) => {
        metrics.recordOperation('fileProcess', {
          success: false,
          errorType: error.type
        });
        return error;
      }
    );
  }
}
```

## 5. 性能考虑

### 5.1 错误对象复用
```typescript
// 预定义常见错误
const CommonErrors = {
  notFound: (resource: string): AppError => ({
    type: 'NOT_FOUND',
    message: `${resource} not found`
  }),
  validation: (field: string): AppError => ({
    type: 'VALIDATION_ERROR',
    field,
    message: `${field} is invalid`
  })
} as const;

// 使用
return err(CommonErrors.notFound('user'));
```

### 5.2 错误处理中间件
```typescript
type ErrorHandler = (error: AppError) => ResultAsync<unknown, AppError>;

class ErrorHandlerChain {
  private handlers: ErrorHandler[] = [];

  addHandler(handler: ErrorHandler) {
    this.handlers.push(handler);
  }

  handle(error: AppError): ResultAsync<unknown, AppError> {
    return this.handlers.reduce(
      (result, handler) => result.orElse(() => handler(error)),
      err(error) as ResultAsync<unknown, AppError>
    );
  }
}
```

## 6. 测试最佳实践

### 6.1 错误测试
```typescript
describe('OrderService', () => {
  it('should handle inventory errors', async () => {
    const result = await orderService.createOrder(invalidOrder);
    
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({
        type: 'INVENTORY_ERROR',
        message: expect.any(String)
      });
    }
  });
});
```

### 6.2 模拟错误
```typescript
// 创建测试夹具
const createMockError = (type: AppError['type']): AppError => ({
  type,
  message: `Mock ${type}`,
  timestamp: new Date()
});

// 在测试中使用
jest.spyOn(inventoryService, 'check').mockImplementation(() =>
  ResultAsync.fromPromise(
    Promise.reject(new Error('Inventory check failed')),
    () => createMockError('INVENTORY_ERROR')
  )
);
```

## 7. 总结

高级错误处理实践需要考虑：
1. 系统集成（日志、监控、国际化）
2. 性能优化
3. 可测试性
4. 实际业务场景的适配

关键是要在保持代码可维护性的同时，提供足够的错误上下文信息，支持系统监控和问题诊断。
