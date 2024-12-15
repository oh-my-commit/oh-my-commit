# AI 能力

YAAC 的核心特色是强大的 AI 能力，它能深入理解你的代码变更，生成专业的提交信息。

## 支持的 AI 模型

### OpenAI GPT
- GPT-4
- GPT-3.5-turbo
- GPT-3.5-turbo-16k

特点：
- 强大的代码理解能力
- 优秀的自然语言生成
- 支持多语言

### Anthropic Claude
- Claude 2
- Claude Instant

特点：
- 更强的上下文理解
- 更好的代码分析能力
- 更低的延迟

### YAAC 专业模型
基于大量真实代码提交数据训练的专业模型：
- 更好的提交规范理解
- 更快的响应速度
- 更低的资源消耗

## AI 功能特性

### 1. 代码变更分析

- **变更类型识别**
  - 新功能添加
  - Bug 修复
  - 代码重构
  - 性能优化
  - 文档更新
  - 样式调整
  - 测试相关

- **影响范围分析**
  - 核心功能
  - UI 组件
  - API 接口
  - 配置文件
  - 测试用例

### 2. 提交信息生成

- **格式规范**
  - Conventional Commits
  - Angular Commit Message
  - 自定义格式

- **多语言支持**
  - 中文
  - 英文
  - 自动翻译

- **智能摘要**
  - 关键变更提取
  - 影响范围总结
  - Breaking Changes 标注

### 3. 代码审查辅助

- **代码质量分析**
  - 潜在问题识别
  - 最佳实践建议
  - 性能优化建议

- **变更影响评估**
  - 依赖分析
  - 破坏性变更检测
  - 测试覆盖建议

## 使用场景

### 1. 个人开发

```bash
# 示例：快速提交
git add .
yaac commit
```

AI 将自动：
1. 分析你的代码变更
2. 生成符合规范的提交信息
3. 提供详细的变更说明

### 2. 团队协作

```bash
# 示例：团队规范提交
yaac commit --template team
```

特点：
- 统一的提交格式
- 自动应用团队规范
- 多语言本地化

### 3. 代码审查

```bash
# 示例：审查辅助
yaac review PR-123
```

功能：
- 自动分析 PR 内容
- 生成审查建议
- 标注潜在问题

## 配置与优化

### 1. 模型选择

```json
{
  "yaac.ai.provider": "openai",
  "yaac.ai.model": "gpt-4",
  "yaac.ai.temperature": 0.7
}
```

### 2. 提示词优化

```json
{
  "yaac.ai.prompt": {
    "template": "作为一个经验丰富的开发者，请分析以下代码变更并生成提交信息：\n{diff}",
    "language": "zh-CN",
    "style": "professional"
  }
}
```

### 3. 性能调优

```json
{
  "yaac.ai.cache": true,
  "yaac.ai.timeout": 10000,
  "yaac.ai.retries": 3
}
```

## 最佳实践

1. **选择合适的模型**
   - 小型变更：GPT-3.5-turbo
   - 复杂变更：GPT-4
   - 团队项目：YAAC 专业模型

2. **优化提交流程**
   - 使用 staged 模式
   - 启用自动格式化
   - 配置提交模板

3. **提高响应速度**
   - 启用本地缓存
   - 使用流式输出
   - 配置合理的超时
