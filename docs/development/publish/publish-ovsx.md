# 发布到 Open VSX Registry (OVSX)

本指南介绍如何将 Oh My Commit 扩展发布到 Open VSX Registry，这是 Visual Studio Marketplace 的开源替代方案。

## 前置条件

1. 在 [Open VSX Registry](https://open-vsx.org/) 创建账号
2. 从[用户设置](https://open-vsx.org/user-settings/tokens)生成访问令牌
3. 在项目根目录创建 `.env` 文件并设置令牌：
```bash
OVSX_TOKEN=<your-token>
```

## 发布步骤

1. 安装依赖：
```bash
pnpm install
```

2. 构建并打包扩展：
```bash
pnpm vscode:package
```
这将在 `dist` 目录下生成 `.vsix` 文件，如 `oh-my-commit-0.9.2.vsix`

3. 发布打包好的扩展到 OVSX：
```bash
pnpm ovsx:publish
```

## 常见问题

### 常见错误

1. **认证错误**
   - 确保 `.env` 文件中的 `OVSX_TOKEN` 已正确设置
   - 如果问题持续，尝试重新生成令牌

2. **包验证错误**
   - 确保 `package.json` 中包含所有必需字段：
     - `name`
     - `version`
     - `publisher`
     - `engines.vscode`
   - 检查版本号是否唯一

3. **构建问题**
   - 运行 `pnpm clean` 后再运行 `pnpm build`
   - 检查 `dist` 目录中是否正确生成了 `.vsix` 文件

## 版本管理

1. 更新版本（使用 changeset）：
```bash
pnpm pkg:update
```

2. 发布新版本：
```bash
pnpm pkg:publish
```

3. 打包并发布到 OVSX：
```bash
pnpm vscode:package
pnpm ovsx:publish
```

## 相关资源

- [Open VSX Registry](https://open-vsx.org/)
- [OVSX 发布指南](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [VSCode 扩展发布指南](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Changesets 文档](https://github.com/changesets/changesets)
