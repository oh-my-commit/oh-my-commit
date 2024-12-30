<div align="center">

# Oh My Commit


```shell
                               ____  _       __  __          _____                          _ _   
                              / __ \| |     |  \/  |        / ____|                        (_) |  
                             | |  | | |__   | \  / |_   _  | |     ___  _ __ ___  _ __ ___  _| |_ 
                             | |  | | '_ \  | |\/| | | | | | |    / _ \| '_ ` _ \| '_ ` _ \| | __|
                             | |__| | | | | | |  | | |_| | | |___| (_) | | | | | | | | | | | | |_ 
                              \____/|_| |_| |_|  |_|\__, |  \_____\___/|_| |_| |_|_| |_| |_|_|\__|
                                                     __/ |                                        
                                                    |___/                                         
                            
                            ✨Your AI-powered Commit Generator Solution ✨      
                                                                            
```

[English](./README.md) | [简体中文](./README.zh-CN.md) | [Website Docs](https://oh-my-commit.github.io)

</div>

## 系统架构

Oh My Commit 是一套模块化的智能提交解决方案：

- **多端支持**
  - CLI 工具：独立的命令行程序，支持在任何终端中使用
  - VSCode 插件：提供图形化界面，支持静默与交互模式
  - 未来计划：支持更多 IDE 与平台

- **核心组件**
  - 共享配置：跨端统一的用户配置与团队规范
  - 算法市场：支持自定义 AI 提交算法，可扩展的提供者系统
  - 数据分析：提交记录分析与团队协作洞察（规划中）

- **技术特点**
  - Monorepo 架构：基于 pnpm 的多包管理
  - 模块解耦：核心逻辑、UI、算法提供者分离
  - 插件化设计：支持第三方扩展与自定义

## 使用方法

> Cli 和 Vscode 可独立使用，但配置共享同步

### CLI 使用

```bash
# 全局安装命令行工具
npm install -g oh-my-commit

# 全局安装官方 AI Commit 算法实现
# 第三方目录：`~/.oh-my-commit/providers/`
npm install -g @oh-my-commit/provider-official

# 在 git 仓库中使用
omc  # 查看帮助
omc gen # AI 自动生成 commit
```

### VSCode 插件

1. 在 VSCode 扩展商店安装 "Oh My Commit"
2. 使用方式：
   - 快捷键：`cmd+shift+p` 搜索 "OMC: Quick Commit"
   - 状态栏：点击状态栏的 Commit 图标
   - 源代码管理：使用 VSCode 内置的 Git 面板

## 用户配置

| 配置项                                 | 类型     | 默认值                       | 说明                                              | 可选值                                                                                           |
| -------------------------------------- |--------|---------------------------| ------------------------------------------------- |-----------------------------------------------------------------------------------------------|
| `oh-my-commit.model.id`                | string | "omc-standard-claude-3.5" | 选择自动提交（AC）服务的供应商与模型              | • `omc-standard-claude-3.5`<br>• （可自定义实现，本地安装 / 源码 PR / npm 发布）                               |
| `oh-my-commit.git.lang`      | string | "system"                  | Git 提交信息的语言                                | • `system`: 跟随系统语言<br>• `zh_CN`: 中文提交信息<br>• `en_US`: English commit messages                 |
| `oh-my-commit.ai.apiKeys`              | object | -                         | AI 服务提供商的 API 密钥配置                      |                                                                                               |
| `oh-my-commit.ui.mode`                 | string | "panel"                   | 提交界面模式选择                                  | • `notification`: 通知形式生成 Commit 信息，适合个人快速开发<br>• `panel`: 常驻面板：支持编辑标题内容、查看 Diff 等的专业视图，适合协同场景 |
| `ohMyCommit.proxy.enabled`             | boolean | false                     | 是否启用代理                                      | `true / false`                                                                                |
| `ohMyCommit.proxy.url`                 | string | "http://localhost:7890"   | 代理服务器地址                                | 任意有效的代理URL（如 "http://localhost:7890"）                                                         |

## 贡献指南

欢迎贡献代码！请查看我们的 [贡献指南](CONTRIBUTING.md) 了解详情。

## 支持

如果你遇到任何问题或有建议，请：

1. 查看 [常见问题](docs/guide/faq.md)
2. 提交 [Issue](https://github.com/oh-my-commit/oh-my-commit/issues)

## 许可证

Oh My Commit 使用 [MIT + Commons Clause](./LICENSE) 许可证。这意味着：

- ✅ 你可以自由地使用、修改和分发本软件
- ✅ 你可以在个人或内部项���中使用本软件
- ✅ 你可以创建和分发本软件的修改版本
- ❌ 你不能将本软件作为付费服务或产品销售
- ❌ 你不能在未经授权的情况下商业化使用本软件

如果你想在商业环境中使用 Oh My Commit，请联系我们获取商业授权。

详细条款请查看 [LICENSE](./LICENSE) 文件。
