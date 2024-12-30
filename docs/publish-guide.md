# VS Code 插件发布指南

## 发布前准备

### 1. 配置文件检查

确保 `package.json` 包含以下必要字段：
```json
{
  "name": "your-extension-name",
  "displayName": "Your Extension Display Name",
  "publisher": "your-publisher-id",
  "version": "x.y.z",
  "description": "Your extension description",
  "icon": "path/to/icon.png"
}
```

### 2. 图标要求
- 推荐尺寸：256x256 像素
- 最小尺寸：128x128 像素
- 格式优先级：PNG > SVG > JPG
- 建议使用透明背景

### 3. .vscodeignore 配置
确保以下文件不被忽略：
```
!dist/**
!package.json
!README.md
!CHANGELOG.md
!LICENSE
!assets/icon.png
```

## 发布步骤

1. 注册发布者账号
   - 访问 https://marketplace.visualstudio.com/manage/publishers/
   - 点击 "New Publisher" 创建发布者 ID

2. 创建 Personal Access Token (PAT)
   - 访问 https://dev.azure.com
   - Security -> Personal Access Tokens -> New Token
   - 必选权限：
     - Marketplace (Manage)
     - Member Entitlement Management (Read)
     - Graph (Read)

3. 登录并发布
```bash
# 登录
pnpm vsce login <publisher-name>

# 打包
pnpm vsce package

# 发布
pnpm vsce publish
```

## Example

![published](published.png)

source: [Oh My Commit - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=oh-my-commit.oh-my-commit&ssr=false#version-history)

## 版本更新

1. 更新 package.json 中的版本号
2. 更新 CHANGELOG.md
3. 重新发布：`pnpm vsce publish`

## 最佳实践

1. 使用语义化版本号 (Semantic Versioning)
2. 每次发布前测试插件功能
3. 维护清晰的更新日志
4. 提供详细的 README 文档
5. 确保图标清晰美观

## 相关资源

- [VS Code 插件市场](https://marketplace.visualstudio.com/)
- [发布者管理页面](https://marketplace.visualstudio.com/manage)
- [vsce 命令行工具文档](https://github.com/microsoft/vscode-vsce)
