# Custom Prompt Template Guide

本指南将帮助你创建和使用自定义的 Prompt 模板。

## 模板基础

### 1. 模板位置

模板文件应放置在 `templates` 目录下，使用 `.hbs` 扩展名：

```bash
templates/
  ├── provider-official/        # 官方提供商模板
  │   └── standard.hbs         # 标准模板
  └── your-provider/           # 你的提供商模板
      └── custom.hbs          # 自定义模板
```

### 2. 模板格式

模板使用 Handlebars 语法，支持以下变量：

```handlebars
{{! 输入变量 }}
{{lang}}
# 语言选项 (en/zh 等)
{{diff}}
# Git diff 内容
```

### 3. 使用示例

```typescript
import { PromptTemplate } from "@shared/server/prompt-template"

class YourProvider extends Provider {
  private template = new PromptTemplate("your-provider/custom")

  async generateCommit(input: GenerateCommitInput) {
    const prompt = this.template.fill({
      lang: input.options?.lang || "en",
      diff: input.diff,
    })

    // 使用生成的 prompt 调用 AI API
    const response = await this.callAI(prompt)

    return {
      ok: true,
      data: {
        title: response.title,
        body: response.body,
      },
    }
  }
}
```

## 最佳实践

1. **模板组织**

   - 为你的提供商创建独立的模板目录
   - 使用有意义的模板名称
   - 将模板文件与代码一起版本控制

2. **性能优化**

   - `PromptTemplate` 类内部已实现模板缓存
   - 在提供商类中将 template 实例声明为私有成员变量
   - 避免重复创建 template 实例

3. **错误处理**

   - 确保模板文件存在
   - 处理模板语法错误
   - 提供有意义的错误信息

4. **多语言支持**
   - 使用 `lang` 参数控制输出语言
   - 在模板中使用条件语句处理不同语言

## 示例模板

```handlebars
{{! your-provider/custom.hbs }}
{{#if (eq lang "zh")}}
  请根据以下 Git 差异生成一个符合约定式提交规范的提交信息： 差异内容：
  {{diff}}

  要求： 1. 使用中文 2. 简洁明了 3. 符合约定式提交规范
{{else}}
  Please generate a conventional commit message based on the following Git diff:
  Diff content:
  {{diff}}

  Requirements: 1. Use English 2. Be concise 3. Follow conventional commit
  format
{{/if}}
```

## 调试建议

1. 使用日志记录生成的 prompt
2. 在开发环境保存生成的 prompt 用于调试
3. 使用版本控制跟踪模板变更

## 注意事项

1. 模板路径区分大小写
2. 确保模板文件使用 UTF-8 编码
3. 避免在模板中包含敏感信息
4. 定期检查和更新模板以改进生成质量
