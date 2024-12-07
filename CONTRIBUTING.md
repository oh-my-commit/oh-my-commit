# Contributing to YAAC

感谢你对 YAAC（Yet Another Auto Commit）的贡献兴趣！这份指南将帮助你了解如何参与项目开发。

## 目录

- [开发环境设置](#开发环境设置)
- [代码风格](#代码风格)
- [提交规范](#提交规范)
- [配置系统](#配置系统)
- [测试指南](#测试指南)
- [文档维护](#文档维护)
- [发布流程](#发布流程)

## 开发环境设置

1. **基础要求**
   ```bash
   node >= 18.0.0
   pnpm >= 8.0.0
   python >= 3.8
   ```

2. **克隆仓库**
   ```bash
   git clone https://github.com/cs-magic/yaac.git
   cd yaac
   ```

3. **安装依赖**
   ```bash
   pnpm install
   pip install -r requirements.txt
   ```

4. **启动开发服务器**
   ```bash
   pnpm watch
   ```

5. **在 VSCode 中调试**
   - 按 F5 启动调试会话
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

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

\`\`\`
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
\`\`\`

类型包括：
- feat: 新功能
- fix: 修复
- docs: 文档更新
- style: 代码风格（不影响代码运行的变动）
- refactor: 重构
- perf: 性能优化
- test: 测试
- chore: 构建过程或辅助工具的变动

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

## 测试指南

1. **单元测试**
   ```bash
   pnpm test
   ```
   - 使用 Jest 进行测试
   - 测试文件放在 __tests__ 目录
   - 测试覆盖率要求 > 80%

2. **集成测试**
   ```bash
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
   ```bash
   pnpm version <major|minor|patch>
   ```
   - 遵循语义化版本
   - 更新 CHANGELOG.md
   - 创建版本标签

2. **构建检查**
   ```bash
   pnpm build
   pnpm test
   ```
   - 确保所有测试通过
   - 检查构建产物
   - 验证文档更新

3. **发布**
   ```bash
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
