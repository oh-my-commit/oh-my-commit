# 状态管理最佳实践

<!-- toc -->

  - [核心原则](#核心原则)
  - [总结](#总结)
  - [实际示例](#实际示例)
  - [注意事项](#注意事项)

<!-- tocstop -->


本文档描述了在 YAAC 项目中处理复杂状态管理的最佳实践，特别是针对复合数据结构的状态管理。

## 核心原则

### 1. 分层设计

状态管理分为四个主要层次：

```typescript
// 1. 基础原子层 - 存储原始数据
const baseAtoms = {
  detail: atomWithStorage("detail", ""),
  message: atomWithStorage("message", ""),
  files: atomWithStorage("files", [])
};

// 2. 派生状态层 - 计算和转换数据
const derivedAtoms = {
  fileStats: atom(get => ({
    added: get(baseAtoms.files).filter(f => f.status === "added").length,
    // ...
  })),
  isValid: atom(get => get(baseAtoms.message).length > 0)
};

// 3. 操作层 - 处理状态变更
const actionAtoms = {
  addFile: atom(null, (get, set, file) => {
    set(baseAtoms.files, [...get(baseAtoms.files), file]);
  }),
  reset: atom(null, (get, set) => {
    Object.values(baseAtoms).forEach(a => set(a, null));
  })
};

// 4. 封装层 - 提供友好的 API
export function useCommitState() {
  return {
    // 状态
    message: useAtomValue(baseAtoms.message),
    stats: useAtomValue(derivedAtoms.fileStats),
    
    // 操作
    addFile: useSetAtom(actionAtoms.addFile),
    reset: useSetAtom(actionAtoms.reset)
  };
}
```

### 2. 状态拆分原则

- 将大的状态对象拆分成小的、独立的原子
- 每个原子负责单一的职责
- 通过派生状态组合数据

```typescript
// ❌ 避免：一个大的状态对象
const bigStateAtom = atom({
  detail: "",
  message: "",
  files: [],
  isValid: false,
  stats: { /* ... */ }
});

// ✅ 推荐：拆分成小的原子
const messageAtom = atom("");
const filesAtom = atom([]);
const isValidAtom = atom(get => get(messageAtom).length > 0);
```

### 3. 更新策略

使用专门的 action atoms 处理状态更新，而不是直接修改复杂状态：

```typescript
// ❌ 避免：直接修改复杂状态
setCommit(prev => ({
  ...prev,
  files: [...prev.files, newFile],
  message: `更新了${prev.files.length + 1}个文件`
}));

// ✅ 推荐：使用专门的 action atoms
const addFileAtom = atom(null, (get, set, file) => {
  set(filesAtom, [...get(filesAtom), file]);
  set(messageAtom, `更新了${get(filesAtom).length}个文件`);
});
```

### 4. API 设计

提供高级抽象而不是暴露实现细节：

```typescript
// ❌ 避免：暴露过多实现细节
export {
  commitDetailAtom,
  commitMessageAtom,
  commitFilesAtom,
  // ...更多原子
};

// ✅ 推荐：提供高级抽象
export function useCommit() {
  return {
    // 1. 状态访问 - 直接解构
    ...useAtomValue(commitAtom),
    
    // 2. 简单操作 - 函数式
    setMessage: useSetAtom(setMessageAtom),
    
    // 3. 复杂操作 - 方法式
    addFile(file) { /* ... */ },
    
    // 4. 派生数据 - 计算属性
    get stats() { /* ... */ }
  };
}
```

### 5. 性能优化

优化派生状态的计算方式：

```typescript
// ❌ 避免：频繁重新计算
const statsAtom = atom(get => {
  const files = get(filesAtom);
  return {
    added: files.filter(f => f.status === "added").length,
    modified: files.filter(f => f.status === "modified").length,
    // ... 多次遍历
  };
});

// ✅ 推荐：一次遍历
const statsAtom = atom(get => {
  const files = get(filesAtom);
  return files.reduce((stats, file) => {
    stats[file.status]++;
    return stats;
  }, { added: 0, modified: 0 });
});
```

### 6. 错误处理

在 action 层统一处理错误：

```typescript
const addFileAtom = atom(null, (get, set, file) => {
  try {
    if (get(filesAtom).some(f => f.path === file.path)) {
      throw new Error("文件已存在");
    }
    set(filesAtom, [...get(filesAtom), file]);
  } catch (error) {
    set(errorAtom, error.message);
  }
});
```

### 7. 测试友好

分层设计使得每一层都易于测试：

```typescript
describe('commit state', () => {
  // 1. 测试基础原子
  it('should store basic data', () => {
    const store = createStore();
    store.set(baseAtoms.message, "test");
    expect(store.get(baseAtoms.message)).toBe("test");
  });

  // 2. 测试派生状态
  it('should calculate stats correctly', () => {
    const store = createStore();
    store.set(baseAtoms.files, [{ status: "added" }]);
    expect(store.get(derivedAtoms.fileStats).added).toBe(1);
  });

  // 3. 测试操作
  it('should handle actions', () => {
    const store = createStore();
    store.set(actionAtoms.addFile, { path: "test.ts" });
    expect(store.get(baseAtoms.files)).toHaveLength(1);
  });
});
```

## 总结

1. **分层设计**：将状态管理分为基础数据、派生状态、操作和 API 层
2. **原子化**：将大状态拆分成小的、独立的原子
3. **封装复杂性**：在内部处理复杂的状态逻辑，对外提供简单的 API
4. **性能优化**：合理设计派生状态的计算方式
5. **错误处理**：在适当的层级处理错误
6. **可测试性**：分层设计使得每一层都易于测试

## 实际示例

可以参考以下文件来了解这些最佳实践的具体应用：

- `src/atoms/commit.ts`: 状态定义和派生状态
- `src/hooks/useCommit.ts`: API 封装
- `src/examples/commit-atom-usage.tsx`: 使用示例

## 注意事项

1. 避免过度抽象，根据实际需求选择合适的抽象级别
2. 保持状态的最小化和原子性
3. 注意性能优化，特别是在派生状态的计算中
4. 统一错误处理方式
5. 编写完整的测试用例
