# YAAC (Yet Another Auto Commit)

🚀 一款基于 AI 的智能 Git 提交插件，让你的每一次提交都专业而优雅。YAAC（读作"雅刻"）致力于提供最流畅的 AI 辅助提交体验。

## 特性

- 🤖 智能分析代码变更，自动生成高质量的提交信息
- 🎨 优雅的用户界面，流畅的操作体验
- 🔧 高度可定制的提交模板和规则
- 🌍 支持多语言（中英文）
- ⚡ 快速响应，支持离线模式
- 🤝 团队协作友好

## 安装

1. 打开 VSCode
2. 转到扩展商店
3. 搜索 "YAAC"
4. 点击安装

## 使用方法

1. 在 VSCode 中打开一个 Git 仓库
2. 当你完成代码修改后，点击源代码管理图标
3. 点击 "AI Commit" 按钮或使用快捷键 `cmd+shift+c`
4. 插件会自动分析你的更改并生成合适的提交信息
5. 你可以直接使用或编辑生成的信息
6. 确认后提交更改

## 配置

### 基础配置

```json
{
  "yaac.language": "zh_CN",
  "yaac.commitStyle": "conventional",
  "yaac.aiProvider": "openai"
}
```

### AI 配置

```json
{
  "yaac.openai.apiKey": "your-api-key",
  "yaac.openai.model": "gpt-4"
}
```

## 贡献指南

欢迎贡献代码！请查看我们的 [贡献指南](CONTRIBUTING.md) 了解详情。

## 许可证

MIT

## 支持

如果你遇到任何问题或有建议，请：

1. 查看 [常见问题](FAQ.md)
2. 提交 [Issue](https://github.com/cs-magic/yaac/issues)
3. 加入我们的 [Discord 社区](https://discord.gg/yaac)
