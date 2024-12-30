# tsup Watch Mode Fix

## 问题描述

当 tsup 配置中的 `outDir` 使用相对路径（如 `../../dist/main`）时，watch 模式无法正常工作。

## 根本原因

问题出在路径比较逻辑上。原代码使用 glob 模式来判断是否忽略文件，这在处理 `..` 这样的相对路径时会出现问题。

## 解决方案

基于 [PR #1266](https://github.com/egoist/tsup/pull/1266) 的修复方案：

1. 移除对 `globSync` 的依赖
2. 使用绝对路径进行比较：
   ```typescript
   const absoluteOutDir = path.resolve(process.cwd(), options.outDir)
   const ignored = ["**/node_modules/**", "**/.git/**", absoluteOutDir, ...customIgnores]
   ```
3. 实现更可靠的路径比较逻辑：
   ```typescript
   ignored: (p: string) => {
     const absolutePath = path.resolve(process.cwd(), p)
     return ignored.some((ignore) => {
       const absoluteIgnore = path.isAbsolute(ignore) ? ignore : path.resolve(process.cwd(), ignore)
       return absolutePath.startsWith(absoluteIgnore)
     })
   }
   ```

## 临时修复方案

在等待上游修复时，可以采用以下临时解决方案：

1. **使用本地 patch**

   ```bash
   # 1. 复制修复代码到本地
   mkdir -p third-parties/tsup/src
   cp node_modules/.pnpm/tsup@*/node_modules/tsup/dist/index.js third-parties/tsup/src/

   # 2. 修改代码
   # 3. 在 package.json 中指向本地版本
   {
     "dependencies": {
       "tsup": "link:./third-parties/tsup"
     }
   }
   ```

2. **修改输出目录结构**
   如果无法修改 tsup 源码，可以调整项目结构，避免使用 `..` 路径：

   ```typescript
   // 改为相对路径
   outDir: "./dist",

   // 或使用绝对路径
   outDir: path.resolve(__dirname, "../../dist/main"),
   ```

3. **使用软链接**

   ```bash
   # 在项目根目录创建 dist 软链接
   ln -s ../../dist/main ./dist

   # 修改 tsup 配置使用本地路径
   outDir: "./dist"
   ```

4. **使用 patch-package**

   ```bash
   # 1. 安装 patch-package
   pnpm add -D patch-package

   # 2. 修改 node_modules 中的代码

   # 3. 生成 patch 文件
   pnpm patch-package tsup

   # 4. 在 package.json 中添加 postinstall 脚本
   {
     "scripts": {
       "postinstall": "patch-package"
     }
   }
   ```

这些临时方案各有优劣：

- 本地 patch：最灵活，但需要维护额外代码
- 修改目录结构：简单直接，但可能影响项目组织
- 软链接：不需要修改代码，但增加了复杂性
- patch-package：最规范，但需要额外依赖

选择哪种方案取决于具体场景：

- 如果是临时使用，推荐软链接
- 如果需要团队共享，推荐 patch-package
- 如果要长期使用，建议提交 PR 到上游

## 核心改进

1. 路径处理：将所有路径转换为绝对路径进行比较，避免相对路径带来的问题
2. 比较逻辑：使用 `startsWith` 进行前缀匹配，而不是依赖 glob 模式匹配
3. 代码简化：移除了不必要的 `globSync` 依赖

## 经验教训

1. 在处理文件路径时，尽量使用绝对路径进行比较
2. 文件系统操作要考虑跨平台兼容性
3. 简单直接的解决方案（如路径前缀比较）往往比复杂的模式匹配更可靠
