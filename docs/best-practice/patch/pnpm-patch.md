# PNPM Patch 最佳实践

本文档介绍如何在项目中使用 pnpm 的原生补丁功能来修改依赖包的代码。

## 背景

有时我们需要修改 node_modules 中的依赖包代码，常见的场景包括：
- 修复依赖包的 bug
- 添加自定义功能
- 适配特定的使用场景

虽然 patch-package 是一个流行的解决方案，但在 pnpm 项目中，我们推荐使用 pnpm 的原生补丁功能，因为：
- 与 pnpm 完全集成
- 不需要额外的依赖
- 更好的维护性

## 使用方法

### 1. 创建补丁

```bash
# 创建补丁
pnpm patch <package-name>@<version>

# 例如：
pnpm patch tsup@8.3.5
```

这会创建一个临时目录，你可以在其中修改包的代码。

### 2. 提交补丁

修改完成后，运行：
```bash
pnpm patch-commit <patch-directory>
```

这将：
- 生成补丁文件到 `patches/` 目录
- 在 package.json 中添加补丁配置
- 自动应用补丁

### 3. 补丁文件格式

补丁文件应遵循以下格式：
\`\`\`diff
# 补丁说明
# - 修复了什么问题
# - 如何使用
# - 注意事项

--- a/path/to/file.js
+++ b/path/to/file.js
@@ -line,count +line,count @@
 // 修改的代码
\`\`\`

## 注意事项

1. **代码兼容性**
   - 使用兼容的 JavaScript 语法
   - 避免使用新特性（如箭头函数、扩展运算符等）
   - 优先使用 function 关键字定义函数

2. **补丁管理**
   - 补丁文件应放在项目根目录的 `patches/` 目录下
   - 文件名格式：`<package-name>@<version>.patch`
   - 补丁文件应包含清晰的注释说明

3. **版本控制**
   - 将补丁文件提交到版本控制系统
   - 在 README 中说明已修改的依赖

4. **更新补丁**
   - 依赖版本更新时，需要检查补丁是否仍然适用
   - 必要时重新生成补丁

## 常见问题

### 1. 补丁目录已存在

错误信息：
```
ERR_PNPM_EDIT_DIR_NOT_EMPTY The directory ... is not empty
```

解决方法：
```bash
# 删除临时补丁目录
rm -rf node_modules/.pnpm_patches

# 重新应用补丁
pnpm install
```

### 2. 补丁应用失败

可能的原因：
- 语法不兼容
- 路径错误
- 补丁文件格式问题

解决方法：
1. 检查补丁文件格式
2. 使用兼容的语法
3. 确保文件路径正确

## 示例

以下是一个修复 tsup 监听外部目录问题的补丁示例：

\`\`\`diff
# tsup Patch for External Directory Watch
#
# 这个补丁修复了 tsup 无法监听外部目录（如 `../../dist`）的问题。
#
# 补丁说明：
# - 将所有路径转换为绝对路径，确保正确处理外部目录
# - 在 glob 匹配时使用绝对路径
# - 确保 ignore 路径也都是绝对路径

--- dist/index.js
+++ dist/index.js
@@ -1648,8 +1648,10 @@
               const customIgnores = options.ignoreWatch ? Array.isArray(options.ignoreWatch) ? options.ignoreWatch : [options.ignoreWatch] : [];
               const ignored = [
                 "**/{.git,node_modules}/**",
-                options.outDir,
-                ...customIgnores
+                _path2.default.resolve(options.outDir),
+                ...customIgnores.map(function(ignore) {
+                  return _path2.default.isAbsolute(ignore) ? ignore : _path2.default.resolve(ignore);
+                })
               ];
\`\`\`

## 参考资料

- [PNPM Patching Packages](https://pnpm.io/cli/patch)
- [Working with Patches in PNPM](https://pnpm.io/cli/patch-commit)
