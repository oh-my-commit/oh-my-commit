# Contributing to Oh My Commit

感谢你对 Oh My Commit（Yet Another Auto Commit）的贡献兴趣！这份指南将帮助你了解如何参与项目开发。

<!-- toc -->

[推荐阅读](#推荐阅读) • [开发环境设置](#开发环境设置) • [代码风格](#代码风格) • [配置系统](#配置系统) • [配置文档对齐](#配置文档对齐) • [测试指南](#测试指南) • [文档维护](#文档维护) • [发布流程](#发布流程) • [问题反馈](#问题反馈) • [许可证](#许可证)

<!-- tocstop -->

## 推荐阅读

在开始贡献代码之前，我们强烈建议你阅读以下文档：

1. **最佳实践指南**

   请阅读我们的最佳实践文档（`docs/yet-another-best-practice/`）：

   - [状态管理最佳实践](docs/yet-another-best-practice/state-management.md)
   - [CSS 管理最佳实践](docs/yet-another-best-practice/css-management.md)

2. **API 规范**

   所有底层实现必须严格遵循我们的 [API 规范](docs/api-spec.md)，这确保了代码的一致性和可维护性。

3. **Commit 规范**
   - [Commit 规范](docs/yet-another-best-practice/commit-specification.md)

## 开发环境设置

1. **基础要求**

   ```zsh
   node >= 18.0.0
   pnpm >= 8.0.0
   python >= 3.8
   ```

2. **克隆仓库**

   ```zsh
   git clone https://github.com/oh-my-commit/oh-my-commit.git
   cd oh-my-commit
   ```

3. **安装依赖**

   ```zsh
   pnpm install
   pip install -r requirements.txt
   ```

4. **启动开发服务器**

   ```zsh
   pnpm watch
   ```

5. **在 VSCode 中调试**
   - 按 `F5` 启动调试会话
   - 在新窗口中测试插件功能

## 代码风格

我们使用 ESLint 和 Prettier 来保持代码风格的一致性：

1. **TypeScript**

   - 使用 TypeScript 严格模式
   - 优先使用 `interface` 而不是 `type`
   - 所有公共 API 必须有 JSDoc 注释

2. **React**

   - 使用函数组件和 Hooks
   - 遵循 React 最佳实践
   - 组件文件使用 .tsx 扩展名

3. **Python**
   - 遵循 PEP 8 规范
   - 使用 Black 进行代码格式化
   - 类型注解必须完整

## 配置系统

配置项组织规范：

1. **分组顺序**

   - basic (1-9): 基础配置
   - ui (10-19): 界面设置
   - git (20-29): Git 相关
   - ai (30-39): AI 功能
   - telemetry (40-49): 数据收集
   - feedback (50-59): 用户反馈

2. **添加新配置**

   - 在 package.json 中定义配置模式
   - 更新 README.md 中的配置表格
   - 添加配置处理逻辑
   - 编写配置迁移代码（如果需要）

3. **配置项要求**
   - 清晰的命名空间
   - 合理的默认值
   - 完整的类型定义
   - 中英文描述
   - 适当的作用域

## 配置文档对齐

我们使用自动化工具来保持配置文档的同步和准确性。每当修改了 `package.json` 中的配置项后，都需要更新文档。

### 使用说明

使用以下命令生成配置文档：

```zsh
# 在控制台预览配置表格
pnpm gen-docs

# 更新 README.md 中的用户配置章节
pnpm gen-docs -o README.md

# 自定义配置章节标题
pnpm gen-docs -o README.md -t "Configuration"
```

支持的命令行选项：

- `-o, --out <path>`: 输出文件路径，如果是 README.md，将只更新配置章节
- `-t, --title <title>`: 配置章节标题，默认为"用户配置"
- `-h, --help`: 显示帮助信息
- `-V, --version`: 显示版本信息

### 工作原理

配置文档生成工具会：

1. 从 `package.json` 中读取 VSCode 扩展配置（`contributes.configuration.properties`）
2. 提取每个配置项的类型、默认值、说明和可选值
3. 按照配置项的 `order` 排序
4. 生成格式化的 Markdown 表格
5. 如果指定了输出文件：
   - 对于 README.md，只更新配置章节
   - 对于其他文件，直接写入表格内容

### 最佳实践

1. 在 `package.json` 中维护配置项时：

   - 使用 `markdownDescription` 提供格式化的说明文本
   - 为枚举值提供清晰的 `enumDescriptions`
   - 使用 `order` 字段控制配置项的显示顺序

2. 修改配置后：
   - 运行 `pnpm gen-docs` 预览变更
   - 确认无误后更新 README.md：`pnpm gen-docs -o README.md`

## 测试指南

1. **单元测试**

   ```zsh
   pnpm test
   ```

   - 使用 Jest 进行测试
   - 测试文件放在 **tests** 目录
   - 测试覆盖率要求 > 80%

2. **集成测试**

   ```zsh
   pnpm test:e2e
   ```

   - 使用 VSCode 测试框架
   - 模拟真实用户操作
   - 测试主要功能流程

3. **本地测试**
   - 使用 `pnpm watch` 实时编译
   - 在 VSCode 中调试运行
   - 测试不同配置组合

## 文档维护

1. **API 文档**

   - 使用 TypeDoc 生成
   - 所有公共 API 必须有文档
   - 包含使用示例

2. **用户文档**

   - README.md: 项目概览
   - docs/: 详细文档
   - 配置说明必须及时更新

3. **更新日志**
   - 遵循 Keep a Changelog 格式
   - 版本号遵循 Semver
   - 记录所有重要变更

## 发布流程

1. **版本管理**

   ```zsh
   pnpm version <major|minor|patch>
   ```

   - 遵循语义化版本
   - 更新 CHANGELOG.md
   - 创建版本标签

2. **构建检查**

   ```zsh
   pnpm build
   pnpm test
   ```

   - 确保所有测试通过
   - 检查构建产物
   - 验证文档更新

3. **发布**
   ```zsh
   vsce package
   vsce publish
   ```
   - 更新 marketplace 介绍
   - 验证安装包
   - 发布到 VSCode Marketplace

## 问题反馈

- 使用 GitHub Issues 报告问题
- 提供复现步骤和环境信息
- 遵循 issue 模板填写信息

## 许可证

贡献代码即表示你同意将代码以 MIT 许可证发布。
