---
layout: home

hero:
  name: "Oh My Commit"
  text: "让 Git 提交变得优雅而智能"
  tagline: 一款基于 AI 的 Git 提交助手
  image:
    src: /logo.svg
    alt: Oh My Commit
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/cs-magic-open/oh-my-commit

features:
  - icon: 🤖
    title: 智能生成
    details: 基于代码变更自动生成规范的提交消息
  - icon: 🎨
    title: 优雅交互
    details: 提供多种交互模式，满足不同场景需求
  - icon: 🔍
    title: 深度分析
    details: 理解代码上下文，生成准确的变更描述
  - icon: 🤝
    title: 团队协作
    details: 统一团队提交风格，提高协作效率

---

## 为什么选择 Oh My Commit？

Oh My Commit 是一款基于 AI 的 Git 提交助手，它能帮助你：

- 🤖 **智能生成**：基于代码变更自动生成规范的提交消息
- 🎨 **优雅交互**：提供多种交互模式，满足不同场景需求
- 🔍 **深度分析**：理解代码上下文，生成准确的变更描述
- 🤝 **团队协作**：统一团队提交风格，提高协作效率

## 快速开始

1. 在 VS Code 中安装插件：
   ```bash
   code --install-extension oh-my-commit
   ```

2. 配置 AI 服务：
   ```json
   {
     "oh-my-commit.ai.provider": "openai",
     "oh-my-commit.ai.apiKey": "your-api-key"
   }
   ```

3. 开始使用：
   - 使用 `Alt + G` 生成提交消息
   - 使用 `Alt + C` 执行提交

## 特性

- 🤖 **AI 驱动**：使用先进的 AI 模型分析代码变更，生成专业的提交信息
- 📝 **规范提交**：支持 Conventional Commits 规范，确保提交信息的一致性
- 🔍 **智能分析**：自动分析代码变更，识别变更类型和影响范围
- 🌐 **多语言支持**：支持中文、英文等多种语言的提交信息生成
- 🤝 **团队协作**：提供团队配置和规范管理，促进团队协作
- 🎨 **界面友好**：提供直观的用户界面，让提交过程更加轻松
- 🔌 **扩展性强**：支持自定义钩子和插件，满足个性化需求

## 工作流程

1. **代码变更**：修改代码并暂存更改
2. **启动工具**：运行 `oh-my-commit` 命令
3. **AI 分析**：AI 自动分析代码变更
4. **生成信息**：生成规范的提交信息
5. **确认提交**：确认或编辑提交信息
6. **完成提交**：执行 Git 提交操作

## 使用场景

### 个人开发

```bash
# 快速提交
oh-my-commit quick

# 详细模式
oh-my-commit interactive
```

### 团队协作

```bash
# 应用团队规范
oh-my-commit --team

# 提交并推送
oh-my-commit --push
```

### CI/CD 集成

```bash
# 检查提交信息
oh-my-commit check

# 自动修复
oh-my-commit fix
```

## 最佳实践

### 1. 提交规范

- 使用规范的提交类型
- 清晰描述变更内容
- 关联相关问题

### 2. 团队配置

- 统一提交规范
- 共享配置文件
- 定期同步更新

### 3. 工作流优化

- 合理使用钩子
- 配置自动化任务
- 保持提交原子性

## 常见问题

### 1. AI 配置

问题：AI 服务无法访问
解决：
```json
{
  "oh-my-commit.ai": {
    "provider": "azure",
    "endpoint": "YOUR_AZURE_ENDPOINT"
  }
}
```

### 2. 提交失败

问题：提交被钩子拒绝
解决：
```json
{
  "oh-my-commit.hooks": {
    "strict": false,
    "timeout": 10000
  }
}
```

### 3. 团队同步

问题：配置未同步
解决：
```json
{
  "oh-my-commit.team": {
    "syncEnabled": true,
    "syncInterval": 3600
  }
}
```

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交变更
4. 推送到分支
5. 创建 Pull Request

## 支持我们

如果您觉得 Oh My Commit 对您有帮助，欢迎：

- ⭐️ 在 GitHub 上给我们 Star
- 📝 提交问题和建议
- 🤝 参与项目开发
- 📢 向他人推荐

::: tip 提示
查看[配置指南](/guide/configuration)了解更多配置选项。
:::

::: warning 注意
首次使用时请确保配置 AI 服务相关的 API 密钥。
:::
