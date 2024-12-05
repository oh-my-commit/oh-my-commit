# Development Log

## 2024-01-05

### 需求分析与架构设计讨论

#### 需求理解

- 开发一款基于 AI 的 VSCode 自动提交插件
- 市面上已有类似产品，但用户体验不够好
- 需要优秀的产品体验作为核心竞争力

#### 架构设计建议

##### 1. 整体架构

- 采用前后端分离架构
  - 前端：VSCode 插件（TypeScript）
  - 后端：独立服务（Node.js/Python）
  - AI 服务：可插拔式设计，支持多种 AI 提供商

##### 2. 核心模块

1. **VSCode 插件模块**

   - UI 组件：提交预览、设置界面、快捷操作
   - Git 操作封装：diff 分析、状态监控
   - 配置管理：用户设置、团队配置同步
   - 本地缓存：提高响应速度，支持离线模式

2. **代码分析模块**

   - 变更检测：实时监控文件变化
   - Diff 分析：智能识别代码变更类型
   - AST 分析：深入理解代码结构
   - 上下文收集：获取相关代码信息

3. **AI 处理模块**

   - 多模型支持：OpenAI、本地模型等
   - 提示词工程：优化 AI 输出质量
   - 结果优化：格式化、本地化处理
   - 失败重试：错误处理和降级策略

4. **配置系统**
   - 用户配置：个性化设置
   - 团队配置：共享规则
   - Git hooks：自定义集成点
   - API 密钥管理：安全存储

##### 3. 性能优化

- 本地缓存机制
- 增量分析策略
- 后台预处理
- 请求节流和防抖

##### 4. 安全考虑

- API 密钥加密存储
- 本地优先的代码分析
- 最小权限原则
- 数据传输加密

#### 注意事项

1. **用户体验**

   - 响应速度要快（< 2s）
   - 提供实时反馈
   - 支持快捷键操作
   - 错误提示友好

2. **代码质量**

   - 使用 TypeScript 确保类型安全
   - 完善的测试覆盖
   - 统一的代码风格（Prettier + ESLint）
   - 清晰的文档注释

3. **可维护性**

   - 模块化设计
   - 清晰的日志系统
   - 完整的错误追踪
   - 版本化的配置管理

4. **扩展性**
   - 插件化的 AI 提供商
   - 可自定义的提交模板
   - 灵活的 Git hooks
   - 开放的 API 接口

#### 下一步计划

1. 搭建基础项目框架
2. 实现核心 Git 操作封装
3. 开发基础 UI 组件
4. 集成 AI 服务
5. 添加配置系统
6. 进行性能优化

#### 技术栈选择

- 前端：TypeScript + VSCode API
- 后端：Node.js/Express（如需要）
- AI：OpenAI API（初始方案）
- 测试：Jest + Playwright
- 构建：esbuild/webpack
- CI/CD：GitHub Actions

## 2024-01-05

### 项目信息更新

- 确定项目简称为 YAAC（读作"雅刻"）
- 更新了项目所有文档中的名称和配置项
- 设置了正确的 GitHub 仓库地址：github.com/cs-magic/yaac

## 2024-01-06

### API 规范设计

- 创建了详细的 API 规范文档 (docs/api-spec.md)
- 设计了标准化的服务提供商接入协议
- 支持两种集成方式：
  1. RESTful API 接入
  2. 本地命令行工具集成（如 gcop）
- 定义了统一的请求/响应格式
- 设计了完善的错误处理机制
- 考虑了项目上下文和 Git 历史等高级特性

#### 关键设计决策

1. 采用插件化架构，支持多种 AI 提供商
2. 统一的 JSON 响应格式，便于跨平台集成
3. 支持同步/异步两种调用方式
4. 预留了扩展字段，支持未来功能增强

#### 下一步计划

1. 实现核心 API 服务
2. 开发第一个参考实现（集成 gcop）
3. 编写详细的集成文档和示例
4. 建立提供商认证机制

## 2024-01-06

### 重要设计更新：面向模型的架构

#### 设计理念调整

- 将产品定位从"技术导向"转向"模型导向"
- 用户关注点转移：从具体模型到成本/效果/性能
- 简化用户交互：一键提交 + 方案切换

#### 核心改进

1. **简化用户界面**

   - 状态栏显示当前方案
   - 快速切换不同提交方案
   - 隐藏技术细节，突出实用指标

2. **模型抽象**

   - 将不同实现封装为统一的"方案"
   - 每个方案包含性能/成本/质量指标
   - 支持方案自定义命名

3. **配置优化**
   - API 配置集中管理
   - 一次性配置，长期使用
   - 简化配置流程

#### API 规范更新

- 重新设计了 API 接口，强调模型而非技术实现
- 添加了方案注册和管理接口
- 简化了提交生成接口
- 增加了性能指标反馈

#### 下一步计划

1. 实现新的用户界面
2. 开发方案管理系统
3. 提供首批官方推荐方案
4. 编写方案提供商接入指南

## 2024-01-07

### 集成 gcop 服务

#### 需求分析

- 根据 PRD.md，gcop 服务是一个速度优先的提交方案选项
- 需要实现服务集成，并确保与现有代码架构良好配合

#### 开发计划

1. 在 core 目录下创建 services 目录，用于存放各种提交服务的实现
2. 实现 GcopService 类，遵循统一的服务接口规范
3. 添加必要的配置项和类型定义
4. 实现服务注册和切换机制
5. 添加错误处理和日志记录

#### 技术要点

- 使用 TypeScript 确保类型安全
- 实现统一的服务接口，便于后续扩展
- 添加完善的错误处理和日志记录
- 遵循 SOLID 原则，保持代码可维护性

## 2024-01-07: 集成 gcop 服务（更新）

### 需求更新

- gcop 是基于 Python 的本地服务，需要用户预先安装
- 支持多种 AI 模型，包括 OpenAI、Deepseek、Zhipu 等
- 通过 YAML 配置文件管理服务配置

### 开发进展

1. 创建了服务相关的核心文件：

   - `gcopConfig.ts`: 定义了 gcop 配置的类型和支持的模型
   - `gcopService.ts`: 实现了 gcop 服务，包括配置管理和命令执行
   - `serviceFactory.ts`: 实现了服务工厂模式
   - `types.ts`: 定义了通用的服务接口

2. 实现的主要功能：

   - 检查 gcop 是否已安装
   - 自动生成和管理 gcop 配置文件
   - 支持多种 AI 模型的配置
   - 解析 gcop 命令输出为标准格式

3. 配置项更新：
   - 添加模型选择
   - 支持 git 历史包含选项
   - 支持自定义提交模板
   - 各服务商的 API 配置

### 待办事项

1. 添加服务安装指南
2. 实现模型适配函数
3. 添加错误处理和重试机制
4. 编写单元测试

## 2024-01-07: 实现模型适配器

### 开发进展

1. 创建了 `modelAdapter.ts`：

   - 定义了各服务商的配置项
   - 实现了模型名称的标准化处理
   - 添加了环境变量名称的映射

2. 更新了 `gcopService.ts`：

   - 使用模型适配器处理不同服务商的配置
   - 从环境变量读取 API 密钥和基础 URL
   - 改进了错误处理和提示信息

3. 配置管理改进：
   - 移除了直接的 API 密钥配置，改为使用环境变量
   - 统一了服务商配置的命名规范
   - 简化了配置验证流程

### 环境变量说明

用户需要根据选择的模型设置相应的环境变量：

- OpenAI:

  - `OPENAI_API_KEY`
  - `OPENAI_API_BASE` (可选)

- Deepseek:

  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_API_BASE` (可选)

- Zhipu:

  - `ZHIPU_API_KEY`
  - `ZHIPU_API_BASE` (可选)

- Ollama:

  - `OLLAMA_API_KEY` (可选)
  - `OLLAMA_API_BASE` (可选，默认为 localhost:11434)

- Groq:

  - `GROQ_API_KEY`
  - `GROQ_API_BASE` (可选)

- Anthropic:
  - `ANTHROPIC_API_KEY`
  - `ANTHROPIC_API_BASE` (可选)

### 待办事项

1. 添加服务安装指南
2. 添加错误处理和重试机制
3. 编写单元测试
4. 更新用户文档

## 2024-01-07: 添加 gcop 默认配置

### 开发进展

1. 在 gcop provider 目录下创建了默认配置文件：

   - 创建 `config.json`，包含完整的配置项
   - 配置遵循 conventional commit 规范
   - 添加了性能优化相关配置
   - 支持多语言和协作者标注

2. 主要配置项包括：
   - 基础设置：语言、启用状态
   - 提交风格：conventional commit、最大长度限制
   - 分析设置：文件范围、测试文件处理
   - 输出设置：格式化、本地化处理
   - 缓存设置：性能优化

### 待办事项

1. 添加配置文件的自动验证
2. 实现配置热重载功能
3. 添加配置迁移工具
4. 完善配置文档

## 2024-01-07: 添加安装指南

### 开发进展

1. 创建了详细的安装指南文档：

   - 前置要求说明
   - 分步骤安装指导
   - 环境变量配置说明
   - 常见问题解答

2. 更新了 README.md：
   - 添加了安装指南链接
   - 简化了安装步骤说明
   - 改进了文档结构

### 待办事项

1. 添加错误处理和重试机制
2. 编写单元测试
3. 完善用户文档的其他部分

## 2024-01-07: 添加 Git 状态监听功能

### 问题描述

用户在命令行运行 `git init` 后，YAAC 无法自动更新到有 Git 的状态，需要重启 VSCode 才能生效。

### 模型

1. 在 GitManager 中添加文件系统监听器：

   - 监听 `.git` 目录的创建和删除
   - 通过 EventEmitter 发送状态变化事件
   - 在初始化时进行状态检查

2. 更新 StatusBarManager：

   - 添加显示和隐藏功能
   - 改进状态栏更新逻辑
   - 优化错误处理和提示信息

3. 更新扩展主入口文件：
   - 添加 Git 状态变化监听
   - 根据状态自动显示/隐藏状态栏
   - 更新命令上下文

### 技术要点

- 使用 `vscode.FileSystemWatcher` 监听文件系统变化
- 使用 `vscode.EventEmitter` 实现事件通知
- 通过 `setContext` 命令更新 VSCode 命令上下文

### 待办事项

1. 添加错误处理和重试机制
2. 编写单元测试
3. 完善用户文档

## 2024-01-08

### Quick Commit Amend Feature

#### Changes Made
- Added support for amending last commit when there are no changes to commit
- Added new methods to GitCore class:
  - `getLastCommitMessage()`: Retrieves the message from the last commit
  - `amendCommit()`: Amends the last commit with a new message
- Updated VscodeGitService to expose the new git methods
- Modified QuickCommitCommand to show amend option when no changes are detected
  - Shows the last commit message and allows editing
  - Provides a quick-pick interface consistent with the regular commit flow

#### Technical Details
- Used simple-git's log and commit commands with --amend flag
- Maintained consistent UX with the existing commit flow
- Added proper error handling and logging
- Kept the same UI patterns (quick-pick followed by input box)

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message（第二版）

#### 问题背景
- 之前使用的 `createInputBox` 方案仍然不支持多行输入
- 用户在按下回车键时会直接提交，无法实现换行功能

#### 新实现方案
- 使用 VS Code 的 `openTextDocument` 和 `showTextDocument` API
- 创建临时文件让用户编辑 commit message
- 当用户切换到其他文件时，自动读取编辑内容并提交
- 添加状态栏提示，指导用户如何完成提交操作

#### 技术要点
- 使用 VS Code 的文档编辑 API，提供完整的编辑器功能
- 通过 `onDidChangeActiveTextEditor` 事件监听用户切换文件
- 添加状态栏提示改善用户体验
- 确保资源的正确清理（状态栏项目和事件监听器）

#### 优势
- 完整的多行编辑支持
- 熟悉的编辑器界面
- 支持复制粘贴、撤销重做等编辑器功能
- 清晰的用户操作指引

## 2024-01-09

### Quick Commit No-Diff Behavior Configuration

#### Changes Made
- Added new configuration option `yaac.noDiffBehavior` to control behavior when no changes are detected
  - `ignore`: Shows a message and exits (default)
  - `revise`: Allows amending the last commit
- Updated QuickCommitCommand to respect this configuration
- Maintained consistent UX patterns for both behaviors

#### Technical Details
- Used VSCode's configuration API to manage the setting
- Added proper schema in package.json with enum values
- Added descriptive configuration description in Chinese
- Kept existing logging and error handling

## 2024-01-09

### 优化 Commit Message 输入体验

#### 问题
- VSCode 的 InputBox 不支持多行输入
- Commit message 最佳实践建议分离标题和描述

#### 解决方案
- 使用 QuickPick 替代 InputBox 实现更好的多行输入体验
- 将 commit message 分成标题和描述两部分
- 用户可以分别编辑标题和描述
- 使用 VSCode 内置图标美化界面

#### 技术要点
- 使用 `vscode.window.createQuickPick()` 创建交互界面
- 通过 Promise 处理异步编辑流程
- 保持了原有的错误处理和日志记录功能
- 符合 Git commit message 最佳实践格式

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message（第二版）

#### 问题背景
- 之前使用的 `createInputBox` 方案仍然不支持多行输入
- 用户在按下回车键时会直接提交，无法实现换行功能

#### 新实现方案
- 使用 VS Code 的 `openTextDocument` 和 `showTextDocument` API
- 创建临时文件让用户编辑 commit message
- 当用户切换到其他文件时，自动读取编辑内容并提交
- 添加状态栏提示，指导用户如何完成提交操作

#### 技术要点
- 使用 VS Code 的文档编辑 API，提供完整的编辑器功能
- 通过 `onDidChangeActiveTextEditor` 事件监听用户切换文件
- 添加状态栏提示改善用户体验
- 确保资源的正确清理（状态栏项目和事件监听器）

#### 优势
- 完整的多行编辑支持
- 熟悉的编辑器界面
- 支持复制粘贴、撤销重做等编辑器功能
- 清晰的用户操作指引

## 2024-01-09

### Quick Commit No-Diff Behavior Configuration

#### Changes Made
- Added new configuration option `yaac.noDiffBehavior` to control behavior when no changes are detected
  - `ignore`: Shows a message and exits (default)
  - `revise`: Allows amending the last commit
- Updated QuickCommitCommand to respect this configuration
- Maintained consistent UX patterns for both behaviors

#### Technical Details
- Used VSCode's configuration API to manage the setting
- Added proper schema in package.json with enum values
- Added descriptive configuration description in Chinese
- Kept existing logging and error handling

## 2024-01-09

### 优化 Commit Message 输入体验

#### 问题
- VSCode 的 InputBox 不支持多行输入
- Commit message 最佳实践建议分离标题和描述

#### 解决方案
- 使用 QuickPick 替代 InputBox 实现更好的多行输入体验
- 将 commit message 分成标题和描述两部分
- 用户可以分别编辑标题和描述
- 使用 VSCode 内置图标美化界面

#### 技术要点
- 使用 `vscode.window.createQuickPick()` 创建交互界面
- 通过 Promise 处理异步编辑流程
- 保持了原有的错误处理和日志记录功能
- 符合 Git commit message 最佳实践格式

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message（第二版）

#### 问题背景
- 之前使用的 `createInputBox` 方案仍然不支持多行输入
- 用户在按下回车键时会直接提交，无法实现换行功能

#### 新实现方案
- 使用 VS Code 的 `openTextDocument` 和 `showTextDocument` API
- 创建临时文件让用户编辑 commit message
- 当用户切换到其他文件时，自动读取编辑内容并提交
- 添加状态栏提示，指导用户如何完成提交操作

#### 技术要点
- 使用 VS Code 的文档编辑 API，提供完整的编辑器功能
- 通过 `onDidChangeActiveTextEditor` 事件监听用户切换文件
- 添加状态栏提示改善用户体验
- 确保资源的正确清理（状态栏项目和事件监听器）

#### 优势
- 完整的多行编辑支持
- 熟悉的编辑器界面
- 支持复制粘贴、撤销重做等编辑器功能
- 清晰的用户操作指引

## 2024-01-09

### Quick Commit No-Diff Behavior Configuration

#### Changes Made
- Added new configuration option `yaac.noDiffBehavior` to control behavior when no changes are detected
  - `ignore`: Shows a message and exits (default)
  - `revise`: Allows amending the last commit
- Updated QuickCommitCommand to respect this configuration
- Maintained consistent UX patterns for both behaviors

#### Technical Details
- Used VSCode's configuration API to manage the setting
- Added proper schema in package.json with enum values
- Added descriptive configuration description in Chinese
- Kept existing logging and error handling

## 2024-01-09

### 优化 Commit Message 输入体验

#### 问题
- VSCode 的 InputBox 不支持多行输入
- Commit message 最佳实践建议分离标题和描述

#### 解决方案
- 使用 QuickPick 替代 InputBox 实现更好的多行输入体验
- 将 commit message 分成标题和描述两部分
- 用户可以分别编辑标题和描述
- 使用 VSCode 内置图标美化界面

#### 技术要点
- 使用 `vscode.window.createQuickPick()` 创建交互界面
- 通过 Promise 处理异步编辑流程
- 保持了原有的错误处理和日志记录功能
- 符合 Git commit message 最佳实践格式

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message（第二版）

#### 问题背景
- 之前使用的 `createInputBox` 方案仍然不支持多行输入
- 用户在按下回车键时会直接提交，无法实现换行功能

#### 新实现方案
- 使用 VS Code 的 `openTextDocument` 和 `showTextDocument` API
- 创建临时文件让用户编辑 commit message
- 当用户切换到其他文件时，自动读取编辑内容并提交
- 添加状态栏提示，指导用户如何完成提交操作

#### 技术要点
- 使用 VS Code 的文档编辑 API，提供完整的编辑器功能
- 通过 `onDidChangeActiveTextEditor` 事件监听用户切换文件
- 添加状态栏提示改善用户体验
- 确保资源的正确清理（状态栏项目和事件监听器）

#### 优势
- 完整的多行编辑支持
- 熟悉的编辑器界面
- 支持复制粘贴、撤销重做等编辑器功能
- 清晰的用户操作指引

## 2024-01-09

### Quick Commit No-Diff Behavior Configuration

#### Changes Made
- Added new configuration option `yaac.noDiffBehavior` to control behavior when no changes are detected
  - `ignore`: Shows a message and exits (default)
  - `revise`: Allows amending the last commit
- Updated QuickCommitCommand to respect this configuration
- Maintained consistent UX patterns for both behaviors

#### Technical Details
- Used VSCode's configuration API to manage the setting
- Added proper schema in package.json with enum values
- Added descriptive configuration description in Chinese
- Kept existing logging and error handling

## 2024-01-09

### 优化 Commit Message 输入体验

#### 问题
- VSCode 的 InputBox 不支持多行输入
- Commit message 最佳实践建议分离标题和描述

#### 解决方案
- 使用 QuickPick 替代 InputBox 实现更好的多行输入体验
- 将 commit message 分成标题和描述两部分
- 用户可以分别编辑标题和描述
- 使用 VSCode 内置图标美化界面

#### 技术要点
- 使用 `vscode.window.createQuickPick()` 创建交互界面
- 通过 Promise 处理异步编辑流程
- 保持了原有的错误处理和日志记录功能
- 符合 Git commit message 最佳实践格式

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message（第二版）

#### 问题背景
- 之前使用的 `createInputBox` 方案仍然不支持多行输入
- 用户在按下回车键时会直接提交，无法实现换行功能

#### 新实现方案
- 使用 VS Code 的 `openTextDocument` 和 `showTextDocument` API
- 创建临时文件让用户编辑 commit message
- 当用户切换到其他文件时，自动读取编辑内容并提交
- 添加状态栏提示，指导用户如何完成提交操作

#### 技术要点
- 使用 VS Code 的文档编辑 API，提供完整的编辑器功能
- 通过 `onDidChangeActiveTextEditor` 事件监听用户切换文件
- 添加状态栏提示改善用户体验
- 确保资源的正确清理（状态栏项目和事件监听器）

#### 优势
- 完整的多行编辑支持
- 熟悉的编辑器界面
- 支持复制粘贴、撤销重做等编辑器功能
- 清晰的用户操作指引

## 2024-01-09

### Quick Commit No-Diff Behavior Configuration

#### Changes Made
- Added new configuration option `yaac.noDiffBehavior` to control behavior when no changes are detected
  - `ignore`: Shows a message and exits (default)
  - `revise`: Allows amending the last commit
- Updated QuickCommitCommand to respect this configuration
- Maintained consistent UX patterns for both behaviors

#### Technical Details
- Used VSCode's configuration API to manage the setting
- Added proper schema in package.json with enum values
- Added descriptive configuration description in Chinese
- Kept existing logging and error handling

## 2024-01-09

### 优化 Commit Message 输入体验

#### 问题
- VSCode 的 InputBox 不支持多行输入
- Commit message 最佳实践建议分离标题和描述

#### 解决方案
- 使用 QuickPick 替代 InputBox 实现更好的多行输入体验
- 将 commit message 分成标题和描述两部分
- 用户可以分别编辑标题和描述
- 使用 VSCode 内置图标美化界面

#### 技术要点
- 使用 `vscode.window.createQuickPick()` 创建交互界面
- 通过 Promise 处理异步编辑流程
- 保持了原有的错误处理和日志记录功能
- 符合 Git commit message 最佳实践格式

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message（第二版）

#### 问题背景
- 之前使用的 `createInputBox` 方案仍然不支持多行输入
- 用户在按下回车键时会直接提交，无法实现换行功能

#### 新实现方案
- 使用 VS Code 的 `openTextDocument` 和 `showTextDocument` API
- 创建临时文件让用户编辑 commit message
- 当用户切换到其他文件时，自动读取编辑内容并提交
- 添加状态栏提示，指导用户如何完成提交操作

#### 技术要点
- 使用 VS Code 的文档编辑 API，提供完整的编辑器功能
- 通过 `onDidChangeActiveTextEditor` 事件监听用户切换文件
- 添加状态栏提示改善用户体验
- 确保资源的正确清理（状态栏项目和事件监听器）

#### 优势
- 完整的多行编辑支持
- 熟悉的编辑器界面
- 支持复制粘贴、撤销重做等编辑器功能
- 清晰的用户操作指引

## 2024-01-09

### Quick Commit No-Diff Behavior Configuration

#### Changes Made
- Added new configuration option `yaac.noDiffBehavior` to control behavior when no changes are detected
  - `ignore`: Shows a message and exits (default)
  - `revise`: Allows amending the last commit
- Updated QuickCommitCommand to respect this configuration
- Maintained consistent UX patterns for both behaviors

#### Technical Details
- Used VSCode's configuration API to manage the setting
- Added proper schema in package.json with enum values
- Added descriptive configuration description in Chinese
- Kept existing logging and error handling

## 2024-01-09

### 优化 Commit Message 输入体验

#### 问题
- VSCode 的 InputBox 不支持多行输入
- Commit message 最佳实践建议分离标题和描述

#### 解决方案
- 使用 QuickPick 替代 InputBox 实现更好的多行输入体验
- 将 commit message 分成标题和描述两部分
- 用户可以分别编辑标题和描述
- 使用 VSCode 内置图标美化界面

#### 技术要点
- 使用 `vscode.window.createQuickPick()` 创建交互界面
- 通过 Promise 处理异步编辑流程
- 保持了原有的错误处理和日志记录功能
- 符合 Git commit message 最佳实践格式

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message（第二版）

#### 问题背景
- 之前使用的 `createInputBox` 方案仍然不支持多行输入
- 用户在按下回车键时会直接提交，无法实现换行功能

#### 新实现方案
- 使用 VS Code 的 `openTextDocument` 和 `showTextDocument` API
- 创建临时文件让用户编辑 commit message
- 当用户切换到其他文件时，自动读取编辑内容并提交
- 添加状态栏提示，指导用户如何完成提交操作

#### 技术要点
- 使用 VS Code 的文档编辑 API，提供完整的编辑器功能
- 通过 `onDidChangeActiveTextEditor` 事件监听用户切换文件
- 添加状态栏提示改善用户体验
- 确保资源的正确清理（状态栏项目和事件监听器）

#### 优势
- 完整的多行编辑支持
- 熟悉的编辑器界面
- 支持复制粘贴、撤销重做等编辑器功能
- 清晰的用户操作指引

## 2024-01-09

### Quick Commit No-Diff Behavior Configuration

#### Changes Made
- Added new configuration option `yaac.noDiffBehavior` to control behavior when no changes are detected
  - `ignore`: Shows a message and exits (default)
  - `revise`: Allows amending the last commit
- Updated QuickCommitCommand to respect this configuration
- Maintained consistent UX patterns for both behaviors

#### Technical Details
- Used VSCode's configuration API to manage the setting
- Added proper schema in package.json with enum values
- Added descriptive configuration description in Chinese
- Kept existing logging and error handling

## 2024-01-09

### 优化 Commit Message 输入体验

#### 问题
- VSCode 的 InputBox 不支持多行输入
- Commit message 最佳实践建议分离标题和描述

#### 解决方案
- 使用 QuickPick 替代 InputBox 实现更好的多行输入体验
- 将 commit message 分成标题和描述两部分
- 用户可以分别编辑标题和描述
- 使用 VSCode 内置图标美化界面

#### 技术要点
- 使用 `vscode.window.createQuickPick()` 创建交互界面
- 通过 Promise 处理异步编辑流程
- 保持了原有的错误处理和日志记录功能
- 符合 Git commit message 最佳实践格式

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
- 使用 Promise 包装异步操作，确保正确处理用户的确认和取消操作

#### 技术要点
- VS Code 的 `createInputBox` API 提供了更丰富的功能
- 使用事件监听器处理用户交互
- 保持了原有的验证逻辑，确保提交信息不为空
- 优化了用户体验，支持多行输入且不会因失焦而丢失内容

## 2024-01-08

### 功能优化：支持多行 Commit Message（第二版）

#### 问题背景
- 之前使用的 `createInputBox` 方案仍然不支持多行输入
- 用户在按下回车键时会直接提交，无法实现换行功能

#### 新实现方案
- 使用 VS Code 的 `openTextDocument` 和 `showTextDocument` API
- 创建临时文件让用户编辑 commit message
- 当用户切换到其他文件时，自动读取编辑内容并提交
- 添加状态栏提示，指导用户如何完成提交操作

#### 技术要点
- 使用 VS Code 的文档编辑 API，提供完整的编辑器功能
- 通过 `onDidChangeActiveTextEditor` 事件监听用户切换文件
- 添加状态栏提示改善用户体验
- 确保资源的正确清理（状态栏项目和事件监听器）

#### 优势
- 完整的多行编辑支持
- 熟悉的编辑器界面
- 支持复制粘贴、撤销重做等编辑器功能
- 清晰的用户操作指引

## 2024-01-09

### Quick Commit No-Diff Behavior Configuration

#### Changes Made
- Added new configuration option `yaac.noDiffBehavior` to control behavior when no changes are detected
  - `ignore`: Shows a message and exits (default)
  - `revise`: Allows amending the last commit
- Updated QuickCommitCommand to respect this configuration
- Maintained consistent UX patterns for both behaviors

#### Technical Details
- Used VSCode's configuration API to manage the setting
- Added proper schema in package.json with enum values
- Added descriptive configuration description in Chinese
- Kept existing logging and error handling

## 2024-01-09

### 优化 Commit Message 输入体验

#### 问题
- VSCode 的 InputBox 不支持多行输入
- Commit message 最佳实践建议分离标题和描述

#### 解决方案
- 使用 QuickPick 替代 InputBox 实现更好的多行输入体验
- 将 commit message 分成标题和描述两部分
- 用户可以分别编辑标题和描述
- 使用 VSCode 内置图标美化界面

#### 技术要点
- 使用 `vscode.window.createQuickPick()` 创建交互界面
- 通过 Promise 处理异步编辑流程
- 保持了原有的错误处理和日志记录功能
- 符合 Git commit message 最佳实践格式

## 2024-01-08

### 功能优化：支持多行 Commit Message

#### 需求背景
- 用户需要在编写 commit message 时支持多行输入，以便更详细地描述提交内容

#### 实现方案
- 由于 `showInputBox` 不支持多行输入，改用 `createInputBox` API
- `createInputBox` 提供了更灵活的输入框控制，默认支持多行输入
- 添加了 `ignoreFocusOut` 选项，防止用户意外失去焦点导致输入丢失
