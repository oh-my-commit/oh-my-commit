# TypeScript 导入扩展名问题

## 问题描述

在使用 TypeScript 的项目中，VSCode 的自动导入功能会自动添加 `.js` 或 `.ts` 扩展名，例如：

```typescript
// 自动补全会变成这样
import { something } from "./module.js"
// 或者
import { something } from "./module.ts"
```

这会导致构建错误，因为大多数构建工具（如 Vite）期望的是不带扩展名的导入路径。

## 原因

这个问题通常由以下原因之一导致：

1. VSCode 的 TypeScript 设置中启用了自动添加扩展名的功能
2. TypeScript 配置中的 `moduleResolution` 设置不正确
3. 项目使用了较新版本的 TypeScript（5.0+），其默认行为发生了变化

## 解决方案

### 方案 1：修改 VSCode 设置（推荐）

在项目的 `.vscode/settings.json` 中，将 TypeScript 的导入扩展名设置改为 `minimal`：

```json
{
  "typescript.preferences.importModuleSpecifierEnding": "minimal"
}
```

这样 VSCode 的自动导入功能就不会添加文件扩展名了。

### 方案 2：修改 TypeScript 配置

如果问题仍然存在，可以尝试在 `tsconfig.json` 中调整模块解析策略：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",  // 或者 "bundler"，取决于你的构建工具
    "module": "ESNext"
  }
}
```

## 注意事项

1. 修改这些设置后，需要重启 TypeScript 服务器才能生效
2. 如果使用 monorepo，确保根目录和各个包的配置保持一致
3. 某些构建工具（如 Vite）可能需要额外的配置来正确处理模块导入

## 相关链接

- [TypeScript 官方文档：Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [VSCode TypeScript 设置文档](https://code.visualstudio.com/docs/typescript/typescript-compiling#_compiler-options)
