# TypeScript Unsafe Types 处理经验

## 问题描述

在使用 TypeScript 的严格模式和 ESLint 的 `@typescript-eslint` 插件时，经常会遇到一系列 `unsafe-*` 相关的警告：

- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-unsafe-return`
- `@typescript-eslint/no-unsafe-argument`

这些警告通常出现在：

1. 使用模板字符串时
2. 跨包引用时
3. 使用第三方库时

## 临时解决方案

在 `.eslintrc.js` 中关闭这些规则：

```javascript
rules: {
  "@typescript-eslint/no-unsafe-member-access": "off",
  "@typescript-eslint/no-unsafe-assignment": "off",
  "@typescript-eslint/no-unsafe-return": "off",
  "@typescript-eslint/no-unsafe-argument": "off"
}
```

## 待优化方向

1. 使用 TypeScript 的类型系统来更好地定义和约束类型：

   - 使用 `satisfies` 操作符
   - 使用 const enum
   - 定义明确的类型接口

2. 在跨包引用时确保类型定义的完整性

3. 对第三方库添加更完善的类型定义

## 参考资料

- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
